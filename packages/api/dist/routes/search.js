import { z } from 'zod';
// Validation schema for search query
const searchSchema = z.object({
    q: z.string().min(1),
    tags: z.array(z.string()).optional(),
    phase: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    status: z.enum(['open', 'answered', 'accepted', 'duplicate', 'locked']).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});
const searchRoutes = async (fastify) => {
    // ----- Search Questions ------------------------------------------------
    fastify.get('/', async (req, reply) => {
        const result = searchSchema.safeParse(req.query);
        if (!result.success)
            return reply.status(400).send({ error: 'Invalid query parameters' });
        const { q, tags, phase, status, limit } = result.data;
        const where = {
            author: { isShadowBanned: false }
        };
        // Full-text search using Prisma contains
        where.OR = [
            { title: { contains: q, mode: 'insensitive' } },
            { bodyMarkdown: { contains: q, mode: 'insensitive' } },
        ];
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
        const questions = await fastify.prisma.question.findMany({
            where,
            take: limit,
            include: { tags: { include: { tag: true } } },
            orderBy: { voteScore: 'desc' },
        });
        // Simple scoring – could be expanded with ES relevance
        const results = questions.map((question) => ({
            id: question.id,
            title: question.title,
            bodySnippet: question.bodyMarkdown.slice(0, 200) + '...',
            score: question.voteScore,
            tags: question.tags.map((qt) => qt.tag.name),
        }));
        return reply.send({ results });
    });
};
export default searchRoutes;
