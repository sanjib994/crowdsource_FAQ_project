import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { requireAuth } from '../auth-utils.js';

const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  // ----- User Dashboard (authenticated users) --------------------------------
  fastify.register(fp(async (fastify) => {
    fastify.addHook('preHandler', async (req, reply) => {
      try {
        await req.jwtVerify();
      } catch (err) {
        return reply.send(err);
      }
    });

    fastify.get('/user', async (req, reply) => {
      // @ts-ignore
      const userId = (req as any).user.sub;
      
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
          reputationScore: true,
          spurtiPoints: true,
          _count: {
            select: { questions: true, answers: true, badges: true }
          }
        }
      });
      
      if (!user) return reply.status(404).send({ error: 'User not found' });
      
      // Get recent activity
      const recentQuestions = await fastify.prisma.question.findMany({
        where: { authorId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, createdAt: true, voteScore: true }
      });
      
      const recentAnswers = await fastify.prisma.answer.findMany({
        where: { authorId: userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, questionId: true, createdAt: true, voteScore: true, isAccepted: true }
      });
      
      const badges = await fastify.prisma.userBadge.findMany({
        where: { userId },
        include: { badge: true }
      });
      
      return reply.send({
        user,
        recentQuestions,
        recentAnswers,
        badges,
      });
    });

    // ----- Admin Dashboard ------------------------------------------------
    fastify.get('/admin', async (req, reply) => {
      // @ts-ignore
      const userId = (req as any).user.sub;
      
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      
      if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
      
      // Fetch admin metrics
      const totalUsers = await fastify.prisma.user.count();
      const totalQuestions = await fastify.prisma.question.count();
      const totalAnswers = await fastify.prisma.answer.count();
      const totalFlags = await fastify.prisma.flag.count();
      const pendingFlags = await fastify.prisma.flag.count({ where: { status: 'PENDING' } });
      
      const pendingTickets = await fastify.prisma.ticket.count({ where: { status: 'OPEN' } });
      const resolvedTickets = await fastify.prisma.ticket.count({ where: { status: 'RESOLVED' } });
      
      const shadowBannedUsers = await fastify.prisma.user.count({ where: { isShadowBanned: true } });
      
      // Recent flags for review
      const recentFlags = await fastify.prisma.flag.findMany({
        where: { status: 'PENDING' },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, displayName: true, email: true } }
        }
      });
      
      // Recent tickets
      const recentTickets = await fastify.prisma.ticket.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          raisedBy: { select: { id: true, displayName: true, email: true } },
          assignedTo: { select: { id: true, displayName: true, email: true } }
        }
      });
      
      // Top contributors this month
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const topContributors = await fastify.prisma.user.findMany({
        where: {
          answers: { some: { createdAt: { gte: thirtyDaysAgo } } }
        },
        select: {
          id: true,
          displayName: true,
          role: true,
          reputationScore: true,
          _count: {
            select: { answers: { where: { createdAt: { gte: thirtyDaysAgo } } } }
          }
        },
        take: 10,
        orderBy: { reputationScore: 'desc' }
      });
      
      return reply.send({
        metrics: {
          totalUsers,
          totalQuestions,
          totalAnswers,
          totalFlags,
          pendingFlags,
          pendingTickets,
          resolvedTickets,
          shadowBannedUsers,
        },
        recentFlags,
        recentTickets,
        topContributors,
      });
    });
  }));
};

export default dashboardRoutes;
