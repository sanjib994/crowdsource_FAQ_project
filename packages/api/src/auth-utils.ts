import { FastifyReply, FastifyRequest } from 'fastify';

export type AuthUser = {
  sub: string;
  role?: string;
};

export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<AuthUser | null> {
  try {
    await req.jwtVerify();
    return (req as any).user as AuthUser;
  } catch {
    reply.status(401).send({ error: 'Unauthenticated' });
    return null;
  }
}

export async function optionalAuth(req: FastifyRequest): Promise<AuthUser | null> {
  try {
    await req.jwtVerify();
    return (req as any).user as AuthUser;
  } catch {
    return null;
  }
}

export async function requireRole(
  req: FastifyRequest,
  reply: FastifyReply,
  roles: string[],
): Promise<AuthUser | null> {
  const authUser = await requireAuth(req, reply);
  if (!authUser) return null;

  if (!authUser.role || !roles.includes(authUser.role)) {
    reply.status(403).send({ error: 'Forbidden' });
    return null;
  }

  return authUser;
}
