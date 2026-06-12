'use client';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="page-container animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title"><span className="text-gradient">Privacy Policy</span></h1>
        <p className="page-subtitle">Last updated: June 11, 2026</p>
      </div>

      <div className="sidebar-layout">
        <div className="sidebar hidden-mobile" style={{ top: '100px' }}>
          <div className="glass-panel glass-panel--static" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Table of Contents</h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="#information-we-collect" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>1. Information We Collect</a>
              <a href="#how-we-use" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>2. How We Use Your Information</a>
              <a href="#data-sharing" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>3. Data Sharing</a>
              <a href="#cookies" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>4. Cookies</a>
              <a href="#your-rights" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>5. Your Rights (GDPR)</a>
              <a href="#data-retention" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>6. Data Retention</a>
              <a href="#contact" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>7. Contact Us</a>
            </nav>
          </div>
        </div>

        <div className="main-content glass-panel glass-panel--static" style={{ padding: '2rem' }}>
          <p className="mb-2" style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>
            FAQ Crowd ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by FAQ Crowd.
          </p>

          <section id="information-we-collect" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>1. Information We Collect</h2>
            <p style={{ marginBottom: '0.75rem' }}>We collect information that you provide directly to us:</p>
            <ul style={{ listStylePosition: 'inside', paddingLeft: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <li><strong>Account Information:</strong> When you register, we collect your display name, email address, and password.</li>
              <li><strong>Profile Information:</strong> You may choose to provide additional information such as a bio or organization details.</li>
              <li><strong>Content:</strong> We collect the questions, answers, comments, and votes you submit to the platform.</li>
            </ul>
          </section>

          <section id="how-we-use" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>2. How We Use Your Information</h2>
            <p style={{ marginBottom: '0.75rem' }}>We use the information we collect to:</p>
            <ul style={{ listStylePosition: 'inside', paddingLeft: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <li>Provide, maintain, and improve our platform.</li>
              <li>Process transactions and send related information.</li>
              <li>Send technical notices, updates, security alerts, and support messages.</li>
              <li>Respond to your comments, questions, and customer service requests.</li>
              <li>Calculate reputation scores, award badges, and manage leaderboard rankings.</li>
            </ul>
          </section>

          <section id="data-sharing" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>3. Data Sharing</h2>
            <p style={{ marginBottom: '0.75rem' }}>We do not sell your personal information. We may share information as follows:</p>
            <ul style={{ listStylePosition: 'inside', paddingLeft: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <li><strong>Publicly:</strong> Questions, answers, comments, display name, and reputation score are visible to the public.</li>
              <li><strong>Service Providers:</strong> We may share information with vendors who need access to such information to carry out work on our behalf.</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights.</li>
            </ul>
          </section>

          <section id="cookies" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>4. Cookies</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We use cookies and similar tracking technologies to track the activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform, such as staying logged in.
            </p>
          </section>

          <section id="your-rights" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>5. Your Rights (GDPR & CCPA)</h2>
            <p style={{ marginBottom: '0.75rem' }}>Depending on your location, you may have the right to:</p>
            <ul style={{ listStylePosition: 'inside', paddingLeft: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <li>Access the personal information we hold about you.</li>
              <li>Request the correction of inaccurate personal information.</li>
              <li>Request the deletion of your personal information (right to be forgotten).</li>
              <li>Opt-out of certain data processing activities.</li>
            </ul>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>You can exercise these rights through your <Link href="/settings">Account Settings</Link> or by contacting us.</p>
          </section>

          <section id="data-retention" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>6. Data Retention</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              We retain personal information we collect from you where we have an ongoing legitimate business need to do so (for example, to provide you with a service you have requested or to comply with applicable legal, tax, or accounting requirements). When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize it.
            </p>
          </section>

          <section id="contact" className="mb-3">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-light)' }}>7. Contact Us</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              If you have any questions about this Privacy Policy, please contact us at: <br/>
              <strong style={{ color: 'var(--text-primary)' }}>privacy@faqcrowd.example.com</strong>
            </p>
          </section>

          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <p>Content on FAQ Crowd is licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>CC BY-SA 4.0</a> unless otherwise noted.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
