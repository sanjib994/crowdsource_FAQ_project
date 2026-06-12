'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function FAQsHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ['Registration', 'Technical', 'Events', 'General'];

  const faqs = [
    {
      id: 1,
      category: 'Registration',
      question: 'How do I create an account?',
      answer: 'Click the Sign Up button on the homepage...',
      views: 1250,
    },
    {
      id: 2,
      category: 'Technical',
      question: 'Why am I getting an error on upload?',
      answer: 'This usually happens when the file size exceeds...',
      views: 892,
    },
    {
      id: 3,
      category: 'Events',
      question: 'When is the next event?',
      answer: 'The next event is scheduled for...',
      views: 650,
    },
    {
      id: 4,
      category: 'General',
      question: 'Is there a mobile app?',
      answer: 'Yes, you can download it from...',
      views: 2100,
    },
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      (selectedCategory === null || faq.category === selectedCategory) &&
      (searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const trendingFAQs = [...faqs].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
      <div className="faqs-container">
        <style jsx>{`
          .faqs-container {
            max-width: var(--max-width-container);
            margin: 0 auto;
            padding: 2rem 1rem;
            background: var(--color-bg-main);
            min-height: 100vh;
          }

          .hero {
            text-align: center;
            margin-bottom: 3rem;
          }

          .hero-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.5rem;
            font-family: var(--font-heading);
          }

          .hero-subtitle {
            font-size: 1.1rem;
            color: #6b7280;
            margin-bottom: 2rem;
          }

          .search-bar {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
          }

          .search-input {
            flex: 1;
            min-width: 250px;
            padding: 0.75rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: var(--radius-card);
            font-size: 1rem;
            background: var(--color-bg-card);
            color: #111827;
          }

          .search-input::placeholder {
            color: #9ca3af;
          }

          .category-filter {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
          }

          .category-btn {
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

          .category-btn:hover {
            border-color: var(--color-primary);
            color: var(--color-primary);
          }

          .category-btn--active {
            background: var(--color-primary);
            color: white;
            border-color: var(--color-primary);
          }

          .layout {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 2rem;
          }

          .faq-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .faq-card {
            background: var(--color-bg-card);
            border: 1px solid #e5e7eb;
            border-radius: var(--radius-card);
            padding: 1.5rem;
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .faq-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
          }

          .faq-category {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: rgba(139, 92, 246, 0.1);
            color: var(--color-primary);
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .faq-question {
            font-size: 1.1rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
            display: block;
            text-decoration: none;
          }

          .faq-answer {
            color: #6b7280;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 0.75rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .faq-meta {
            font-size: 0.85rem;
            color: #9ca3af;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .sidebar {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .trending-widget {
            background: var(--color-bg-card);
            border: 1px solid #e5e7eb;
            border-radius: var(--radius-card);
            padding: 1.5rem;
          }

          .trending-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 1rem;
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }

          .trending-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .trending-item {
            padding: 0.75rem;
            background: #f9fafb;
            border-radius: 8px;
            text-decoration: none;
            cursor: pointer;
            transition: background var(--transition-fast);
          }

          .trending-item:hover {
            background: #f3f4f6;
          }

          .trending-item-text {
            font-size: 0.9rem;
            color: #111827;
            font-weight: 500;
            display: block;
            margin-bottom: 0.25rem;
          }

          .trending-item-views {
            font-size: 0.8rem;
            color: #9ca3af;
          }

          .cta-widget {
            background: linear-gradient(135deg, var(--color-primary), #06b6d4);
            color: white;
            border-radius: var(--radius-card);
            padding: 1.5rem;
            text-align: center;
          }

          .cta-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
          }

          .cta-description {
            font-size: 0.9rem;
            margin-bottom: 1rem;
            opacity: 0.95;
          }

          .cta-button {
            background: white;
            color: var(--color-primary);
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: transform var(--transition-fast);
          }

          .cta-button:hover {
            transform: translateY(-2px);
          }

          .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: #9ca3af;
          }

          .empty-state-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }

          @media (max-width: 768px) {
            .layout {
              grid-template-columns: 1fr;
            }

            .hero-title {
              font-size: 1.8rem;
            }

            .search-input {
              min-width: 100%;
            }
          }
        `}</style>

        {/* Hero */}
        <div className="hero">
          <h1 className="hero-title">FAQ Portal</h1>
          <p className="hero-subtitle">
            Find instant answers to common questions
          </p>
        </div>

        {/* Search & Filters */}
        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <button
            className={`category-btn ${selectedCategory === null ? 'category-btn--active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${selectedCategory === cat ? 'category-btn--active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Layout */}
        <div className="layout">
          {/* FAQ List */}
          <div className="faq-list">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div key={faq.id} className="faq-card">
                  <div className="faq-category">{faq.category}</div>
                  <a href={`#faq-${faq.id}`} className="faq-question">
                    {faq.question}
                  </a>
                  <p className="faq-answer">{faq.answer}</p>
                  <div className="faq-meta">
                    <span>👁️ {faq.views} views</span>
                    <Link href="/ask" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      Still stuck? Ask AI →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p>No FAQs found. Try a different search or <Link href="/ask" style={{ color: 'var(--color-primary)' }}>ask AI</Link>.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* Trending Widget */}
            <div className="trending-widget">
              <div className="trending-title">🔥 Trending FAQs</div>
              <div className="trending-list">
                {trendingFAQs.map((faq) => (
                  <a key={faq.id} href={`#faq-${faq.id}`} className="trending-item">
                    <span className="trending-item-text">{faq.question}</span>
                    <span className="trending-item-views">👁️ {faq.views} views</span>
                  </a>
                ))}
              </div>
            </div>

            {/* CTA Widget */}
            <div className="cta-widget">
              <div className="cta-title">Still need help?</div>
              <p className="cta-description">Get instant answers from our AI assistant</p>
              <Link href="/ask" className="cta-button">
                Ask AI Now
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}
