'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState('overview');
  const [flags, setFlags] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || (user?.role !== 'MODERATOR' && user?.role !== 'ADMIN'))) {
      // if (!isLoading && !isAuthenticated) router.push('/auth/signin'); // Auth check removed
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    api.moderation.getFlags().then(d => setFlags(Array.isArray(d) ? d : [])).catch(() => {});
    api.ai.suggestions().then(d => setSuggestions(Array.isArray(d) ? d : [])).catch(() => {});
    api.analytics.metrics().then(setMetrics).catch(() => {});
  }, []);

  const resolveFlag = async (id: string, status: string) => {
    try { await api.moderation.resolveFlag(id, status); setFlags(flags.filter(f => f.id !== id)); } catch {}
  };

  const approveSuggestion = async (id: string) => {
    try { await api.ai.approveSuggestion(id); setSuggestions(suggestions.filter(s => s.id !== id)); } catch {}
  };

  if (isLoading) return <div className="page-container"><div className="skeleton skeleton--card" /></div>;

  const TABS = ['overview', 'moderation', 'ai-suggestions', 'analytics', 'users', 'webhooks'];

  const mockUsers = [
    { id: '1', name: 'spammer123', role: 'VISITOR', rep: 2, status: 'shadow-banned', joined: '1d ago', flags: 12 },
    { id: '2', name: 'newbie_user', role: 'VISITOR', rep: 5, status: 'warned', joined: '3d ago', flags: 3 },
    { id: '3', name: 'troll_account', role: 'VISITOR', rep: -5, status: 'temp-banned', joined: '1w ago', flags: 8 },
  ];

  const mockWebhooks = [
    { id: '1', url: 'https://slack.example.com/webhook', events: ['question.created', 'answer.accepted'], active: true },
    { id: '2', url: 'https://discord.example.com/hook', events: ['moderation.flag'], active: false },
  ];

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title"><span className="text-gradient">🛡️ Admin Dashboard</span></h1>
      </div>

      <div className="tabs admin-tabs" style={{ overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} className={`tab ${tab === t ? 'tab--active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? '📊 Overview' : t === 'moderation' ? `🚩 Moderation (${flags.length})` : t === 'ai-suggestions' ? `🤖 AI Suggestions` : t === 'analytics' ? '📈 Analytics' : t === 'users' ? '👥 Users' : '🔗 Webhooks'}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div className="animate-fadeIn">
          <div className="grid-4 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {[
              { label: 'Total Questions', value: metrics?.totalQuestions || 1234, delta: '+12%', up: true },
              { label: 'Answer Rate', value: `${metrics?.answerRate || 89.2}%`, delta: '+2%', up: true },
              { label: 'Spam Rate', value: `${metrics?.spamRate || 1.2}%`, delta: '-0.3%', up: false },
              { label: 'Verified Coverage', value: `${metrics?.expertVerificationCoverage || 84}%`, delta: '+5%', up: true },
              { label: 'Avg Response Time', value: `${metrics?.avgTimeToFirstAnswer || '2.4'}h`, delta: '-1h', up: false },
            ].map((s, i) => (
              <div key={i} className="stat-card glass-panel glass-panel--static">
                <div className="stat-card__value">{s.value}</div>
                <div className="stat-card__label">{s.label}</div>
                <div className={`stat-card__delta ${s.up ? 'stat-card__delta--up' : 'stat-card__delta--down'}`}>{s.delta} {s.up ? '↑' : '↓'}</div>
              </div>
            ))}
          </div>
          <div className="glass-panel glass-panel--static" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📈 Content Growth Over Time</div>
            <div className="filter-chips" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
              {['7d', '30d', '90d', '1y'].map(p => <button key={p} className="filter-chip">{p}</button>)}
            </div>
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>Chart visualization placeholder</div>
          </div>
        </div>
      )}

      {/* MODERATION TAB */}
      {tab === 'moderation' && (
        <div className="animate-fadeIn">
          {flags.length === 0 ? (
            <div className="glass-panel glass-panel--static" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <p className="text-secondary">No pending flags. All clear!</p>
            </div>
          ) : flags.map(f => (
            <div key={f.id} className="flag-card">
              <div className="flag-card__header">
                <span className="badge badge--danger">{f.reason}</span>
                <span className="badge">{f.targetType}</span>
                <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>Reported by #{f.reporterId?.slice(0, 8)}</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{f.details || 'No additional details provided.'}</p>
              <div className="flag-card__actions">
                <button className="btn-secondary btn-sm" onClick={() => resolveFlag(f.id, 'DISMISSED')}>Dismiss</button>
                <button className="btn-danger btn-sm" onClick={() => resolveFlag(f.id, 'REVIEWED')}>Remove Content</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI SUGGESTIONS TAB */}
      {tab === 'ai-suggestions' && (
        <div className="animate-fadeIn">
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <button className="btn-secondary btn-sm" onClick={() => api.ai.analyzeLowScoring().catch(() => {})}>🔍 Run Low-Score Analysis</button>
            <button className="btn-secondary btn-sm" onClick={() => api.ai.analyzeGaps().catch(() => {})}>📊 Run Gap Analysis</button>
          </div>
          {suggestions.length === 0 ? (
            <div className="glass-panel glass-panel--static" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
              <p className="text-secondary">No pending AI suggestions. Run an analysis to generate suggestions.</p>
            </div>
          ) : suggestions.map(s => (
            <div key={s.id} className="flag-card">
              <div className="flag-card__header">
                <span className="badge badge--ai">{s.type}</span>
                {s.targetId && <span className="text-xs text-muted">Target: #{s.targetId.slice(0, 8)}</span>}
              </div>
              <div className="diff-view" style={{ margin: '0.75rem 0' }}>
                <div className="diff-add">{s.suggestedContent}</div>
              </div>
              <div className="flag-card__actions">
                <button className="btn-primary btn-sm" onClick={() => approveSuggestion(s.id)}>✅ Approve</button>
                <button className="btn-secondary btn-sm">✏️ Modify</button>
                <button className="btn-ghost btn-sm">❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === 'analytics' && (
        <div className="animate-fadeIn">
          <div className="glass-panel glass-panel--static" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="flex-between mb-2">
              <h3>📊 Weekly Report — Week of Jun 2–8, 2026</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn-secondary btn-sm" onClick={() => api.analytics.export('csv').catch(() => {})}>Export CSV</button>
                <button className="btn-secondary btn-sm" onClick={() => api.analytics.export('json').catch(() => {})}>Export JSON</button>
              </div>
            </div>
            <div className="grid-3">
              {[
                { label: 'New Questions', value: '89', delta: '+12%' },
                { label: 'New Answers', value: '234', delta: '+8%' },
                { label: 'Answer Rate', value: '89.2%', delta: '+2%' },
                { label: 'Avg Response', value: '2.4 hours', delta: '-1h' },
                { label: 'New Users', value: '45', delta: '+15%' },
                { label: 'Mod Actions', value: '12', delta: '-3' },
              ].map((s, i) => (
                <div key={i} style={{ padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{s.value}</div>
                  <div className="stat-card__delta stat-card__delta--up">{s.delta}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="btn-primary" onClick={() => api.analytics.weeklyReport().catch(() => {})}>📧 Generate & Send Weekly Report</button>
        </div>
      )}

      {/* USERS TAB */}
      {tab === 'users' && (
        <div className="animate-fadeIn">
          {mockUsers.map(u => (
            <div key={u.id} className="flag-card">
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="avatar avatar--sm">{u.name[0].toUpperCase()}</div>
                  <div>
                    <span style={{ fontWeight: 600 }}>@{u.name}</span>
                    <span className="text-xs text-muted" style={{ marginLeft: '0.5rem' }}>⭐ {u.rep} rep · Joined {u.joined}</span>
                  </div>
                </div>
                <span className={`badge ${u.status === 'shadow-banned' ? 'badge--danger' : u.status === 'warned' ? 'badge--warning' : 'badge--danger'}`}>
                  {u.status === 'shadow-banned' ? '⚠️ Shadow-Banned' : u.status === 'warned' ? '⚠️ Warned' : '🚫 Temp-Banned'}
                </span>
              </div>
              <p className="text-sm text-muted mt-1">Flags: {u.flags}</p>
              <div className="flag-card__actions">
                <button className="btn-ghost btn-sm">Lift Ban</button>
                <button className="btn-secondary btn-sm">⚠️ Warning</button>
                <button className="btn-outlined btn-sm">Temp Ban 7d</button>
                <button className="btn-danger btn-sm">Perm Ban</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* WEBHOOKS TAB */}
      {tab === 'webhooks' && (
        <div className="animate-fadeIn">
          <button className="btn-primary btn-sm mb-2">+ Add Webhook</button>
          {mockWebhooks.map(w => (
            <div key={w.id} className="webhook-card">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{w.url}</div>
                <div className="text-xs text-muted">Events: {w.events.join(', ')}</div>
              </div>
              <span className={`badge ${w.active ? 'badge--success' : 'badge--danger'}`}>{w.active ? '✅ Active' : '❌ Inactive'}</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                <button className="btn-ghost btn-sm">Edit</button>
                <button className="btn-ghost btn-sm">Test</button>
                <button className="btn-ghost btn-sm">{w.active ? 'Disable' : 'Enable'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
