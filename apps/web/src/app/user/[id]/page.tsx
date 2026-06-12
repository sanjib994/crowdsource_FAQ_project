'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function UserProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');

  useEffect(() => {
    api.users.get(id as string).then(setUser).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="page-container">
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div className="skeleton skeleton--circle" style={{ width: 96, height: 96 }} />
        <div><div className="skeleton skeleton--title" /><div className="skeleton skeleton--text" /></div>
      </div>
    </div>
  );

  if (!user) return <div className="page-container"><div className="alert alert--danger">User not found</div></div>;

  const initials = (user.displayName || 'U').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const badges = user.badges || [];
  const questionCount = user.questionCount || user._count?.questions || 0;
  const answerCount = user.answerCount || user._count?.answers || 0;

  const mockQuestions = [
    { id: '1', title: 'How to configure SSO with SAML?', votes: 42, date: '2d ago' },
    { id: '2', title: 'Best caching strategy for Redis?', votes: 28, date: '1w ago' },
    { id: '3', title: 'OAuth2 token refresh flow', votes: 15, date: '2w ago' },
  ];

  const mockAnswers = [
    { id: '1', title: 'Re: Setting up webhooks', votes: 89, date: '3d ago' },
    { id: '2', title: 'Re: Database migration best practices', votes: 34, date: '5d ago' },
  ];

  return (
    <div className="page-container animate-fadeIn">
      {/* Profile Header */}
      <div className="glass-panel glass-panel--static" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="avatar avatar--xl">{initials}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{user.displayName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
              <span className="badge badge--role">{user.role}</span>
              <span style={{ color: 'var(--text-secondary)' }}>⭐ {user.reputationScore || 0} reputation</span>
              <span style={{ color: 'var(--text-muted)' }}>Member since {new Date(user.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-3">
        {[
          { icon: '📝', value: questionCount, label: 'Questions' },
          { icon: '💬', value: answerCount, label: 'Answers' },
          { icon: '✅', value: Math.floor(answerCount * 0.6), label: 'Accepted' },
          { icon: '🏅', value: badges.length, label: 'Badges' },
        ].map((s, i) => (
          <div key={i} className="stat-card glass-panel glass-panel--static">
            <div style={{ fontSize: '1.3rem' }}>{s.icon}</div>
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="glass-panel glass-panel--static" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 className="mb-2">🏅 Badges</h3>
        {badges.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {badges.map((b: any, i: number) => (
              <div key={i} className="badge badge--lg badge--expert" title={b.badge?.description || b.description || ''}>
                {b.badge?.icon || '🏅'} {b.badge?.name || b.name}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-secondary">No badges earned yet. Start contributing to earn badges!</p>
        )}
      </div>

      {/* Activity Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'questions' ? 'tab--active' : ''}`} onClick={() => setActiveTab('questions')}>Questions</button>
        <button className={`tab ${activeTab === 'answers' ? 'tab--active' : ''}`} onClick={() => setActiveTab('answers')}>Answers</button>
      </div>

      <div className="question-list">
        {(activeTab === 'questions' ? mockQuestions : mockAnswers).map(item => (
          <div key={item.id} className="question-card">
            <div className="vote-column">
              <span className="vote-count">{item.votes}</span>
              <span className="text-xs text-muted">votes</span>
            </div>
            <div className="question-content">
              <Link href={`/question/${item.id}`} className="question-title">{item.title}</Link>
              <div className="question-meta"><span>{item.date}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
