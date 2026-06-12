import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// Simple schema validation with Zod
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register endpoint
  fastify.post('/register', async (req, reply) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
    const { email, password, displayName } = result.data;

    // Check if user exists
    const existing = await fastify.prisma.user.findUnique({ where: { email } });
    if (existing) return reply.status(409).send({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await fastify.prisma.user.create({
      data: { email, passwordHash: hash, displayName, role: 'CONTRIBUTOR' },
    });
    const token = fastify.jwt.sign({ sub: user.id, role: user.role });
    return reply.send({ token, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } });
  });

  // Login endpoint
  fastify.post('/login', async (req, reply) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) return reply.status(400).send({ error: 'Invalid payload' });
    const { email, password } = result.data;
    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) return reply.status(401).send({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.passwordHash ?? '');
    if (!match) return reply.status(401).send({ error: 'Invalid credentials' });
    const token = fastify.jwt.sign({ sub: user.id, role: user.role });
    return reply.send({ token, user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role } });
  });

  // Protected profile endpoint – requires JWT
  fastify.register(fp(async (fastify) => {
    fastify.addHook('preHandler', async (req, reply) => {
      try {
        await req.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    });

    fastify.get('/me', async (req, reply) => {
      // @ts-ignore – jwt payload is attached to request.user
      const userId = (req as any).user.sub;
      const user = await fastify.prisma.user.findUnique({ where: { id: userId } });
      if (!user) return reply.status(404).send({ error: 'User not found' });
      return reply.send({ id: user.id, email: user.email, displayName: user.displayName, role: user.role });
    });
  }));
};

export default authRoutes;
