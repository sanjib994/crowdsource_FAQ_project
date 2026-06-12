import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

// Validation schemas
const createTagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
});

const tagRoutes: FastifyPluginAsync = async (fastify) => {
  // ----- Create Tag ------------------------------------------------------
  fastify.post('/', async (req, reply) => {
    const result = createTagSchema.safeParse(req.body);
    if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
    const { name, slug, description } = result.data;
    const tag = await fastify.prisma.tag.create({
      data: {
        name,
        slug: slug ?? name.toLowerCase().replace(/\s+/g, '-'),
        description,
      },
    });
    return reply.status(201).send(tag);
  });

  // ----- List all tags ---------------------------------------------------
  fastify.get('/', async () => {
    const tags = await fastify.prisma.tag.findMany({ orderBy: { name: 'asc' } });
    return tags;
  });

  // ----- Get tag by slug -------------------------------------------------
  fastify.get('/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string };
    const tag = await fastify.prisma.tag.findUnique({
      where: { slug },
      include: { questions: { include: { question: true } } },
    });
    if (!tag) return reply.status(404).send({ error: 'Tag not found' });
    return tag;
  });

  // ----- Add tag to a question (many-to-many) ---------------------------
  fastify.post('/questions/:questionId', async (req, reply) => {
    const { questionId } = req.params as { questionId: string };
    const result = createTagSchema.safeParse(req.body);
    if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
    const { name } = result.data;

    // Find or create tag
    const tag = await fastify.prisma.tag.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      },
    });

    // Link to question
    await fastify.prisma.questionTag.create({
      data: { questionId, tagId: tag.id },
    });

    // Update tag question count
    await fastify.prisma.tag.update({
      where: { id: tag.id },
      data: { questionCount: { increment: 1 } },
    });

    return reply.send(tag);
  });
};

export default tagRoutes;