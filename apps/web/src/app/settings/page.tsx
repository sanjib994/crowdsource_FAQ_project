'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';

const SECTIONS = ['profile', 'notifications', 'language', 'privacy', 'security', 'account'];

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [section, setSection] = useState('profile');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // if (!isLoading && !isAuthenticated) router.push('/auth/signin'); // Auth check removed
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) { setDisplayName(user.displayName || ''); }
  }, [user]);

  if (isLoading || !user) return <div className="page-container"><div className="skeleton skeleton--card" /></div>;

  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header"><h1 className="page-title"><span className="text-gradient">⚙️ Settings</span></h1></div>

      <div className="sidebar-layout">
        <div className="sidebar glass-panel glass-panel--static" style={{ padding: '0.75rem' }}>
          <nav className="settings-nav">
            {SECTIONS.map(s => (
              <button key={s} className={`settings-nav__item ${section === s ? 'settings-nav__item--active' : ''}`} onClick={() => setSection(s)}>
                {s === 'profile' ? '👤 Profile' : s === 'notifications' ? '🔔 Notifications' : s === 'language' ? '🌐 Language' : s === 'privacy' ? '🔒 Privacy' : s === 'security' ? '🛡️ Security' : '⚠️ Account'}
              </button>
            ))}
          </nav>
        </div>

        <div className="main-content">
          {/* PROFILE */}
          {section === 'profile' && (
            <div className="glass-panel glass-panel--static" style={{ padding: '1.5rem' }}>
              <h3 className="settings-section__title">Profile Information</h3>
              <div className="form-group mb-2">
                <label className="form-label">Display Name</label>
                <input className="form-input" value={displayName} onChange={e => setDisplayName(e.target.value)} />
              </div>
              <div className="form-group mb-2">
                <label className="form-label">Email</label>
                <input className="form-input" value={user.email} disabled style={{ opacity: 0.5 }} />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} />
              </div>
              <button className="btn-primary">Save Changes</button>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {section === 'notifications' && (
            <div className="glass-panel glass-panel--static" style={{ padding: '1.5rem' }}>
              <h3 className="settings-section__title">In-App Notifications</h3>
              {['New answer on your question', 'Answer accepted or upvoted', 'Badge earned', 'Moderation action on your post', 'Followed question activity'].map((n, i) => (
                <div key={i} className="setting-row">
                  <span className="setting-row__label">{n}</span>
                  <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-switch__slider" /></label>
                </div>
              ))}
              <h3 className="settings-section__title mt-3">Email Notifications</h3>
              {[
                { label: 'Important updates only', checked: true },
                { label: 'Daily digest', checked: false },
                { label: 'Weekly digest', checked: false },
              ].map((n, i) => (
                <div key={i} className="setting-row">
                  <span className="setting-row__label">{n.label}</span>
                  <label className="toggle-switch"><input type="checkbox" defaultChecked={n.checked} /><span className="toggle-switch__slider" /></label>
                </div>
              ))}
            </div>
          )}

          {/* LANGUAGE */}
          {section === 'language' && (
            <div className="glass-panel glass-panel--static" style={{ padding: '1.5rem' }}>
              <h3 className="settings-section__title">Display Settings</h3>
              <div className="form-group mb-2">
                <label className="form-label">UI Language</label>
                <select className="form-select"><option>English</option><option>Spanish</option><option>French</option><option>Hindi</option><option>Arabic</option></select>
              </div>
              <div className="form-group mb-2">
                <label className="form-label">Theme</label>
                <select className="form-select" value={theme} onChange={e => setTheme(e.target.value as any)}>
                  <option value="dark">Dark</option><option value="light">Light</option><option value="high-contrast">High Contrast</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">RTL Mode</label>
                <select className="form-select"><option>Auto</option><option>On</option><option>Off</option></select>
              </div>
            </div>
          )}

          {/* PRIVACY */}
          {section === 'privacy' && (
            <div className="glass-panel glass-panel--static" style={{ padding: '1.5rem' }}>
              <h3 className="settings-section__title">Privacy Settings</h3>
              {['Profile visible to public', 'Show email on profile', 'Activity history visible'].map((n, i) => (
                <div key={i} className="setting-row">
                  <span className="setting-row__label">{n}</span>
                  <label className="toggle-switch"><input type="checkbox" defaultChecked={i < 2} /><span className="toggle-switch__slider" /></label>
                </div>
              ))}
            </div>
          )}

          {/* SECURITY */}
          {section === 'security' && (
            <div className="glass-panel glass-panel--static" style={{ padding: '1.5rem' }}>
              <h3 className="settings-section__title">Change Password</h3>
              <div className="form-group mb-2"><label className="form-label">Current Password</label><input className="form-input" type="password" /></div>
              <div className="form-group mb-2"><label className="form-label">New Password</label><input className="form-input" type="password" /></div>
              <div className="form-group mb-3"><label className="form-label">Confirm New Password</label><input className="form-input" type="password" /></div>
              <button className="btn-primary">Update Password</button>
              <h3 className="settings-section__title mt-3">Two-Factor Authentication</h3>
              <p className="text-secondary text-sm mb-1">Add an extra layer of security to your account.</p>
              <button className="btn-outlined">Enable 2FA</button>
            </div>
          )}

          {/* ACCOUNT */}
          {section === 'account' && (
            <div className="danger-zone">
              <h3 className="danger-zone__title">⚠️ Danger Zone</h3>
              <div className="setting-row">
                <div><span className="setting-row__label">📦 Export My Data</span><div className="setting-row__desc">Download all your data as JSON</div></div>
                <button className="btn-outlined btn-sm">Export</button>
              </div>
              <div className="setting-row" style={{ borderBottom: 'none' }}>
                <div><span className="setting-row__label">🗑️ Delete Account</span><div className="setting-row__desc">Permanently delete your account and all data</div></div>
                <button className="btn-danger btn-sm" onClick={() => setShowDeleteModal(true)}>Delete</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">⚠️ Delete Account</h3><button className="btn-icon" onClick={() => setShowDeleteModal(false)}>✕</button></div>
            <div className="alert alert--danger mb-2">This action is <strong>irreversible</strong>. All your questions, answers, reputation, and badges will be permanently deleted.</div>
            <p className="text-sm text-secondary mb-3">Type <strong>DELETE</strong> to confirm:</p>
            <input className="form-input mb-3" placeholder="Type DELETE to confirm" />
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger">Delete Account Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
