FAQ Crowdsource — NLP & AI Implementation Guide
This document combines all Natural Language Processing (NLP) and Artificial Intelligence (AI) implementation details from the FAQ Crowdsource project for future reference.

1. Core NLP & AI Features
1.1 Semantic Search
Functionality: Understands the intent and contextual meaning behind a user's search query rather than just matching exact keywords.
Mechanism: Queries are encoded into dense vectors (embeddings) and matched against indexed question/answer embeddings using kNN (k-Nearest Neighbors) cosine similarity in Elasticsearch.
Fusion: Combines standard BM25 text match with semantic vector search (RRF fusion) to rank results.
1.2 Duplicate Detection
Functionality: NLP-based similarity matching prevents duplicate questions during submission.
Mechanism: Before a question is created, its title and body are checked against Elasticsearch via kNN vector search. If similarity score > 0.85, the user is prompted to view existing questions.
1.3 AI-Generated Summaries
Functionality: System-generated summaries of existing crowdsourced answers.
Mechanism: Auto-summarizes long-form answers into concise takeaways. The summary is clearly labeled as "AI-generated" for transparency.
1.4 Tiered Answer Generation
A 3-stage approach to answering questions:

Automated FAQ: Surface existing frequently asked questions automatically.
Human Answers: Route questions to contributors and experts.
AI Fallback: If no human answer is available within 24 hours, generate an AI-drafted answer (clearly labeled) as a fallback.
1.5 Hybrid Self-Improvement
Answer Improvement: AI periodically reviews low-scoring answers (negative votes) and suggests edits for clarity/formatting.
Gap Filling: AI identifies gaps in FAQ coverage (common searches with no matching results) and suggests new FAQ entries.
Human-in-the-loop: All AI suggestions require human reviewer (Moderator/Admin) approval before going live.
1.6 Additional NLP Features
Key Term Extraction: Uses Named Entity Recognition (NER) to auto-extract key terms from question text and highlight them in search results.
Voice Input: Speech-to-text transcription for asking questions via voice.
Confidence Meter: Algorithm calculates confidence scores based on votes, expert endorsements, and AI verification status.
Multilingual Support: Auto-detects content language and utilizes machine translation APIs to allow cross-language searching and translated reading.

2. Technology Stack & Data Layer
2.1 AI Technology Stack
Vector Store & Search: Elasticsearch 8+ (with dense_vector and kNN support)
AI Embeddings: all-MiniLM-L6-v2 (Self-hosted or HuggingFace) for sentence embeddings
LLM / Generative AI: OpenAI GPT-4o / Anthropic Claude (Summaries, tiered answers, self-improvement)
Speech-to-Text: OpenAI Whisper API (Voice input transcription)
Translation: Google Cloud Translate / DeepL API

Index: faq_questions
├── title (text, analyzed)
├── body (text, analyzed)
├── embedding (dense_vector, dims: 384)  # For semantic search
└── key_terms (keyword[])                # NLP Extracted

Index: faq_answers
├── body (text, analyzed)
├── confidence_score (float)
├── is_ai_generated (boolean)
└── embedding (dense_vector, dims: 384)  # For semantic search


3. Backend Implementation (Fastify Routes)
The following is the extracted backend logic (packages/api/src/routes/ai.ts) handling AI summarization and hybrid self-improvement:

import { FastifyPluginAsync } from 'fastify';

const aiRoutes: FastifyPluginAsync = async (fastify) => {
  
  // 1. AI-Generated Summaries
  // Auto-summarize long-form answers into concise takeaways
  fastify.post('/answers/:id/summarize', async (req, reply) => {
    const { id } = req.params as { id: string };
    const answer = await fastify.prisma.answer.findUnique({ where: { id } });
    if (!answer) return reply.status(404).send({ error: 'Answer not found' });

    // LLM Call implementation goes here
    const simulatedSummary = `AI Summary: This answer explains the core concepts clearly in ${answer.bodyMarkdown.split(' ').length} words.`;

    const updated = await fastify.prisma.answer.update({
      where: { id },
      data: {
        shortFormSummary: simulatedSummary,
        aiModelUsed: 'gemini-1.5-pro',
      }
    });

    return reply.send(updated);
  });

  // 2. Hybrid Self-Improvement
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

  // AI identifies gaps in FAQ coverage
  fastify.post('/jobs/analyze-gaps', async (req, reply) => {
    // Simulating the creation of a gap-fill suggestion based on failed searches
    const suggestion = await fastify.prisma.aISuggestion.create({
      data: {
        type: 'GAP_FILL',
        suggestedContent: `Many users searched for "billing cycle" but found no results. Suggested new FAQ Question: "How does the monthly billing cycle work?"`,
      }
    });
    return reply.send({ success: true, suggestion });
  });

  // 3. Human Reviewer endpoints for AI Suggestions
  fastify.get('/suggestions', async (req, reply) => {
    const pending = await fastify.prisma.aISuggestion.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' }
    });
    return reply.send(pending);
  });

  // Approve AI suggestion (Moderator action)
  fastify.put('/suggestions/:id/approve', async (req, reply) => {
    const { id } = req.params as { id: string };
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