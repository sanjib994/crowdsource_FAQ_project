import stringSimilarity from 'string-similarity';

/**
 * Normalize text for NLP processing
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' '); // Remove extra spaces
};

/**
 * Tokenize text into words
 */
export const tokenize = (text: string): string[] => {
  return normalizeText(text).split(/\s+/).filter(word => word.length > 0);
};

/**
 * Remove common stop words
 */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by',
  'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its',
  'of', 'on', 'or', 'that', 'the', 'to', 'was', 'will', 'with',
  'i', 'me', 'my', 'we', 'you', 'your', 'this', 'these', 'what', 'how'
]);

export const removeStopWords = (tokens: string[]): string[] => {
  return tokens.filter(token => !STOP_WORDS.has(token));
};

/**
 * Extract keywords from text
 */
export const extractKeywords = (text: string, removeStop: boolean = true): string[] => {
  let tokens = tokenize(text);
  if (removeStop) {
    tokens = removeStopWords(tokens);
  }
  return [...new Set(tokens)]; // Remove duplicates
};

/**
 * Calculate similarity between two texts (0 to 1)
 */
export const calculateSimilarity = (text1: string, text2: string): number => {
  const norm1 = normalizeText(text1);
  const norm2 = normalizeText(text2);
  
  // If texts are identical after normalization
  if (norm1 === norm2) return 1;
  
  // Use string similarity algorithm
  return stringSimilarity.compareTwoStrings(norm1, norm2);
};

/**
 * Detect duplicate FAQs based on similarity threshold
 */
export const findDuplicates = (
  faqs: Array<{ id: string; question: string }>,
  threshold: number = 0.75
): Array<{ faq1: string; faq2: string; similarity: number }> => {
  const duplicates: Array<{ faq1: string; faq2: string; similarity: number }> = [];
  
  for (let i = 0; i < faqs.length; i++) {
    for (let j = i + 1; j < faqs.length; j++) {
      const similarity = calculateSimilarity(faqs[i].question, faqs[j].question);
      
      if (similarity >= threshold) {
        duplicates.push({
          faq1: faqs[i].id,
          faq2: faqs[j].id,
          similarity: Math.round(similarity * 100) / 100
        });
      }
    }
  }
  
  return duplicates;
};

/**
 * Search FAQs by keyword/single word
 */
export const searchFAQsByKeyword = (
  faqs: Array<{ id: string; question: string; answer: string }>,
  keyword: string
): Array<{ id: string; question: string; answer: string; relevance: number }> => {
  const normalizedKeyword = normalizeText(keyword);
  const keywords = extractKeywords(normalizedKeyword, true);
  
  return faqs
    .map(faq => {
      const questionTokens = extractKeywords(faq.question, true);
      const answerTokens = extractKeywords(faq.answer, true);
      
      // Count keyword matches
      const questionMatches = keywords.filter(k => questionTokens.includes(k)).length;
      const answerMatches = keywords.filter(k => answerTokens.includes(k)).length;
      
      // Weight question matches higher than answer matches
      const relevance = (questionMatches * 2 + answerMatches) / (keywords.length * 2 + 1);
      
      return {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        relevance: Math.round(relevance * 100) / 100
      };
    })
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance);
};

/**
 * Semantic similarity search - find similar FAQs to a given question
 */
export const findSimilarFAQs = (
  query: string,
  faqs: Array<{ id: string; question: string; answer: string }>,
  threshold: number = 0.6,
  limit: number = 5
): Array<{ id: string; question: string; answer: string; similarity: number }> => {
  return faqs
    .map(faq => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      similarity: calculateSimilarity(query, faq.question)
    }))
    .filter(item => item.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
};

/**
 * Combined search - keyword + semantic similarity
 */
export const hybridSearch = (
  query: string,
  faqs: Array<{ id: string; question: string; answer: string }>,
  keywordWeight: number = 0.4,
  semanticWeight: number = 0.6
): Array<{ id: string; question: string; answer: string; score: number }> => {
  const keywordResults = searchFAQsByKeyword(faqs, query);
  const semanticResults = findSimilarFAQs(query, faqs, 0.3, faqs.length);
  
  // Create a map with combined scores
  const scoreMap = new Map<string, number>();
  
  keywordResults.forEach(result => {
    scoreMap.set(result.id, (scoreMap.get(result.id) || 0) + result.relevance * keywordWeight);
  });
  
  semanticResults.forEach(result => {
    scoreMap.set(result.id, (scoreMap.get(result.id) || 0) + result.similarity * semanticWeight);
  });
  
  return faqs
    .map(faq => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      score: scoreMap.get(faq.id) || 0
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
};
