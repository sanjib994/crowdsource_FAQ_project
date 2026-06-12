import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const aiRoutes: FastifyPluginAsync = async (fastify) => {
  
  // 11.1 AI-Generated Summaries
  // Auto-summarize long-form answers into concise takeaways
  fastify.post('/answers/:id/summarize', async (req, reply) => {
    const { id } = req.params as { id: string };
    const answer = await fastify.prisma.answer.findUnique({ where: { id } });
    if (!answer) return reply.status(404).send({ error: 'Answer not found' });

    // Placeholder for actual LLM call
    const simulatedSummary = `AI Summary: This answer explains the core concepts clearly in ${answer.bodyMarkdown.split(' ').length} words.`;

    const updated = await fastify.prisma.answer.update({
      where: { id },
      data: {
        shortFormSummary: simulatedSummary,
        aiModelUsed: 'gemini-1.5-pro',
        // isAIGenerated refers to the summary, but the schema uses it for the whole answer
        // We will just update the summary here.
      }
    });

    return reply.send(updated);
  });

  // 11.4 Hybrid Self-Improvement
  // AI periodically reviews low-scoring answers and suggests improvements
  fastify.post('/jobs/analyze-low-scoring', async (req, reply) => {
    // Find answers with negative votes or low confidence
    const lowAnswers = await fastify.prisma.answer.findMany({
      where: { voteScore: { lt: 0 } },
      take: 5
    });

    const suggestions = [];
    for (const ans of lowAnswers) {
      // Create an AI Suggestion
      const suggestion = await fastify.prisma.aISuggestion.create({
        data: {
          type: 'ANSWER_IMPROVEMENT',
          targetId: ans.id,
          suggestedContent: `Suggested edit for clarity and formatting. Please review. (AI Generated replacement text...)`,
        }
      });
      suggestions.push(suggestion);
    }
    return reply.send({ success: true, created: suggestions.length, suggestions });
  });

  // AI identifies gaps in FAQ coverage (simulated)
  fastify.post('/jobs/analyze-gaps', async (req, reply) => {
    // In reality, this would group failed search queries.
    // Simulating the creation of a gap-fill suggestion.
    const suggestion = await fastify.prisma.aISuggestion.create({
      data: {
        type: 'GAP_FILL',
        suggestedContent: `Many users searched for "billing cycle" but found no results. Suggested new FAQ Question: "How does the monthly billing cycle work?"`,
      }
    });
    return reply.send({ success: true, suggestion });
  });

  // Human Reviewer endpoints for AI Suggestions
  fastify.get('/suggestions', async (req, reply) => {
    const pending = await fastify.prisma.aISuggestion.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    });
    return reply.send(pending);
  });

  // Approve AI suggestion
  fastify.put('/suggestions/:id/approve', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    // Auth check - Moderator/Admin only (simplified here)
    const reviewerId = (req as any).user?.sub;

    const suggestion = await fastify.prisma.aISuggestion.findUnique({ where: { id } });
    if (!suggestion) return reply.status(404).send({ error: 'Not found' });

    // Apply the suggestion
    if (suggestion.type === 'ANSWER_IMPROVEMENT' && suggestion.targetId) {
      await fastify.prisma.answer.update({
        where: { id: suggestion.targetId },
        data: { bodyMarkdown: suggestion.suggestedContent }
      });
    } else if (suggestion.type === 'GAP_FILL' || suggestion.type === 'NEW_FAQ') {
      // Create a new drafted question
      await fastify.prisma.question.create({
        data: {
          authorId: reviewerId || 'system',
          title: 'AI Suggested FAQ',
          bodyMarkdown: suggestion.suggestedContent,
          status: 'OPEN'
        }
      });
    }

    const updated = await fastify.prisma.aISuggestion.update({
      where: { id },
      data: { status: 'APPROVED', reviewedBy: reviewerId }
    });

    return reply.send(updated);
  });
};

export default aiRoutes;
