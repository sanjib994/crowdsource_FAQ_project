'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function RaiseIssue() {
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    attachment: null as File | null,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, attachment: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Ticket submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ question: '', description: '', attachment: null });
      setSubmitted(false);
    }, 3000);
  };

  const openQueue = [
    {
      id: 1,
      question: 'How to reset password?',
      postedBy: 'Alice M.',
      timeAgo: '2 hours ago',
      status: 'OPEN',
    },
    {
      id: 2,
      question: 'Issue with file upload',
      postedBy: 'Bob T.',
      timeAgo: '4 hours ago',
      status: 'OPEN',
    },
    {
      id: 3,
      question: 'Can\'t access dashboard',
      postedBy: 'Carol D.',
      timeAgo: '1 day ago',
      status: 'OPEN',
    },
  ];

  return (
      <div className="raise-container">
        <style jsx>{`
          .raise-container {
            max-width: var(--max-width-container);
            margin: 0 auto;
            padding: 2rem 1rem;
            background: var(--color-bg-main);
            min-height: 100vh;
          }

          .raise-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .raise-title {
            font-size: 2rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.5rem;
            font-family: var(--font-heading);
          }

          .raise-subtitle {
            font-size: 1rem;
            color: #6b7280;
          }

          .layout {
            display: grid;
            grid-template-columns: 1fr 350px;
            gap: 2rem;
          }

          .form-section {
            background: var(--color-bg-card);
            border: 1px solid #e5e7eb;
            border-radius: var(--radius-card);
            padding: 2rem;
          }

          .form-title {
            font-size: 1.3rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 1.5rem;
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }

          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-label {
            display: block;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
          }

          .form-input,
          .form-textarea {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.95rem;
            font-family: var(--font-body);
            background: white;
            color: #111827;
            transition: border-color var(--transition-fast);
          }

          .form-input::placeholder,
          .form-textarea::placeholder {
            color: #9ca3af;
          }

          .form-input:focus,
          .form-textarea:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
          }

          .form-textarea {
            resize: vertical;
            min-height: 120px;
          }

          .file-upload {
            position: relative;
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .file-upload:hover {
            border-color: var(--color-primary);
            background: rgba(139, 92, 246, 0.02);
          }

          .file-upload input {
            display: none;
          }

          .file-upload-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }

          .file-upload-text {
            font-size: 0.9rem;
            color: #6b7280;
          }

          .file-upload-hint {
            font-size: 0.8rem;
            color: #9ca3af;
            margin-top: 0.5rem;
          }

          .file-selected {
            padding: 0.75rem 1rem;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid #10b981;
            border-radius: 8px;
            color: #10b981;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .submit-btn {
            background: linear-gradient(135deg, var(--color-primary), #06b6d4);
            color: white;
            padding: 0.75rem 2rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            font-size: 1rem;
            transition: all var(--transition-fast);
            width: 100%;
          }

          .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
          }

          .submit-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .success-message {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 1rem;
            color: #10b981;
            text-align: center;
            margin-bottom: 1rem;
            animation: slideDown 300ms ease-out;
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

          .sidebar {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }

          .queue-widget {
            background: var(--color-bg-card);
            border: 1px solid #e5e7eb;
            border-radius: var(--radius-card);
            padding: 1.5rem;
          }

          .queue-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 1rem;
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }

          .queue-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }

          .queue-item {
            padding: 1rem;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all var(--transition-fast);
          }

          .queue-item:hover {
            border-color: var(--color-primary);
            background: white;
          }

          .queue-item-question {
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
            display: block;
            font-size: 0.95rem;
          }

          .queue-item-meta {
            font-size: 0.8rem;
            color: #9ca3af;
            display: flex;
            justify-content: space-between;
          }

          .queue-status {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: rgba(59, 130, 246, 0.1);
            color: #3b82f6;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .info-widget {
            background: rgba(59, 130, 246, 0.05);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: var(--radius-card);
            padding: 1.5rem;
          }

          .info-title {
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.75rem;
            font-size: 0.95rem;
          }

          .info-text {
            font-size: 0.9rem;
            color: #6b7280;
            line-height: 1.6;
          }

          @media (max-width: 768px) {
            .layout {
              grid-template-columns: 1fr;
            }

            .raise-title {
              font-size: 1.5rem;
            }

            .form-section {
              padding: 1.5rem;
            }
          }
        `}</style>

        {/* Header */}
        <div className="raise-header">
          <h1 className="raise-title">🎫 Raise an Issue</h1>
          <p className="raise-subtitle">
            Can't find the answer? Get help from our community
          </p>
        </div>

        {/* Main Layout */}
        <div className="layout">
          {/* Form Section */}
          <div className="form-section">
            {submitted && (
              <div className="success-message">
                ✅ Issue submitted successfully! We'll notify the community.
              </div>
            )}

            <h2 className="form-title">📝 Create New Issue</h2>

            <form onSubmit={handleSubmit}>
              {/* Question */}
              <div className="form-group">
                <label className="form-label">Issue Title</label>
                <input
                  type="text"
                  name="question"
                  className="form-input"
                  placeholder="Summarize your issue in one line"
                  value={formData.question}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  placeholder="Provide more context about your issue. Include steps to reproduce, error messages, etc."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label className="form-label">Attach File (Optional)</label>
                <div
                  className="file-upload"
                  onClick={(e) => e.currentTarget.querySelector('input')?.click()}
                >
                  <div className="file-upload-icon">📎</div>
                  <div className="file-upload-text">
                    Click to upload or drag and drop
                  </div>
                  <div className="file-upload-hint">
                    Screenshots, logs, or any supporting files
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.txt,.log"
                  />
                </div>
                {formData.attachment && (
                  <div className="file-selected">
                    <span>✓ {formData.attachment.name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, attachment: null }))
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#10b981',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn">
                Submit Issue
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* Open Queue */}
            <div className="queue-widget">
              <div className="queue-title">📋 Open Queue</div>
              <div className="queue-list">
                {openQueue.map((item) => (
                  <a
                    key={item.id}
                    href={`#queue-${item.id}`}
                    className="queue-item"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="queue-item-question">{item.question}</div>
                    <div className="queue-item-meta">
                      <span>{item.postedBy}</span>
                      <span>{item.timeAgo}</span>
                    </div>
                  </a>
                ))}
              </div>
              <Link
                href="/issues"
                style={{
                  marginTop: '1rem',
                  display: 'block',
                  textAlign: 'center',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                View All →
              </Link>
            </div>

            {/* Info Widget */}
            <div className="info-widget">
              <div className="info-title">💡 Pro Tips</div>
              <div className="info-text">
                <p style={{ marginBottom: '0.5rem' }}>
                  ✓ Be specific and descriptive
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  ✓ Include error messages
                </p>
                <p>✓ Add screenshots or logs if helpful</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
