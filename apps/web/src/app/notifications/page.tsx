'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'vote', text: 'Your answer on "How to configure SSO?" was upvoted (+10 rep)', time: '5m ago', group: 'Today', read: false },
  { id: '2', type: 'answer', text: '@mike_johnson answered your question "OAuth2 token refresh"', time: '2h ago', group: 'Today', read: false },
  { id: '3', type: 'badge', text: 'Badge earned: "Helpful" — 10 upvotes on a single answer', time: '4h ago', group: 'Today', read: false },
  { id: '4', type: 'moderation', text: 'Your flagged content on "Spam post" was reviewed and removed', time: '6h ago', group: 'Today', read: true },
  { id: '5', type: 'vote', text: 'Your question received 5 upvotes', time: '1d ago', group: 'Yesterday', read: true },
  { id: '6', type: 'answer', text: '@sarah_chen answered your question "SAML setup error"', time: '1d ago', group: 'Yesterday', read: true },
  { id: '7', type: 'system', text: 'Your weekly digest is ready — 3 new answers on your questions', time: '2d ago', group: 'This Week', read: true },
  { id: '8', type: 'badge', text: 'Badge earned: "First Answer" — Posted your first answer', time: '3d ago', group: 'This Week', read: true },
  { id: '9', type: 'vote', text: '3 people upvoted your answer on "Database migration"', time: '4d ago', group: 'This Week', read: true },
  { id: '10', type: 'system', text: 'Welcome to FAQ Crowd! Complete your profile to get started', time: '1w ago', group: 'Earlier', read: true },
];

const FILTERS = ['all', 'answer', 'vote', 'badge', 'moderation', 'system'];
const ICONS: Record<string, string> = { vote: '⬆️', answer: '💬', badge: '🏅', moderation: '🛡️', system: '📢' };

export default function NotificationsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  useEffect(() => {
    // if (!isLoading && !isAuthenticated) router.push('/auth/signin'); // Auth check removed
  }, [isLoading, isAuthenticated, router]);

  const filtered = filter === 'all' ? notifications : notifications.filter(n => n.type === filter);
  const groups = Array.from(new Set(filtered.map(n => n.group)));
  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="page-container animate-fadeIn">
      <div className="flex-between mb-2">
        <h1 className="page-title"><span className="text-gradient">🔔 Notifications</span></h1>
        {unread > 0 && <button className="btn-secondary btn-sm" onClick={markAllRead}>✓ Mark All Read ({unread})</button>}
      </div>

      <div className="filter-chips mb-2">
        {FILTERS.map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'filter-chip--active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="glass-panel glass-panel--static" style={{ overflow: 'hidden' }}>
        {groups.map(group => (
          <div key={group}>
            <div style={{ padding: '0.6rem 1rem', background: 'var(--surface)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{group}</div>
            {filtered.filter(n => n.group === group).map(n => (
              <div key={n.id} className={`notification-card ${!n.read ? 'notification-card--unread' : ''}`} onClick={() => markRead(n.id)}>
                <div className={`notification-dot notification-dot--${n.type}`} />
                <div className="notification-text">
                  <span>{ICONS[n.type]} {n.text}</span>
                </div>
                <span className="notification-time">{n.time}</span>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔕</div>
            <p className="text-secondary">No notifications in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
