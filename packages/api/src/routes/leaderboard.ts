import { FastifyPluginAsync } from 'fastify';

const leaderboardRoutes: FastifyPluginAsync = async (fastify) => {
  // ----- Get Leaderboard (public) ------------------------------------------
  fastify.get('/', async (req, reply) => {
    const query = req.query as { period?: string; limit?: string };
    const period = query.period || 'monthly'; // weekly, monthly, alltime
    const limit = Math.min(parseInt(query.limit || '100', 10), 100);
    
    let dateFilter: any = undefined;
    if (period === 'weekly') {
      dateFilter = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === 'monthly') {
      dateFilter = { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }
    
    const leaderboard = await fastify.prisma.user.findMany({
      where: {
        isShadowBanned: false,
      },
      select: {
        id: true,
        displayName: true,
        role: true,
        reputationScore: true,
        spurtiPoints: true,
        avatarUrl: true,
        _count: {
          select: {
            answers: dateFilter ? { where: { createdAt: dateFilter } } : true,
            questions: dateFilter ? { where: { createdAt: dateFilter } } : true,
            badges: true,
          }
        }
      },
      take: limit,
      orderBy: { reputationScore: 'desc' }
    });
    
    // Add rank and transform response
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      ...user,
      answerCount: user._count.answers,
      questionCount: user._count.questions,
      badgeCount: user._count.badges,
    }));
    
    return reply.send({
      period,
      data: rankedLeaderboard,
      total: rankedLeaderboard.length,
    });
  });

  // ----- Get User Rank (public) ------------------------------------------
  fastify.get('/rank/:userId', async (req, reply) => {
    const { userId } = req.params as { userId: string };
    
    const user = await fastify.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        role: true,
        reputationScore: true,
        spurtiPoints: true,
      }
    });
    
    if (!user) return reply.status(404).send({ error: 'User not found' });
    
    // Count how many users have higher reputation
    const usersAhead = await fastify.prisma.user.count({
      where: {
        reputationScore: { gt: user.reputationScore },
        isShadowBanned: false,
      }
    });
    
    return reply.send({
      ...user,
      rank: usersAhead + 1,
    });
  });

  // ----- Get Experts (public) ------------------------------------------
  fastify.get('/experts', async (req, reply) => {
    const query = req.query as { limit?: string };
    const limit = Math.min(parseInt(query.limit || '50', 10), 100);
    
    const experts = await fastify.prisma.user.findMany({
      where: {
        role: 'EXPERT',
        isShadowBanned: false,
      },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        reputationScore: true,
        spurtiPoints: true,
        _count: {
          select: {
            answers: { where: { isExpertVerified: true } },
            badges: true,
          }
        }
      },
      take: limit,
      orderBy: { reputationScore: 'desc' }
    });
    
    const transformedExperts = experts.map((user) => ({
      ...user,
      verifiedAnswerCount: user._count.answers,
      badgeCount: user._count.badges,
    }));
    
    return reply.send(transformedExperts);
  });
};

export default leaderboardRoutes;
