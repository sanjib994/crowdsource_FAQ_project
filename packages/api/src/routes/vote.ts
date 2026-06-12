import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../auth-utils.js';
import { castVote } from '../voting.js';

const voteSchema = z.object({
  targetId: z.string().uuid(),
  targetType: z.enum(['QUESTION', 'ANSWER']),
  voteType: z.enum(['UP', 'DOWN']),
});

const voteRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', async (req, reply) => {
    const result = voteSchema.safeParse(req.body);
    if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });

    const authUser = await requireAuth(req, reply);
    if (!authUser) return;

    const voteResult = await castVote({
      prisma: fastify.prisma,
      userId: authUser.sub,
      targetId: result.data.targetId,
      targetType: result.data.targetType,
      voteType: result.data.voteType,
    });

    return reply.status(voteResult.statusCode).send(voteResult.body);
  });
};

export default voteRoutes;
