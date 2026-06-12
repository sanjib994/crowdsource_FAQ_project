'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // if (!isLoading && !isAuthenticated) router.push('/auth/signin'); // Auth check removed
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) return (
    <div className="page-container">
      <div className="skeleton skeleton--title" style={{ width: '40%' }} />
      <div className="dashboard-grid mt-2">{[1,2,3,4].map(i => <div key={i} className="skeleton skeleton--card" />)}</div>
    </div>
  );

  const weekNumber = Math.max(1, Math.ceil((Date.now() - new Date(user.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)));

  const stats = [
    { icon: '⭐', value: user.reputationScore, label: 'Reputation', delta: '+120', up: true },
    { icon: '📝', value: 23, label: 'Questions', delta: '+3', up: true },
    { icon: '💬', value: 47, label: 'Answers', delta: '+8', up: true },
    { icon: '🔥', value: 14, label: 'Day Streak', delta: '', up: true },
  ];

  const phaseFaqs = [
    { done: true, title: 'How to configure basic API settings?' },
    { done: true, title: 'Understanding user roles and permissions' },
    { done: false, title: 'Setting up webhooks for integrations' },
    { done: false, title: 'Advanced reporting and analytics' },
  ];

  const lockedFaqs = ['Custom plugin development', 'Enterprise SSO configuration', 'Multi-tenant architecture'];

  const recommended = [
    { id: '1', title: 'How to optimize query performance?', tags: ['sql', 'performance'], votes: 34 },
    { id: '2', title: 'Best practices for authentication?', tags: ['oauth', 'security'], votes: 28 },
    { id: '3', title: 'Caching strategies for API responses', tags: ['redis', 'caching'], votes: 19 },
  ];

  const unanswered = [
    { id: '4', title: 'SAML setup error with metadata', tags: ['saml'], votes: 5 },
    { id: '5', title: 'OAuth2 token timeout issues', tags: ['oauth'], votes: 3 },
    { id: '6', title: 'JWT rotation best practices', tags: ['jwt'], votes: 7 },
  ];

  const activity = [
    { type: 'success', text: 'Your answer on "How to..." was accepted', time: '2h ago' },
    { type: 'warning', text: 'Earned badge: "Helpful" (10 upvotes)', time: '5h ago' },
    { type: 'info', text: 'New comment on your question', time: '1d ago' },
    { type: 'success', text: 'Answer upvoted +10 reputation', time: '2d ago' },
  ];

  return (
    <div className="page-container animate-fadeIn">
      <div className="dashboard-welcome">
        <h1>👋 Welcome back, {user.displayName}!</h1>
        <span>Week {weekNumber} of your journey</span>
      </div>

      <div className="dashboard-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card glass-panel glass-panel--static">
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{s.icon}</div>
            <div className="stat-card__value">{s.value.toLocaleString()}</div>
            <div className="stat-card__label">{s.label}</div>
            {s.delta && <div className={`stat-card__delta stat-card__delta--up`}>{s.delta} ↑</div>}
          </div>
        ))}
      </div>

      {/* Phase-Based FAQs */}
      <div className="glass-panel glass-panel--static dashboard-panel mb-3">
        <div className="flex-between mb-1">
          <h3>📘 Phase-Based FAQs</h3>
          <span className="badge badge--phase-intermediate">Intermediate · Week {weekNumber}</span>
        </div>
        <div className="phase-progress">
          <div className="phase-progress__label"><span>Progress</span><span>60%</span></div>
          <div className="progress-bar"><div className="progress-bar__fill" style={{ width: '60%' }} /></div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-secondary mb-1">Recommended for you now:</p>
          {phaseFaqs.map((f, i) => (
            <div key={i} style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <span>{f.done ? '✅' : '○'}</span>
              <span style={{ color: f.done ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: f.done ? 'line-through' : 'none' }}>{f.title}</span>
            </div>
          ))}
          <p className="text-sm text-muted mt-2 mb-1">Coming next (Advanced phase):</p>
          {lockedFaqs.map((f, i) => (
            <div key={i} style={{ padding: '0.3rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>🔒</span><span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        {/* Recommended */}
        <div className="glass-panel glass-panel--static dashboard-panel">
          <h3 className="mb-2">💡 Recommended Questions</h3>
          {recommended.map(q => (
            <Link key={q.id} href={`/question/${q.id}`} style={{ display: 'block', padding: '0.65rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{q.title}</div>
              <div className="tags">{q.tags.map(t => <span key={t} className="tag">#{t}</span>)}<span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>★ {q.votes}</span></div>
            </Link>
          ))}
        </div>

        {/* Unanswered */}
        <div className="glass-panel glass-panel--static dashboard-panel">
          <h3 className="mb-2">❓ Unanswered in Your Expertise</h3>
          {unanswered.map(q => (
            <Link key={q.id} href={`/question/${q.id}`} style={{ display: 'block', padding: '0.65rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{q.title}</div>
              <div className="tags">{q.tags.map(t => <span key={t} className="tag">#{t}</span>)}<span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>★ {q.votes}</span></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="glass-panel glass-panel--static dashboard-panel mt-3">
        <h3 className="mb-2">📋 Recent Activity</h3>
        <div className="timeline">
          {activity.map((a, i) => (
            <div key={i} className="timeline__item">
              <div className={`timeline__dot timeline__dot--${a.type}`} />
              <div className="timeline__content">
                <div className="timeline__text">{a.text}</div>
                <div className="timeline__time">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
