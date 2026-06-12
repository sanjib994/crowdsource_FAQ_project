'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /faqs landing hub
    router.push('/faqs');
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg-main)' }}>
      <p style={{ color: '#6b7280' }}>Redirecting to FAQ Portal...</p>
    </div>
  );
}
