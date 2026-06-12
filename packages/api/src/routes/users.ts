import { FastifyPluginAsync } from 'fastify';

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  // ----- Get Public User Profile ------------------------------------------
  fastify.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    const user = await fastify.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        role: true,
        reputationScore: true,
        startDate: true,
        badges: {
          include: {
            badge: true
          }
        },
        _count: {
          select: {
            questions: true,
            answers: true
          }
        }
      }
    });

    if (!user) return reply.status(404).send({ error: 'User not found' });
    return reply.send(user);
  });
};

export default usersRoutes;
