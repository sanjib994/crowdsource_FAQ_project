import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../auth-utils.js';
import { castVote } from '../voting.js';

// Validation schemas
const createSchema = z.object({
  questionId: z.string().uuid(),
  body: z.string().min(10),
  isAIGenerated: z.boolean().optional(),
});

const updateSchema = z.object({
  body: z.string().min(10).optional(),
  isAIGenerated: z.boolean().optional(),
});

// Calculate Answer Quality Score = f(votes, length, formatting, expert verification)
function calculateQualityScore(body: string, voteScore: number, isExpertVerified: boolean, isAccepted: boolean): number {
  let score = voteScore * 10; // Weight votes heavily
  
  if (isExpertVerified) score += 50;
  if (isAccepted) score += 100;

  // Length factor
  if (body.length > 500) score += 20;
  else if (body.length > 200) score += 10;

  // Formatting factor (basic markdown detection)
  if (body.includes('```')) score += 15; // Code block
  if (body.match(/^[-*]\s/m)) score += 10; // Lists
  if (body.includes('**')) score += 5; // Bold

  return score;
}

const answerRoutes: FastifyPluginAsync = async (fastify) => {
  // ----- Create Answer ---------------------------------------------------
  fastify.post('/', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 hour'
      }
    }
  }, async (req, reply) => {
    const result = createSchema.safeParse(req.body);
    if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
    const { questionId, body, isAIGenerated } = result.data;

    // Permission – must be authenticated (JWT)
    // @ts-ignore – jwt payload attached as user
    const authUser = await requireAuth(req, reply);
    if (!authUser) return;
    const userId = authUser.sub;

    // Ensure question exists
    const question = await fastify.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) return reply.status(404).send({ error: 'Question not found' });

    // Low-quality answer auto-flagging (too short, no formatting)
    let initialStatus = 'PUBLISHED';
    const isLowQuality = body.length < 50 && !body.includes('```') && !body.includes('http');
    if (isLowQuality) {
      initialStatus = 'PENDING_REVIEW';
    }

    const answer = await fastify.prisma.answer.create({
      data: {
        questionId,
        authorId: userId,
        bodyMarkdown: body,
        isAIGenerated: isAIGenerated ?? false,
        status: initialStatus as any, // Cast to AnswerStatus
      },
    });

    // If auto-flagged, create a Flag record for moderators
    if (isLowQuality) {
      await fastify.prisma.flag.create({
        data: {
          reporterId: userId, // Self-reported by system using user ID
          targetId: answer.id,
          targetType: 'ANSWER',
          reason: 'LOW_QUALITY',
          details: 'Automated flag: Answer is very short and lacks formatting.',
        }
      });
    }

    return reply.status(201).send(answer);
  });

  // ----- Get single answer ------------------------------------------------
  fastify.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const answer = await fastify.prisma.answer.findUnique({ where: { id } });
    if (!answer) return reply.status(404).send({ error: 'Answer not found' });
    return reply.send(answer);
  });

  // ----- Update answer ---------------------------------------------------
  fastify.put('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = updateSchema.safeParse(req.body);
    if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
    const { body, isAIGenerated } = result.data;

    const existing = await fastify.prisma.answer.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'Answer not found' });
    // @ts-ignore – JWT payload
    const authUser = await requireAuth(req, reply);
    if (!authUser) return;
    const userId = authUser.sub;

    if (existing.authorId !== userId) {
      const user = await fastify.prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.reputationScore < 500) {
        return reply.status(403).send({ error: 'Forbidden. Need 500 reputation to edit others.' });
      }
    }

    const updated = await fastify.prisma.answer.update({
      where: { id },
      data: {
        ...(body && { bodyMarkdown: body }),
        ...(isAIGenerated !== undefined && { isAIGenerated }),
      },
    });
    return reply.send(updated);
  });

  // ----- Delete answer ---------------------------------------------------
  fastify.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const existing = await fastify.prisma.answer.findUnique({ where: { id } });
    if (!existing) return reply.status(404).send({ error: 'Answer not found' });
    // @ts-ignore – JWT payload
    const authUser = await requireAuth(req, reply);
    if (!authUser) return;
    if (existing.authorId !== authUser.sub) return reply.status(403).send({ error: 'Forbidden' });
    await fastify.prisma.answer.delete({ where: { id } });
    return reply.send({ success: true });
  });

  // ----- List answers for a question -------------------------------------
  fastify.get('/question/:questionId', async (req, reply) => {
    const { questionId } = req.params as { questionId: string };
    const answers = await fastify.prisma.answer.findMany({
      where: { questionId },
      orderBy: { createdAt: 'desc' },
    });
    // Compute confidence for each answer
    const enriched = answers.map((a: any) => ({
      ...a,
      confidenceScore: calculateQualityScore(a.bodyMarkdown, a.voteScore, a.isExpertVerified, a.isAccepted),
    }));
    return reply.send(enriched);
  });

  // ----- Verify answer (Expert/Moderator) --------------------------------
  fastify.put('/:id/verify', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    // @ts-ignore
    const authUser = await requireAuth(req, reply);
    if (!authUser) return;
    const userRole = authUser.role;
    if (userRole !== 'EXPERT' && userRole !== 'MODERATOR' && userRole !== 'ADMIN') {
      return reply.status(403).send({ error: 'Forbidden. Only experts and moderators can verify answers.' });
    }

    const answer = await fastify.prisma.answer.update({
      where: { id },
      data: { isExpertVerified: true },
    });
    return reply.send(answer);
  });
  // ----- Vote on answer (Upvote/Downvote) --------------------------------
  fastify.post('/:id/vote', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { value } = req.body as { value: number }; // 1 or -1
    if (value !== 1 && value !== -1) return reply.status(400).send({ error: 'Invalid vote value' });

    const authUser = await requireAuth(req, reply);
    if (!authUser) return;

    const voteResult = await castVote({
      prisma: fastify.prisma,
      userId: authUser.sub,
      targetId: id,
      targetType: 'ANSWER',
      voteType: value === 1 ? 'UP' : 'DOWN',
    });

    return reply.status(voteResult.statusCode).send(voteResult.body);
  });
};

export default answerRoutes;
