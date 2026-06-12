import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';
import { requireAuth } from '../auth-utils.js';

// Validation schemas
const createTicketSchema = z.object({
  questionText: z.string().min(10),
  attachmentUrl: z.string().url().optional(),
  linkedFaqId: z.string().uuid().optional(),
});

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'CLAIMED', 'RESOLVED']).optional(),
  linkedFaqId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
});

const ticketRoutes: FastifyPluginAsync = async (fastify) => {
  // ----- List all tickets (admin/moderator) --------------------------------
  fastify.register(fp(async (fastify) => {
    fastify.addHook('preHandler', async (req, reply) => {
      const authUser = await requireAuth(req, reply);
      if (!authUser) return;
      
      const user = await fastify.prisma.user.findUnique({
        where: { id: authUser.sub },
        select: { role: true }
      });
      
      if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
    });

    fastify.get('/', async (req, reply) => {
      const tickets = await fastify.prisma.ticket.findMany({
        include: {
          raisedBy: { select: { id: true, displayName: true, email: true } },
          assignedTo: { select: { id: true, displayName: true, email: true } },
          linkedFaq: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return reply.send(tickets);
    });
  }));

  // ----- Get user's tickets (authenticated users) ---------------------------
  fastify.register(fp(async (fastify) => {
    fastify.addHook('preHandler', async (req, reply) => {
      try {
        await req.jwtVerify();
      } catch (err) {
        return reply.send(err);
      }
    });

    fastify.get('/my', async (req, reply) => {
      // @ts-ignore
      const userId = (req as any).user.sub;
      const tickets = await fastify.prisma.ticket.findMany({
        where: { raisedById: userId },
        include: {
          raisedBy: { select: { id: true, displayName: true, email: true } },
          assignedTo: { select: { id: true, displayName: true, email: true } },
          linkedFaq: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return reply.send(tickets);
    });

    // ----- Create Ticket (authenticated users) -----
    fastify.post('/', async (req, reply) => {
      const result = createTicketSchema.safeParse(req.body);
      if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
      
      // @ts-ignore
      const userId = (req as any).user.sub;
      const { questionText, attachmentUrl, linkedFaqId } = result.data;
      
      const ticket = await fastify.prisma.ticket.create({
        data: {
          raisedById: userId,
          questionText,
          attachmentUrl,
          linkedFaqId,
          status: 'OPEN',
        },
        include: {
          raisedBy: { select: { id: true, displayName: true, email: true } },
          linkedFaq: true,
        },
      });
      
      return reply.status(201).send(ticket);
    });

    // ----- Get ticket by ID ------------------------------------------------
    fastify.get('/:id', async (req, reply) => {
      const { id } = req.params as { id: string };
      // @ts-ignore
      const userId = (req as any).user.sub;
      
      const ticket = await fastify.prisma.ticket.findUnique({
        where: { id },
        include: {
          raisedBy: { select: { id: true, displayName: true, email: true } },
          assignedTo: { select: { id: true, displayName: true, email: true } },
          linkedFaq: true,
        },
      });
      
      if (!ticket) return reply.status(404).send({ error: 'Ticket not found' });
      
      // Users can only view their own tickets unless admin
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      
      if (ticket.raisedById !== userId && user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
      
      return reply.send(ticket);
    });

    // ----- Update Ticket (admin only for status/assignment) ---------------
    fastify.put('/:id', async (req, reply) => {
      const { id } = req.params as { id: string };
      // @ts-ignore
      const userId = (req as any).user.sub;
      
      const result = updateTicketSchema.safeParse(req.body);
      if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
      
      const ticket = await fastify.prisma.ticket.findUnique({ where: { id } });
      if (!ticket) return reply.status(404).send({ error: 'Ticket not found' });
      
      // Check permissions: user can update own ticket's linkedFaqId, admin can update anything
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      
      const isAdmin = user?.role === 'ADMIN' || user?.role === 'MODERATOR';
      const isOwner = ticket.raisedById === userId;
      
      if (!isAdmin && (!isOwner || result.data.status)) {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
      
      const updated = await fastify.prisma.ticket.update({
        where: { id },
        data: result.data,
        include: {
          raisedBy: { select: { id: true, displayName: true, email: true } },
          assignedTo: { select: { id: true, displayName: true, email: true } },
          linkedFaq: true,
        },
      });
      
      return reply.send(updated);
    });

    // ----- Delete Ticket (owner or admin) -----------------------------------
    fastify.delete('/:id', async (req, reply) => {
      const { id } = req.params as { id: string };
      // @ts-ignore
      const userId = (req as any).user.sub;
      
      const ticket = await fastify.prisma.ticket.findUnique({ where: { id } });
      if (!ticket) return reply.status(404).send({ error: 'Ticket not found' });
      
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      
      const isAdmin = user?.role === 'ADMIN' || user?.role === 'MODERATOR';
      const isOwner = ticket.raisedById === userId;
      
      if (!isAdmin && !isOwner) {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
      
      await fastify.prisma.ticket.delete({ where: { id } });
      return reply.status(204).send();
    });
  }));
};

export default ticketRoutes;
