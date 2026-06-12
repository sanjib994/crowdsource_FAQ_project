'use client';
import { useState } from 'react';
import Link from 'next/link';

const MOCK_USERS = [
  { id: '1', name: 'Sarah Chen', rep: 12450, answers: 423, badges: 8, role: 'EXPERT' },
  { id: '2', name: 'Mike Johnson', rep: 9800, answers: 312, badges: 6, role: 'EXPERT' },
  { id: '3', name: 'Priya Sharma', rep: 8450, answers: 289, badges: 6, role: 'EXPERT' },
  { id: '4', name: 'Alex Kim', rep: 7200, answers: 234, badges: 5, role: 'CONTRIBUTOR' },
  { id: '5', name: 'Emma Wilson', rep: 5600, answers: 178, badges: 4, role: 'CONTRIBUTOR' },
  { id: '6', name: 'David Park', rep: 4300, answers: 145, badges: 4, role: 'CONTRIBUTOR' },
  { id: '7', name: 'Lisa Wang', rep: 3800, answers: 132, badges: 3, role: 'CONTRIBUTOR' },
  { id: '8', name: 'James Brown', rep: 2900, answers: 98, badges: 3, role: 'CONTRIBUTOR' },
  { id: '9', name: 'Maria Garcia', rep: 2100, answers: 76, badges: 2, role: 'CONTRIBUTOR' },
  { id: '10', name: 'Ahmed Hassan', rep: 1800, answers: 64, badges: 2, role: 'CONTRIBUTOR' },
  { id: '11', name: 'Sophie Martin', rep: 1500, answers: 52, badges: 2, role: 'CONTRIBUTOR' },
  { id: '12', name: 'Ryan Lee', rep: 1240, answers: 47, badges: 1, role: 'CONTRIBUTOR' },
  { id: '13', name: 'Nina Patel', rep: 980, answers: 34, badges: 1, role: 'VISITOR' },
  { id: '14', name: 'Tom Anderson', rep: 750, answers: 28, badges: 1, role: 'VISITOR' },
  { id: '15', name: 'Julia Costa', rep: 520, answers: 19, badges: 1, role: 'VISITOR' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('monthly');
  const top = MOCK_USERS[0];
  const initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title"><span className="text-gradient">🏆 Leaderboard</span></h1>
        <p className="page-subtitle">Top contributors making our community smarter</p>
      </div>

      <div className="tabs">
        {(['weekly', 'monthly', 'alltime'] as const).map(p => (
          <button key={p} className={`tab ${period === p ? 'tab--active' : ''}`} onClick={() => setPeriod(p)}>
            {p === 'weekly' ? 'Weekly' : p === 'monthly' ? 'Monthly' : 'All-Time'}
          </button>
        ))}
      </div>

      {/* Spotlight */}
      <div className="spotlight-card animate-slideUp">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div className="avatar avatar--lg">{initials(top.name)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{top.name}</span>
              <span className="badge badge--role">{top.role}</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              ⭐ {top.rep.toLocaleString()} reputation · Helped resolve {top.answers} questions this {period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'time'}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {['🏅 Top Contributor', '🎯 Expert', '💡 Helpful'].map(b => (
                <span key={b} className="badge badge--expert">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel glass-panel--static" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <div style={{ width: 60 }}>Rank</div>
          <div style={{ flex: 1 }}>User</div>
          <div style={{ width: 100, textAlign: 'center' }} className="hidden-mobile">Reputation</div>
          <div style={{ width: 100, textAlign: 'center' }} className="hidden-mobile">Answers</div>
          <div style={{ width: 80, textAlign: 'center' }} className="hidden-mobile">Badges</div>
        </div>
        {MOCK_USERS.map((u, i) => (
          <div key={u.id} className={`leaderboard-row ${u.id === '12' ? 'leaderboard-row--highlight' : ''}`}>
            <div className="leaderboard-rank" style={{ width: 60 }}>{i < 3 ? MEDALS[i] : i + 1}</div>
            <div className="leaderboard-user" style={{ flex: 1 }}>
              <div className="avatar avatar--sm">{initials(u.name)}</div>
              <div>
                <Link href={`/user/${u.id}`} style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</Link>
                <div className="hidden-desktop" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>⭐ {u.rep.toLocaleString()} · {u.answers} answers</div>
              </div>
            </div>
            <div className="leaderboard-stat hidden-mobile" style={{ width: 100 }}>⭐ {u.rep.toLocaleString()}</div>
            <div className="leaderboard-stat hidden-mobile" style={{ width: 100 }}>{u.answers}</div>
            <div className="leaderboard-stat hidden-mobile" style={{ width: 80 }}>{'🏅'.repeat(Math.min(u.badges, 3))}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Your Rank: <strong style={{ color: 'var(--primary-light)' }}>#12</strong> of 1,234 contributors
      </div>
    </div>
  );
}
