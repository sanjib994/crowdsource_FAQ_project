const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API Error');
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (data: { email: string; password: string; displayName: string }) =>
      fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    me: () => fetchAPI('/auth/me'),
  },
  questions: {
    list: () => fetchAPI('/questions'),
    get: (id: string) => fetchAPI(`/questions/${id}`),
    create: (data: { title: string; body: string; tags?: string[] }) =>
      fetchAPI('/questions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      fetchAPI(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/questions/${id}`, { method: 'DELETE' }),
    vote: (id: string, value: number) =>
      fetchAPI(`/questions/${id}/vote`, { method: 'POST', body: JSON.stringify({ value }) }),
  },
  answers: {
    create: (data: { questionId: string; body: string }) =>
      fetchAPI('/answers', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => fetchAPI(`/answers/${id}`),
    update: (id: string, data: Record<string, unknown>) =>
      fetchAPI(`/answers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/answers/${id}`, { method: 'DELETE' }),
    forQuestion: (questionId: string) => fetchAPI(`/answers/question/${questionId}`),
    verify: (id: string) => fetchAPI(`/answers/${id}/verify`, { method: 'PUT' }),
    vote: (id: string, value: number) =>
      fetchAPI(`/answers/${id}/vote`, { method: 'POST', body: JSON.stringify({ value }) }),
    summarize: (id: string) =>
      fetchAPI(`/ai/answers/${id}/summarize`, { method: 'POST' }),
  },
  faqs: {
    list: () => fetchAPI('/faqs'),
    get: (id: string) => fetchAPI(`/faqs/${id}`),
    create: (data: { category: string; question: string; answer: string }) =>
      fetchAPI('/faqs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      fetchAPI(`/faqs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/faqs/${id}`, { method: 'DELETE' }),
  },
  tickets: {
    list: () => fetchAPI('/tickets'),
    get: (id: string) => fetchAPI(`/tickets/${id}`),
    myTickets: () => fetchAPI('/tickets/my'),
    create: (data: { questionText: string; attachmentUrl?: string; linkedFaqId?: string }) =>
      fetchAPI('/tickets', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Record<string, unknown>) =>
      fetchAPI(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/tickets/${id}`, { method: 'DELETE' }),
  },
  dashboard: {
    userDashboard: () => fetchAPI('/dashboard/user'),
    adminDashboard: () => fetchAPI('/dashboard/admin'),
  },
  leaderboard: {
    get: (period?: string, limit?: number) => {
      const params = new URLSearchParams();
      if (period) params.set('period', period);
      if (limit) params.set('limit', limit.toString());
      return fetchAPI(`/leaderboard?${params}`);
    },
    getUserRank: (userId: string) => fetchAPI(`/leaderboard/rank/${userId}`),
    getExperts: (limit?: number) => {
      const params = new URLSearchParams();
      if (limit) params.set('limit', limit.toString());
      return fetchAPI(`/leaderboard/experts?${params}`);
    },
  },
  search: {
    query: (q: string, filters?: { tags?: string; phase?: string; status?: string }) => {
      const params = new URLSearchParams();
      params.set('q', q);
      if (filters?.tags) params.set('tags', filters.tags);
      if (filters?.phase) params.set('phase', filters.phase);
      if (filters?.status) params.set('status', filters.status);
      return fetchAPI(`/search?${params}`);
    },
  },
  tags: {
    list: () => fetchAPI('/tags'),
    get: (slug: string) => fetchAPI(`/tags/${slug}`),
    create: (data: { name: string; slug: string; description?: string }) =>
      fetchAPI('/tags', { method: 'POST', body: JSON.stringify(data) }),
  },
  users: {
    get: (id: string) => fetchAPI(`/users/${id}`),
  },
  moderation: {
    getFlags: () => fetchAPI('/moderation/flags'),
    createFlag: (data: { targetId: string; targetType: string; reason: string; details?: string }) =>
      fetchAPI('/moderation/flags', { method: 'POST', body: JSON.stringify(data) }),
    resolveFlag: (id: string, status: string, canonicalTargetId?: string) =>
      fetchAPI(`/moderation/flags/${id}`, { method: 'PUT', body: JSON.stringify({ status, canonicalTargetId }) }),
  },
  analytics: {
    metrics: () => fetchAPI('/analytics/metrics'),
    export: (format: 'csv' | 'json') => fetchAPI(`/analytics/export?format=${format}`),
    weeklyReport: () => fetchAPI('/analytics/jobs/generate-weekly-report', { method: 'POST' }),
  },
  ai: {
    suggestions: () => fetchAPI('/ai/suggestions'),
    approveSuggestion: (id: string) => fetchAPI(`/ai/suggestions/${id}/approve`, { method: 'PUT' }),
    analyzeLowScoring: () => fetchAPI('/ai/jobs/analyze-low-scoring', { method: 'POST' }),
    analyzeGaps: () => fetchAPI('/ai/jobs/analyze-gaps', { method: 'POST' }),
  },
  vote: {
    cast: (data: { targetId: string; targetType: string; voteType: string }) =>
      fetchAPI('/vote', { method: 'POST', body: JSON.stringify(data) }),
  },
};
