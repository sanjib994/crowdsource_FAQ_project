'use client';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title"><span className="text-gradient">Terms of Service</span></h1>
        <p className="page-subtitle">Last updated: June 11, 2026</p>
      </div>

      <div className="sidebar-layout">
        <div className="sidebar hidden-mobile" style={{ top: '100px' }}>
          <div className="glass-panel glass-panel--static" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Table of Contents</h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="#acceptance" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>1. Acceptance of Terms</a>
              <a href="#user-accounts" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>2. User Accounts</a>
              <a href="#content-guidelines" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>3. Content Guidelines</a>
              <a href="#intellectual-property" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>4. Intellectual Property</a>
              <a href="#reputation" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>5. Reputation & Privileges</a>
              <a href="#moderation" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>6. Moderation</a>
              <a href="#disclaimers" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>7. Disclaimers</a>
              <a href="#contact" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>8. Contact</a>
            </nav>
          </div>
        </div>

        <div className="main-content glass-panel glass-panel--static" style={{ padding: '2rem' }}>
          <section id="acceptance" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>1. Acceptance of Terms</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              By accessing and using FAQ Crowd ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. We reserve the right to modify these terms at any time.
            </p>
          </section>

          <section id="user-accounts" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>2. User Accounts</h2>
            <p style={{ marginBottom: '0.75rem' }}>When creating an account, you agree that:</p>
            <ul style={{ listStylePosition: 'inside', paddingLeft: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <li>You are at least 18 years old.</li>
              <li>You will provide accurate and complete information.</li>
              <li>You are responsible for safeguarding your password.</li>
              <li>You will notify us immediately of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section id="content-guidelines" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>3. Content Guidelines & Code of Conduct</h2>
            <p style={{ marginBottom: '0.75rem' }}>Users are expected to maintain a respectful and helpful environment. You agree NOT to post content that:</p>
            <ul style={{ listStylePosition: 'inside', paddingLeft: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <li>Is illegal, abusive, harassing, or discriminatory.</li>
              <li>Constitutes spam, phishing, or unauthorized advertising.</li>
              <li>Contains malware or malicious code.</li>
              <li>Violates the intellectual property rights of others.</li>
            </ul>
          </section>

          <section id="intellectual-property" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>4. Intellectual Property</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              All user-generated content submitted to the Service is licensed under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-light)' }}>Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)</a> license. By posting content, you grant FAQ Crowd a non-exclusive, worldwide, royalty-free license to use, copy, reproduce, process, adapt, modify, publish, transmit, display and distribute such content.
            </p>
          </section>

          <section id="reputation" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>5. Reputation & Privileges</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              The Service uses a reputation system to reward positive contributions. Reputation points and associated privileges (such as the ability to vote, edit, or moderate) are not property rights and may be adjusted, suspended, or revoked by FAQ Crowd at any time for violation of these Terms.
            </p>
          </section>

          <section id="moderation" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>6. Moderation & Termination</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We reserve the right, but have no obligation, to monitor and moderate content. We may remove content or terminate user accounts at our sole discretion, without prior notice, for any reason, including but not limited to violations of these Terms.
            </p>
          </section>

          <section id="disclaimers" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>7. Disclaimers & Limitation of Liability</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. FAQ CROWD DOES NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR TIMELINESS OF ANY CONTENT.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              IN NO EVENT SHALL FAQ CROWD BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section id="contact" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>8. Contact</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              If you have any questions about these Terms, please contact us at: <br/>
              <strong style={{ color: 'var(--text-primary)' }}>legal@faqcrowd.example.com</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
