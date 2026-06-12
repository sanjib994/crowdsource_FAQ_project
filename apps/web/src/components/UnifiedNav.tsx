'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function UnifiedNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/faqs', label: 'FAQs', icon: '📚' },
    { href: '/ask', label: 'Ask AI', icon: '🤖' },
    { href: '/raise', label: 'Raise Issue', icon: '🎫' },
    { href: '/issues', label: 'My Issues', icon: '📋' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '/experts', label: 'Experts', icon: '👨‍💼' },
    { href: '/admin', label: 'Admin', icon: '⚙️' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="unified-nav">
      <style>{`
        .unified-nav {
          background: var(--color-bg-card);
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 50;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .unav-container {
          max-width: var(--max-width-container);
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: auto;
          min-height: 64px;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .unav-logo {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--color-primary), #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .unav-center {
          display: flex;
          gap: 0.25rem;
          flex: 1;
          justify-content: center;
          margin: 0 1rem;
          overflow-x: auto;
          flex-wrap: wrap;
          align-content: center;
        }

        .unav-link {
          padding: 0.4rem 0.7rem;
          border-radius: var(--radius-card);
          text-decoration: none;
          color: #374151;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
          gap: 0.3rem;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .unav-link:hover {
          background: #f3f4f6;
          color: var(--color-primary);
        }

        .unav-link--active {
          background: rgba(139, 92, 246, 0.1);
          color: var(--color-primary);
          border-bottom: 2px solid var(--color-primary);
        }

        .unav-right {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .unav-user-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(139, 92, 246, 0.1);
          border-radius: var(--radius-card);
          font-size: 0.9rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .hamburger-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.5rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .unav-center {
            display: none;
          }

          .hamburger-btn {
            display: block;
          }

          .unav-container {
            height: auto;
            min-height: 56px;
            padding: 0 1rem;
            flex-wrap: nowrap;
          }

          .unav-mobile-menu {
            position: absolute;
            top: 56px;
            left: 0;
            right: 0;
            background: var(--color-bg-card);
            border-bottom: 1px solid #e5e7eb;
            display: ${mobileMenuOpen ? 'flex' : 'none'};
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem;
            max-height: 70vh;
            overflow-y: auto;
            animation: slideDown 200ms ease-out;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }

        @media (max-width: 1024px) {
          .unav-link {
            font-size: 0.75rem;
            padding: 0.35rem 0.5rem;
          }
        }

        @media (min-width: 1200px) {
          .unav-link {
            font-size: 0.9rem;
            padding: 0.5rem 0.9rem;
          }
        }
      `}</style>

      <div className="unav-container">
        <Link href="/faqs" className="unav-logo">
          ❓ Spurti
        </Link>

        <div className="unav-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`unav-link ${isActive(item.href) ? 'unav-link--active' : ''}`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        <div className="unav-right">
          <div className="unav-user-badge">
            ⭐ 125 pts
          </div>
          <button
            className="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="unav-mobile-menu">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`unav-link ${isActive(item.href) ? 'unav-link--active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
