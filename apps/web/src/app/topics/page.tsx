'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const CATEGORIES = [
  { icon: '🔐', name: 'Authentication', children: ['OAuth2', 'SAML / SSO', 'JWT', '2FA'], count: 234 },
  { icon: '💰', name: 'Billing & Payments', children: ['Subscriptions', 'Refunds', 'Invoicing'], count: 89 },
  { icon: '🔧', name: 'API & Integrations', children: ['REST API', 'Webhooks', 'SDKs', 'GraphQL'], count: 156 },
  { icon: '🛡️', name: 'Security', children: ['Data Protection', 'Compliance', 'Encryption'], count: 67 },
  { icon: '🚀', name: 'Deployment', children: ['Docker', 'CI/CD', 'Cloud Hosting'], count: 34 },
  { icon: '📊', name: 'Analytics', children: ['Reporting', 'Dashboards', 'Metrics'], count: 45 },
];

export default function TopicsPage() {
  const [tags, setTags] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.tags.list().then((data: any) => setTags(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const allTags = tags.length > 0 ? tags : [
    { name: 'authentication', questionCount: 156 }, { name: 'billing', questionCount: 89 },
    { name: 'api', questionCount: 234 }, { name: 'security', questionCount: 67 },
    { name: 'onboarding', questionCount: 45 }, { name: 'saml', questionCount: 34 },
    { name: 'oauth', questionCount: 78 }, { name: 'webhooks', questionCount: 23 },
    { name: 'caching', questionCount: 56 }, { name: 'database', questionCount: 91 },
    { name: 'deployment', questionCount: 34 }, { name: 'docker', questionCount: 28 },
    { name: 'graphql', questionCount: 19 }, { name: 'testing', questionCount: 42 },
  ];

  const filtered = search ? allTags.filter(t => t.name.toLowerCase().includes(search.toLowerCase())) : allTags;
  const maxCount = Math.max(...allTags.map(t => t.questionCount || 1));

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title"><span className="text-gradient">🏷️ Topics & Categories</span></h1>
        <p className="page-subtitle">Browse questions by topic or explore categories</p>
      </div>

      <div className="search-bar-wrapper" style={{ maxWidth: 500, margin: '0 0 2rem' }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search topics..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Tag Cloud */}
      <div className="glass-panel glass-panel--static" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 className="mb-2">🔥 Popular Topics</h3>
        <div className="tag-cloud">
          {filtered.map(t => {
            const size = 0.75 + ((t.questionCount || 1) / maxCount) * 0.8;
            return (
              <span key={t.name} className="tag tag-cloud__item" style={{ fontSize: `${size}rem`, padding: `${0.2 + size * 0.1}rem ${0.5 + size * 0.2}rem` }}>
                #{t.name} <span className="text-muted">({t.questionCount || 0})</span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      <div className="glass-panel glass-panel--static" style={{ padding: '1.5rem' }}>
        <h3 className="mb-2">📂 Categories</h3>
        {CATEGORIES.map(cat => (
          <div key={cat.name} style={{ borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setExpanded(expanded === cat.name ? null : cat.name)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 0', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '1rem' }}
            >
              <span>{expanded === cat.name ? '▼' : '▶'}</span>
              <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
              <span style={{ fontWeight: 600, flex: 1, textAlign: 'left' }}>{cat.name}</span>
              <span className="badge">{cat.count} questions</span>
            </button>
            {expanded === cat.name && (
              <div className="animate-fadeIn" style={{ paddingLeft: '2.5rem', paddingBottom: '0.75rem' }}>
                {cat.children.map(child => (
                  <div key={child} style={{ padding: '0.4rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span>├──</span>
                    <span className="tag">{child}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
