'use client';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import UnifiedNav from '@/components/UnifiedNav';

// Navbar component deprecated - using UnifiedNav instead

function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="cookie-banner">
      <span className="cookie-banner__text">🍪 We use cookies for functionality and analytics. <Link href="/privacy">Privacy Policy</Link></span>
      <div className="cookie-banner__actions">
        <button className="btn-ghost btn-sm" onClick={() => { localStorage.setItem('cookie-consent', 'rejected'); setShow(false); }}>Reject</button>
        <button className="btn-primary btn-sm" onClick={() => { localStorage.setItem('cookie-consent', 'accepted'); setShow(false); }}>Accept</button>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="description" content="Unified FAQ crowdsourcing platform - Search FAQs, Ask AI, Raise Issues, Track Progress" />
      </head>
      <body>
        <AuthProvider>
          <ThemeProvider>
            <UnifiedNav />
            <main>{children}</main>
            <CookieBanner />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
