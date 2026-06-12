import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import { prisma } from './prisma.js';
import authRoutes from './routes/auth.js';
import questionsRoutes from './routes/questions.js';
import answersRoutes from './routes/answers.js';
import voteRoutes from './routes/vote.js';
import tagRoutes from './routes/tags.js';
import searchRoutes from './routes/search.js';
import moderationRoutes from './routes/moderation.js';
import usersRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import analyticsRoutes from './routes/analytics.js';
import faqRoutes from './routes/faqs.js';
import ticketRoutes from './routes/tickets.js';
import dashboardRoutes from './routes/dashboard.js';
import leaderboardRoutes from './routes/leaderboard.js';
const server = Fastify({ logger: true });

const start = async () => {
  try {
    // CORS – stricter in production
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    await server.register(fastifyCors, { 
      origin: corsOrigin === '*' ? true : corsOrigin.split(','), 
      credentials: true 
    });

    // JWT plugin – secret from env
    await server.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || 'dev-secret',
      sign: { expiresIn: '7d' },
    });

    // Rate Limiting plugin
    await server.register(fastifyRateLimit, {
      max: 100,
      timeWindow: '1 minute',
      allowList: ['127.0.0.1'], // exclude localhost loopback
    });

    // Add a decorator to access Prisma easily
    server.decorate('prisma', prisma);

    // Register auth routes (login, register, profile)
    await server.register(authRoutes, { prefix: '/auth' });

    // Register question routes (CRUD operations)
    await server.register(questionsRoutes, { prefix: '/questions' });

    // Register answer routes (CRUD operations)
    await server.register(answersRoutes, { prefix: '/answers' });

    // Register vote routes
    await server.register(voteRoutes, { prefix: '/vote' });

    // Register tag routes
    await server.register(tagRoutes, { prefix: '/tags' });

    // Register search routes
    await server.register(searchRoutes, { prefix: '/search' });

    // Register moderation routes
    await server.register(moderationRoutes, { prefix: '/moderation' });

    // Register users routes
    await server.register(usersRoutes, { prefix: '/users' });

    // Register AI/Intelligence routes
    await server.register(aiRoutes, { prefix: '/ai' });

    // Register Analytics/Dashboard routes
    await server.register(analyticsRoutes, { prefix: '/analytics' });

    // Register FAQ routes
    await server.register(faqRoutes, { prefix: '/faqs' });

    // Register Ticket routes
    await server.register(ticketRoutes, { prefix: '/tickets' });

    // Register Dashboard routes
    await server.register(dashboardRoutes, { prefix: '/dashboard' });

    // Register Leaderboard routes
    await server.register(leaderboardRoutes, { prefix: '/leaderboard' });

    await server.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' });
    server.log.info(`🚀 Server listening on ${server.server.address()}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
