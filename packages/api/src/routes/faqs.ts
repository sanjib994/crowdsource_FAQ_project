import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';
import { requireAuth } from '../auth-utils.js';

// Validation schemas
const createFaqSchema = z.object({
  category: z.enum(['REGISTRATION', 'TECHNICAL', 'EVENTS', 'GENERAL']),
  question: z.string().min(5),
  answer: z.string().min(20),
});

const updateFaqSchema = z.object({
  category: z.enum(['REGISTRATION', 'TECHNICAL', 'EVENTS', 'GENERAL']).optional(),
  question: z.string().min(5).optional(),
  answer: z.string().min(20).optional(),
});

const faqRoutes: FastifyPluginAsync = async (fastify) => {
  // ----- List all FAQs (public) -------------------------------------------
  fastify.get('/', async (req, reply) => {
    const faqs = await fastify.prisma.fAQ.findMany({
      orderBy: { viewCount: 'desc' },
    });
    return reply.send(faqs);
  });

  // ----- Get FAQ by ID (public) -------------------------------------------
  fastify.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const faq = await fastify.prisma.fAQ.findUnique({
      where: { id },
    });
    if (!faq) return reply.status(404).send({ error: 'FAQ not found' });
    
    // Increment view count
    await fastify.prisma.fAQ.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
    
    return reply.send(faq);
  });

  // ----- Admin: Create FAQ (requires admin role) --------------------------
  fastify.register(fp(async (fastify) => {
    fastify.addHook('preHandler', async (req, reply) => {
      const authUser = await requireAuth(req, reply);
      if (!authUser) return;
      
      // Check if user is ADMIN or MODERATOR
      const user = await fastify.prisma.user.findUnique({
        where: { id: authUser.sub },
        select: { role: true }
      });
      
      if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
        return reply.status(403).send({ error: 'Insufficient permissions' });
      }
    });

    fastify.post('/', async (req, reply) => {
      const result = createFaqSchema.safeParse(req.body);
      if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
      
      const { category, question, answer } = result.data;
      const faq = await fastify.prisma.fAQ.create({
        data: { category, question, answer },
      });
      
      return reply.status(201).send(faq);
    });

    // ----- Admin: Update FAQ -----------------------------------------------
    fastify.put('/:id', async (req, reply) => {
      const { id } = req.params as { id: string };
      const result = updateFaqSchema.safeParse(req.body);
      if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
      
      const existing = await fastify.prisma.fAQ.findUnique({ where: { id } });
      if (!existing) return reply.status(404).send({ error: 'FAQ not found' });
      
      const updated = await fastify.prisma.fAQ.update({
        where: { id },
        data: result.data,
      });
      
      return reply.send(updated);
    });

    // ----- Admin: Delete FAQ -----------------------------------------------
    fastify.delete('/:id', async (req, reply) => {
      const { id } = req.params as { id: string };
      
      const existing = await fastify.prisma.fAQ.findUnique({ where: { id } });
      if (!existing) return reply.status(404).send({ error: 'FAQ not found' });
      
      await fastify.prisma.fAQ.delete({ where: { id } });
      return reply.status(204).send();
    });
  }));
};

export default faqRoutes;
