'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function MyIssues() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'claimed' | 'resolved'>('all');

  const allIssues = [
    {
      id: 1,
      title: 'How to reset password?',
      status: 'OPEN' as const,
      createdAt: '2 hours ago',
      assignedTo: null,
      linkedFaq: null,
    },
    {
      id: 2,
      title: 'Issue with file upload',
      status: 'CLAIMED' as const,
      createdAt: '4 hours ago',
      assignedTo: 'Alice M.',
      linkedFaq: null,
    },
    {
      id: 3,
      title: 'Can\'t access dashboard',
      status: 'RESOLVED' as const,
      createdAt: '1 day ago',
      assignedTo: 'Bob T.',
      linkedFaq: 'View resolution in FAQ →',
    },
    {
      id: 4,
      title: 'Error on profile update',
      status: 'OPEN' as const,
      createdAt: '3 days ago',
      assignedTo: null,
      linkedFaq: null,
    },
    {
      id: 5,
      title: 'Payment gateway timeout',
      status: 'RESOLVED' as const,
      createdAt: '1 week ago',
      assignedTo: 'Carol D.',
      linkedFaq: 'View resolution in FAQ →',
    },
  ];

  const filteredIssues =
    filterStatus === 'all'
      ? allIssues
      : allIssues.filter((issue) => issue.status === filterStatus.toUpperCase());

  const issueStats = {
    open: allIssues.filter((i) => i.status === 'OPEN').length,
    claimed: allIssues.filter((i) => i.status === 'CLAIMED').length,
    resolved: allIssues.filter((i) => i.status === 'RESOLVED').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '#3b82f6';
      case 'CLAIMED':
        return '#f59e0b';
      case 'RESOLVED':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '🔵';
      case 'CLAIMED':
        return '🟡';
      case 'RESOLVED':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
      <div className="issues-container">
        <style jsx>{`
          .issues-container {
            max-width: var(--max-width-container);
            margin: 0 auto;
            padding: 2rem 1rem;
            background: var(--color-bg-main);
            min-height: 100vh;
          }

          .header {
            margin-bottom: 2rem;
          }

          .header-title {
            font-size: 2rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.5rem;
            font-family: var(--font-heading);
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }

          .header-subtitle {
            font-size: 1rem;
            color: #6b7280;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .stat-card {
            background: var(--color-bg-card);
            border: 1px solid #e5e7eb;
            border-radius: var(--radius-card);
            padding: 1.5rem;
            text-align: center;
            transition: all var(--transition-fast);
          }

          .stat-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
          }

          .stat-icon {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
          }

          .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.25rem;
          }

          .stat-label {
            font-size: 0.9rem;
            color: #6b7280;
          }

          .filter-bar {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
          }

          .filter-btn {
            padding: 0.5rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: var(--radius-card);
            background: var(--color-bg-card);
            color: #6b7280;
            cursor: pointer;
            font-weight: 500;
            transition: all var(--transition-fast);
            white-space: nowrap;
          }

          .filter-btn:hover {
            border-color: var(--color-primary);
            color: var(--color-primary);
          }

          .filter-btn--active {
            background: var(--color-primary);
            color: white;
            border-color: var(--color-primary);
          }

          .issues-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .issue-card {
            background: var(--color-bg-card);
            border: 1px solid #e5e7eb;
            border-radius: var(--radius-card);
            padding: 1.5rem;
            cursor: pointer;
            transition: all var(--transition-fast);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
          }

          .issue-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
          }

          .issue-left {
            flex: 1;
          }

          .issue-title {
            font-size: 1rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.75rem;
            display: block;
            text-decoration: none;
          }

          .issue-meta {
            display: flex;
            gap: 1.5rem;
            font-size: 0.85rem;
            color: #6b7280;
            margin-bottom: 0.75rem;
            flex-wrap: wrap;
          }

          .meta-item {
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }

          .issue-status {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.35rem 0.75rem;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-top: 0.5rem;
          }

          .issue-right {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            align-items: flex-end;
            white-space: nowrap;
          }

          .assigned-to {
            padding: 0.35rem 0.75rem;
            background: rgba(139, 92, 246, 0.1);
            border-radius: 6px;
            font-size: 0.85rem;
            color: var(--color-primary);
            font-weight: 600;
          }

          .faq-link {
            color: var(--color-primary);
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 600;
            transition: color var(--transition-fast);
          }

          .faq-link:hover {
            color: var(--color-primary-hover);
            text-decoration: underline;
          }

          .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            background: var(--color-bg-card);
            border: 1px dashed #e5e7eb;
            border-radius: var(--radius-card);
            color: #9ca3af;
          }

          .empty-state-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          .empty-state-text {
            color: #6b7280;
            margin-bottom: 1rem;
          }

          .empty-state-cta {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: var(--color-primary);
            color: white;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: background var(--transition-fast);
          }

          .empty-state-cta:hover {
            background: var(--color-primary-hover);
          }

          @media (max-width: 768px) {
            .header-title {
              font-size: 1.5rem;
            }

            .issue-card {
              flex-direction: column;
              align-items: flex-start;
            }

            .issue-right {
              align-items: flex-start;
              width: 100%;
            }

            .stats-grid {
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            }
          }
        `}</style>

        {/* Header */}
        <div className="header">
          <h1 className="header-title">📋 My Issues</h1>
          <p className="header-subtitle">
            Track the status of all issues you've raised
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🔵</div>
            <div className="stat-value">{issueStats.open}</div>
            <div className="stat-label">Open</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟡</div>
            <div className="stat-value">{issueStats.claimed}</div>
            <div className="stat-label">Claimed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-value">{issueStats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>

        {/* Filter */}
        <div className="filter-bar">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'filter-btn--active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Issues
          </button>
          <button
            className={`filter-btn ${filterStatus === 'open' ? 'filter-btn--active' : ''}`}
            onClick={() => setFilterStatus('open')}
          >
            Open
          </button>
          <button
            className={`filter-btn ${filterStatus === 'claimed' ? 'filter-btn--active' : ''}`}
            onClick={() => setFilterStatus('claimed')}
          >
            Claimed
          </button>
          <button
            className={`filter-btn ${filterStatus === 'resolved' ? 'filter-btn--active' : ''}`}
            onClick={() => setFilterStatus('resolved')}
          >
            Resolved
          </button>
        </div>

        {/* Issues List */}
        {filteredIssues.length > 0 ? (
          <div className="issues-list">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="issue-card">
                <div className="issue-left">
                  <a href={`#issue-${issue.id}`} className="issue-title">
                    {issue.title}
                  </a>
                  <div className="issue-meta">
                    <div className="meta-item">
                      📅 {issue.createdAt}
                    </div>
                    {issue.assignedTo && (
                      <div className="meta-item">
                        👤 Assigned to {issue.assignedTo}
                      </div>
                    )}
                  </div>
                  <div
                    className="issue-status"
                    style={{ backgroundColor: `${getStatusColor(issue.status)}20`, color: getStatusColor(issue.status) }}
                  >
                    {getStatusIcon(issue.status)} {issue.status}
                  </div>
                </div>
                <div className="issue-right">
                  {issue.assignedTo && (
                    <div className="assigned-to">✓ {issue.assignedTo}</div>
                  )}
                  {issue.linkedFaq && (
                    <a href="#faq-resolution" className="faq-link">
                      {issue.linkedFaq}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-text">
              {filterStatus === 'all'
                ? 'You haven\'t raised any issues yet.'
                : `No ${filterStatus} issues found.`}
            </p>
            <Link href="/raise" className="empty-state-cta">
              Raise an Issue
            </Link>
          </div>
        )}
      </div>
  );
}
