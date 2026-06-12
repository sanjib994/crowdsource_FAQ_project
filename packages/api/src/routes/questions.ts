import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../auth-utils.js';
import { castVote } from '../voting.js';

// Validation schemas
const createSchema = z.object({
  title: z.string().min(5),
  body: z.string().min(10),
  tags: z.array(z.string()).optional(),
});

const updateSchema = z.object({
  title: z.string().min(5).optional(),
  body: z.string().min(10).optional(),
  tags: z.array(z.string()).optional(),
});

const questionRoutes: FastifyPluginAsync = async (fastify) => {
  // ----- List Questions (simple alternative to /search) ------------------
  fastify.get('/', async (req, reply) => {
    const questions = await fastify.prisma.question.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { tags: { include: { tag: true } } },
      where: {
        author: { isShadowBanned: false }
      }
    });
    return reply.send(questions);
  });

  // ----- Create Question ---------------------------------------------------
  fastify.post('/', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 hour'
      }
    }
  }, async (req, reply) => {
    const authUser = await requireAuth(req, reply);
    if (!authUser) return;

    const result = createSchema.safeParse(req.body);
    if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
    const { title, body, tags } = result.data;

    // ---- Duplicate detection placeholder (simulating NLP) ----------------
    // Extract significant keywords from title
    const keywords = title.toLowerCase().split(/\W+/).filter(w => w.length > 4);
    if (keywords.length > 0) {
      const potentialDuplicates = await fastify.prisma.question.findMany({
        where: {
          OR: keywords.map(kw => ({ title: { contains: kw, mode: 'insensitive' } }))
        },
        select: { id: true, title: true },
        take: 10
      });

      // Simple heuristic: if 2 or more keywords overlap (or 100% if only 1 keyword)
      const matches = potentialDuplicates.filter((q: any) => {
        const qKeywords = q.title.toLowerCase().split(/\W+/);
        const matchCount = keywords.filter(kw => qKeywords.some((qw: any) => qw.includes(kw) || kw.includes(qw))).length;
        return matchCount >= Math.min(2, keywords.length);
      });

      if (matches.length > 0) {
        return reply.status(409).send({ error: 'Possible duplicates found', duplicates: matches });
      }
    }

    // ---- Spam detection ---------------------------------------------------
    const urlCount = (body.match(/https?:\/\/[^\s]+/g) || []).length;
    if (urlCount > 3) {
      return reply.status(400).send({ error: 'Too many links. Spam detected.' });
    }
    
    // Check for repetitive content
    const words = body.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 20 && uniqueWords.size / words.length < 0.3) {
      return reply.status(400).send({ error: 'Highly repetitive content. Spam detected.' });
    }

    // Trust & Reputation Gating
    const userId = authUser.sub;
    let initialStatus = 'OPEN';
    let requiresApproval = false;
    
    const user = await fastify.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.status(401).send({ error: 'User not found' });
    if (user.reputationScore < 10) {
      initialStatus = 'LOCKED';
      requiresApproval = true;
    }

    // Create the question record
    const question = await fastify.prisma.question.create({
      data: {
        title,
        bodyMarkdown: body,
        status: initialStatus as any,
        author: { connect: { id: userId } },
        // Tags handling – create missing tags and link via QuestionTag
        ...(tags && tags.length > 0
          ? {
              tags: {
                create: tags.map((t) => ({
                  tag: {
                    connectOrCreate: {
                      where: { name: t },
                      create: { name: t, slug: t.toLowerCase().replace(/\s+/g, '-') },
                    },
                  },
                })),
              },
            }
          : {}),
      },
      include: { tags: { include: { tag: true } } },
    });

    if (requiresApproval) {
      await fastify.prisma.flag.create({
        data: {
          reporterId: userId,
          targetId: question.id,
          targetType: 'QUESTION',
          reason: 'LOW_QUALITY', // or SPAM, just using an existing enum
          details: 'Automated flag: Question requires moderation approval due to low reputation.',
        }
      }).catch(() => {});
    }

    return reply.status(201).send(question);
  });

  // ----- Get a single question (with Best Answer Isolation) --------------
  fastify.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const question = await fastify.prisma.question.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } }, answers: true },
    });
    if (!question) return reply.status(404).send({ error: 'Not found' });

    // 11.3 Best Answer Isolation
    if (question.answers && question.answers.length > 0) {
      // Calculate composite score for each answer
      // expert verification > vote count > recency > AI confidence
      const scoredAnswers = question.answers.map((a: any) => {
        let score = a.voteScore * 10;
        if (a.isExpertVerified) score += 500;
        if (a.isAccepted) score += 1000;
        score += a.confidenceScore; // add AI confidence
        
        // Recency bonus: slightly favor newer answers if scores are close
        const ageDays = (Date.now() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        score -= ageDays * 0.1;
        
        return { ...a, _compositeScore: score };
      });

      // Sort descending by composite score
      scoredAnswers.sort((a: any, b: any) => b._compositeScore - a._compositeScore);

      const bestAnswer = scoredAnswers[0];
      const otherAnswers = scoredAnswers.slice(1);

      return reply.send({
        ...question,
        answers: undefined, // hide raw answers array
        bestAnswer,
        otherAnswers
      });
    }

    return reply.send(question);
  });

  // ----- Update a question -------------------------------------------------
  fastify.put('/:id', async (req, reply) => {
    const authUser = await requireAuth(req, reply);
    if (!authUser) return;

    const { id } = req.params as { id: string };
    const result = updateSchema.safeParse(req.body);
    if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
    const { title, body, tags } = result.data;

    // Simple permission check – author or 500+ rep
    const existing = await fastify.prisma.question.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'Not found' });
    
    const userId = authUser.sub;
    if (userId !== existing.authorId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.reputationScore < 500) {
        return reply.status(403).send({ error: 'Forbidden. Need 500 reputation to edit others.' });
      }
    }

    const updated = await fastify.prisma.question.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(body && { bodyMarkdown: body }),
        // Tag sync – replace current tags with the supplied list
        ...(tags && {
          tags: {
            deleteMany: {}, // remove all existing relations
            create: tags.map((t) => ({
              tag: {
                connectOrCreate: {
                  where: { name: t },
                  create: { name: t, slug: t.toLowerCase().replace(/\s+/g, '-') },
                },
              },
            })),
          },
        }),
      },
      include: { tags: { include: { tag: true } } },
    });
    return reply.send(updated);
  });

  // ----- Delete a question -------------------------------------------------
  fastify.delete('/:id', async (req, reply) => {
    const authUser = await requireAuth(req, reply);
    if (!authUser) return;

    const { id } = req.params as { id: string };
    const existing = await fastify.prisma.question.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'Not found' });
    // Permission check – author or moderator (simplified)
    // @ts-ignore
    const user = await fastify.prisma.user.findUnique({ where: { id: authUser.sub } });
    if (existing.authorId !== authUser.sub && user?.role !== 'MODERATOR' && user?.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    await fastify.prisma.question.delete({ where: { id } });
    return reply.send({ success: true });
  });

  // ----- Submit an answer for a question (REST alias) ----------------------
  fastify.post('/:id/answers', async (req, reply) => {
    const authUser = await requireAuth(req, reply);
    if (!authUser) return;

    const { id } = req.params as { id: string };
    
    // Instead of re-implementing, we could ideally extract the logic, but for now we forward.
    // The easiest way without extracting the function is to just validate the body and insert.
    // Or we simply require the client to use `/answers`. Since we need to fulfill the checklist strictly:
    const bodyObj = req.body as any;
    bodyObj.questionId = id; // inject questionId into body
    // Simulate forwarding to POST /answers
    // Since fastify.inject is complex inside a route, we just do the basic create here:
    const { body, isAIGenerated } = bodyObj;
    if (!body || body.length < 10) return reply.status(400).send({ error: 'Body too short' });

    const question = await fastify.prisma.question.findUnique({ where: { id }, select: { id: true } });
    if (!question) return reply.status(404).send({ error: 'Question not found' });

    const userId = authUser.sub;

    let initialStatus = 'PUBLISHED';
    if (body.length < 50 && !body.includes('```')) initialStatus = 'PENDING_REVIEW';

    const answer = await fastify.prisma.answer.create({
      data: {
        questionId: id,
        authorId: userId,
        bodyMarkdown: body,
        isAIGenerated: isAIGenerated ?? false,
        status: initialStatus as any
      }
    });
    return reply.status(201).send(answer);
  });

  // ----- Vote on a question (REST alias) -----------------------------------
  fastify.post('/:id/vote', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { voteType, value } = req.body as { voteType?: 'UP' | 'DOWN'; value?: number };
    const normalizedVoteType = voteType ?? (value === 1 ? 'UP' : value === -1 ? 'DOWN' : undefined);
    
    if (normalizedVoteType !== 'UP' && normalizedVoteType !== 'DOWN') {
      return reply.status(400).send({ error: 'Invalid voteType' });
    }

    const authUser = await requireAuth(req, reply);
    if (!authUser) return;

    const voteResult = await castVote({
      prisma: fastify.prisma,
      userId: authUser.sub,
      targetId: id,
      targetType: 'QUESTION',
      voteType: normalizedVoteType,
    });

    return reply.status(voteResult.statusCode).send(voteResult.body);
  });
};

export default questionRoutes;
