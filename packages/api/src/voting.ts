import { PrismaClient, VoteTarget, VoteType } from '@prisma/client';

type CastVoteInput = {
  prisma: PrismaClient;
  userId: string;
  targetId: string;
  targetType: VoteTarget;
  voteType: VoteType;
};

const REPUTATION = {
  UP: 15,
  DOWN: 100,
} as const;

function impact(voteType: VoteType, weight: number): number {
  return voteType === 'UP' ? weight : -weight;
}

async function targetExists(prisma: PrismaClient, targetId: string, targetType: VoteTarget): Promise<boolean> {
  if (targetType === 'QUESTION') {
    const question = await prisma.question.findUnique({ where: { id: targetId }, select: { id: true } });
    return Boolean(question);
  }

  const answer = await prisma.answer.findUnique({ where: { id: targetId }, select: { id: true } });
  return Boolean(answer);
}

async function applyScoreDelta(
  prisma: PrismaClient,
  targetId: string,
  targetType: VoteTarget,
  scoreDelta: number,
) {
  if (scoreDelta === 0) return;

  if (targetType === 'QUESTION') {
    await prisma.question.update({
      where: { id: targetId },
      data: { voteScore: { increment: scoreDelta } },
    });
    return;
  }

  await prisma.answer.update({
    where: { id: targetId },
    data: { voteScore: { increment: scoreDelta } },
  });
}

export async function castVote({ prisma, userId, targetId, targetType, voteType }: CastVoteInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { statusCode: 401, body: { error: 'User not found' } };
  }

  if (voteType === 'UP' && user.reputationScore < REPUTATION.UP) {
    return { statusCode: 403, body: { error: 'Insufficient reputation to upvote' } };
  }

  if (voteType === 'DOWN' && user.reputationScore < REPUTATION.DOWN) {
    return { statusCode: 403, body: { error: 'Insufficient reputation to downvote' } };
  }

  if (!(await targetExists(prisma, targetId, targetType))) {
    return {
      statusCode: 404,
      body: { error: targetType === 'QUESTION' ? 'Question not found' : 'Answer not found' },
    };
  }

  const weight = user.role === 'EXPERT' ? 3 : 1;
  const existingVote = await prisma.vote.findFirst({
    where: { userId, targetId, targetType },
  });

  let scoreDelta = impact(voteType, weight);
  let action: 'added' | 'changed' | 'removed' = 'added';
  let currentVote: VoteType | null = voteType;

  if (existingVote) {
    const previousImpact = impact(existingVote.voteType, existingVote.weight);
    const nextImpact = impact(voteType, weight);

    if (existingVote.voteType === voteType && existingVote.weight === weight) {
      await prisma.vote.delete({ where: { id: existingVote.id } });
      scoreDelta = -previousImpact;
      action = 'removed';
      currentVote = null;
    } else {
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { voteType, weight },
      });
      scoreDelta = nextImpact - previousImpact;
      action = 'changed';
    }
  } else {
    await prisma.vote.create({
      data: { userId, targetId, targetType, voteType, weight },
    });
  }

  await applyScoreDelta(prisma, targetId, targetType, scoreDelta);

  return {
    statusCode: 200,
    body: {
      success: true,
      action,
      targetId,
      targetType,
      currentVote,
      scoreDelta,
    },
  };
}
