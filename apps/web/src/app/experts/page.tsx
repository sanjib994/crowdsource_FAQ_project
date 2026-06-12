'use client';
import { useState } from 'react';
import Link from 'next/link';

const EXPERTS = [
  { id: '1', name: 'Sarah Chen', rep: 12450, tags: ['auth', 'saml', 'oauth', 'security'], answers: 423, accepted: 89, rate: 96 },
  { id: '2', name: 'Mike Johnson', rep: 9800, tags: ['api', 'webhooks', 'integration'], answers: 312, accepted: 67, rate: 92 },
  { id: '3', name: 'Priya Sharma', rep: 8450, tags: ['database', 'sql', 'caching'], answers: 289, accepted: 61, rate: 91 },
  { id: '4', name: 'Alex Kim', rep: 7200, tags: ['deployment', 'docker', 'ci-cd'], answers: 234, accepted: 48, rate: 88 },
  { id: '5', name: 'Emma Wilson', rep: 5600, tags: ['billing', 'payments', 'stripe'], answers: 178, accepted: 39, rate: 87 },
  { id: '6', name: 'David Park', rep: 4300, tags: ['security', 'encryption', 'compliance'], answers: 145, accepted: 31, rate: 85 },
];

export default function ExpertsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const initials = (n: string) => n.split(' ').map(w => w[0]).join('').slice(0, 2);

  const filters = ['all', 'auth', 'api', 'database', 'security', 'billing', 'deployment'];
  const filtered = EXPERTS.filter(e => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.tags.some(t => t.includes(search.toLowerCase()))) return false;
    if (filter !== 'all' && !e.tags.some(t => t.includes(filter))) return false;
    return true;
  });

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title"><span className="text-gradient">🧑‍🔬 Verified Experts</span></h1>
        <p className="page-subtitle">Organization-endorsed knowledge contributors</p>
      </div>

      <div className="search-bar-wrapper" style={{ maxWidth: 500, margin: '0 0 1.5rem' }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search experts by name or expertise..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="filter-chips mb-3">
        {filters.map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'filter-chip--active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid-2">
        {filtered.map(e => (
          <div key={e.id} className="expert-card">
            <div className="expert-card__header">
              <div className="avatar avatar--lg">{initials(e.name)}</div>
              <div>
                <div className="expert-card__name">{e.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>⭐ {e.rep.toLocaleString()} rep</div>
              </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span className="badge badge--expert" style={{ marginRight: '0.5rem' }}>🏢 Organization Endorsed</span>
              <span className="badge badge--role">Expert</span>
            </div>
            <div className="tags mb-1">
              {e.tags.map(t => <span key={t} className="tag">#{t}</span>)}
            </div>
            <div className="expert-card__stats">
              <span>{e.answers} answers</span>
              <span>{e.accepted} accepted</span>
              <span>{e.rate}% helpful</span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <Link href={`/user/${e.id}`} className="btn-outlined btn-sm" style={{ width: '100%', textAlign: 'center' }}>View Profile</Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-panel glass-panel--static" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔍</div>
          <p className="text-secondary">No experts found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
