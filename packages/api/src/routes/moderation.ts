import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';
import { requireAuth } from '../auth-utils.js';

const flagSchema = z.object({
  targetId: z.string().uuid(),
  targetType: z.enum(['QUESTION', 'ANSWER', 'COMMENT']),
  reason: z.enum(['SPAM', 'INAPPROPRIATE', 'OFF_TOPIC', 'DUPLICATE', 'LOW_QUALITY']),
  details: z.string().optional(),
});

const resolveFlagSchema = z.object({
  status: z.enum(['REVIEWED', 'DISMISSED']),
  canonicalTargetId: z.string().uuid().optional(),
});

const moderationRoutes: FastifyPluginAsync = async (fastify) => {
  // Public endpoint to create flags (any authenticated user)
  fastify.register(fp(async (fastify) => {
    fastify.addHook('preHandler', async (req, reply) => {
      try {
        await req.jwtVerify();
      } catch (err) {
        return reply.send(err);
      }
    });

    // Create a flag
    fastify.post('/flags', async (req, reply) => {
      const result = flagSchema.safeParse(req.body);
      if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
      
      const { targetId, targetType, reason, details } = result.data;
      // @ts-ignore
      const reporterId = (req as any).user.sub;

      const flag = await fastify.prisma.flag.create({
        data: {
          reporterId,
          targetId,
          targetType: targetType as any,
          reason: reason as any,
          details,
        },
      });

      // Auto-action check: If a target receives multiple flags, auto-hide it.
      const flagCount = await fastify.prisma.flag.count({
        where: { targetId, status: 'PENDING' },
      });

      if (flagCount >= 3) {
        if (targetType === 'QUESTION') {
          await fastify.prisma.question.update({
            where: { id: targetId },
            data: { status: 'LOCKED' },
          }).catch(() => {});
        } else if (targetType === 'ANSWER') {
          await fastify.prisma.answer.update({
            where: { id: targetId },
            data: { status: 'FLAGGED' },
          }).catch(() => {});
        }
      }

      return reply.status(201).send(flag);
    });
  }));

  // Moderator/Admin only endpoints
  fastify.register(fp(async (fastify) => {
    fastify.addHook('preHandler', async (req, reply) => {
      const authUser = await requireAuth(req, reply);
      if (!authUser) return;

      const user = await fastify.prisma.user.findUnique({
        where: { id: authUser.sub },
        select: { role: true }
      });

      if (!user || (user.role !== 'MODERATOR' && user.role !== 'ADMIN')) {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
    });

    // List pending flags (Moderators/Admins only)
    fastify.get('/flags', async (req, reply) => {
      const flags = await fastify.prisma.flag.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, displayName: true, email: true } }
        }
      });

      return reply.send(flags);
    });

    // Resolve a flag
    fastify.put('/flags/:id', async (req, reply) => {
      const { id } = req.params as { id: string };
      const result = resolveFlagSchema.safeParse(req.body);
      if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });

      const { status, canonicalTargetId } = result.data;
      // @ts-ignore
      const reviewedBy = (req as any).user.sub;

      const flag = await fastify.prisma.flag.findUnique({ where: { id } });
      if (!flag) return reply.status(404).send({ error: 'Flag not found' });

      const updated = await fastify.prisma.flag.update({
        where: { id },
        data: { status, reviewedBy },
      });

      if (status === 'REVIEWED') {
        if (flag.targetType === 'QUESTION') {
          const isDuplicate = flag.reason === 'DUPLICATE' && canonicalTargetId;
          await fastify.prisma.question.update({
            where: { id: flag.targetId },
            data: { 
              status: isDuplicate ? 'DUPLICATE' : 'LOCKED',
              ...(isDuplicate && { canonicalQuestionId: canonicalTargetId })
            },
          }).catch(() => {});

          if (isDuplicate) {
            await fastify.prisma.answer.updateMany({
              where: { questionId: flag.targetId },
              data: { questionId: canonicalTargetId },
            }).catch(() => {});
          }
        } else if (flag.targetType === 'ANSWER') {
          await fastify.prisma.answer.update({
            where: { id: flag.targetId },
            data: { status: 'REMOVED' },
          }).catch(() => {});
        }
      }

      return reply.send(updated);
    });
  }));
};

export default moderationRoutes;
