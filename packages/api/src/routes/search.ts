import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { hybridSearch, findDuplicates } from '../utils/nlpUtils.js';

// Validation schema for search query
const searchSchema = z.object({
  q: z.string().min(1),
  tags: z.array(z.string()).optional(),
  phase: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  status: z.enum(['open', 'answered', 'accepted', 'duplicate', 'locked']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  searchType: z.enum(['hybrid', 'keyword', 'semantic']).optional().default('hybrid'),
});

const searchRoutes: FastifyPluginAsync = async (fastify) => {
  // ----- Search Questions with NLP ------------------------------------------------
  fastify.get('/', async (req, reply) => {
    const result = searchSchema.safeParse(req.query as Record<string, string>);
    if (!result.success) return reply.status(400).send({ error: 'Invalid query parameters' });
    const { q, tags, phase, status, limit, searchType } = result.data;

    const where: any = {
      author: { isShadowBanned: false }
    };

    // Filter by tags (array of tag names)
    if (tags && tags.length > 0) {
      where.tags = { some: { tag: { name: { in: tags } } } };
    }

    // Filter by phase
    if (phase) {
      where.phaseLevel = phase.toUpperCase();
    }

    // Filter by status
    if (status) {
      where.status = status.toUpperCase();
    }

    // Fetch all matching questions first
    const questions = await fastify.prisma.question.findMany({
      where,
      include: { tags: { include: { tag: true } } },
      orderBy: { voteScore: 'desc' },
      take: limit * 2, // Fetch more to allow for NLP re-ranking
    });

    // Transform to FAQ format for NLP processing
    const faqs = questions.map((q: any) => ({
      id: q.id,
      question: q.title,
      answer: q.bodyMarkdown,
    }));

    // Perform NLP search
    let searchResults: any[] = [];
    if (searchType === 'hybrid' || searchType === 'semantic') {
      searchResults = hybridSearch(q, faqs).slice(0, limit);
    } else {
      // Keyword search (fallback to original behavior)
      searchResults = questions.slice(0, limit).map((question: any) => ({
        id: question.id,
        question: question.title,
        answer: question.bodyMarkdown.slice(0, 200) + '...',
      }));
    }

    // Enrich results with full question data
    const results = searchResults.map((result: any) => {
      const fullQuestion = questions.find((q: any) => q.id === result.id);
      return {
        id: result.id,
        title: result.question,
        bodySnippet: result.answer.slice(0, 200) + '...',
        relevanceScore: result.score || result.similarity,
        score: fullQuestion?.voteScore || 0,
        tags: fullQuestion?.tags?.map((qt: any) => qt.tag.name) || [],
      };
    });

    return reply.send({ 
      results,
      searchType,
      total: results.length 
    });
  });

  // ----- Duplicate Detection ------------------------------------------------
  fastify.post('/check-duplicates', async (req, reply) => {
    try {
      const { threshold = 0.75, limit = 100 } = req.body as { threshold?: number; limit?: number };

      // Fetch recent questions
      const questions = await fastify.prisma.question.findMany({
        select: {
          id: true,
          title: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      const faqs = questions.map(q => ({
        id: q.id,
        question: q.title,
      }));

      // Find duplicates
      const duplicates = findDuplicates(faqs, threshold);

      return reply.send({
        success: true,
        duplicatesFound: duplicates.length > 0,
        count: duplicates.length,
        duplicates: duplicates.map(dup => ({
          question1: faqs.find(f => f.id === dup.faq1)?.question,
          question2: faqs.find(f => f.id === dup.faq2)?.question,
          id1: dup.faq1,
          id2: dup.faq2,
          similarity: (dup.similarity * 100).toFixed(0) + '%',
        })),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Duplicate check failed' });
    }
  });
};

export default searchRoutes;