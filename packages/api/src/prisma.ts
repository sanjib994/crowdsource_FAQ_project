import { PrismaClient } from '@prisma/client';

// Prisma client singleton – reused across Fastify instance
export const prisma = new PrismaClient();
