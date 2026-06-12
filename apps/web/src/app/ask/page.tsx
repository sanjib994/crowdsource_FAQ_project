'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function AskAI() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; content: string }>
  >([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! 👋 I\'m your AI assistant. Ask me anything and I\'ll help you find answers from our FAQ database or provide guidance.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    // Add user message
    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `I found information related to "${question}". Based on our FAQ database, here are the most relevant answers... 

If you don't find what you need, you can <a href="/raise" style="color: var(--color-primary); text-decoration: underline;">raise an issue</a> and our community can help!`,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setLoading(false);
    }, 1000);
  };

  return (
      <div className="ask-container">
        <style jsx>{`
          .ask-container {
            max-width: var(--max-width-container);
            margin: 0 auto;
            padding: 2rem 1rem;
            background: var(--color-bg-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          .ask-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .ask-title {
            font-size: 2rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 0.5rem;
            font-family: var(--font-heading);
          }

          .ask-subtitle {
            font-size: 1rem;
            color: #6b7280;
          }

          .chat-container {
            flex: 1;
            background: var(--color-bg-card);
            border: 1px solid #e5e7eb;
            border-radius: var(--radius-card);
            display: flex;
            flex-direction: column;
            max-height: 600px;
            overflow: hidden;
          }

          .messages {
            flex: 1;
            overflow-y: auto;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .message {
            display: flex;
            gap: 0.75rem;
            animation: fadeIn 300ms ease-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .message--user {
            justify-content: flex-end;
          }

          .message--assistant {
            justify-content: flex-start;
          }

          .message-bubble {
            max-width: 70%;
            padding: 0.75rem 1rem;
            border-radius: 12px;
            line-height: 1.5;
            word-wrap: break-word;
            font-size: 0.95rem;
          }

          .message--user .message-bubble {
            background: var(--color-primary);
            color: white;
          }

          .message--assistant .message-bubble {
            background: #f3f4f6;
            color: #111827;
          }

          .message-bubble a {
            color: inherit;
          }

          .loading-indicator {
            display: flex;
            gap: 0.4rem;
            align-items: center;
          }

          .loading-dot {
            width: 8px;
            height: 8px;
            background: var(--color-primary);
            border-radius: 50%;
            animation: bounce 1.4s infinite;
          }

          .loading-dot:nth-child(2) {
            animation-delay: 0.2s;
          }

          .loading-dot:nth-child(3) {
            animation-delay: 0.4s;
          }

          @keyframes bounce {
            0%,
            80%,
            100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-8px);
            }
          }

          .input-form {
            display: flex;
            gap: 0.75rem;
            padding: 1rem;
            border-top: 1px solid #e5e7eb;
            background: var(--color-bg-card);
          }

          .input-field {
            flex: 1;
            padding: 0.75rem 1rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.95rem;
            color: #111827;
            background: white;
            font-family: var(--font-body);
          }

          .input-field::placeholder {
            color: #9ca3af;
          }

          .send-btn {
            background: var(--color-primary);
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: background var(--transition-fast);
            white-space: nowrap;
          }

          .send-btn:hover {
            background: var(--color-primary-hover);
          }

          .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .next-steps {
            margin-top: 1.5rem;
            background: rgba(139, 92, 246, 0.05);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: var(--radius-card);
            padding: 1rem;
          }

          .next-steps-title {
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.75rem;
            font-size: 0.95rem;
          }

          .next-steps-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: #6b7280;
          }

          .next-steps-item {
            display: flex;
            gap: 0.5rem;
            align-items: flex-start;
          }

          .next-steps-item a {
            color: var(--color-primary);
            font-weight: 600;
            text-decoration: none;
          }

          @media (max-width: 768px) {
            .message-bubble {
              max-width: 85%;
            }

            .ask-title {
              font-size: 1.5rem;
            }

            .chat-container {
              max-height: 400px;
            }
          }
        `}</style>

        {/* Header */}
        <div className="ask-header">
          <h1 className="ask-title">🤖 Ask AI Assistant</h1>
          <p className="ask-subtitle">Get instant answers or get help finding the right information</p>
        </div>

        {/* Chat */}
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message message--${msg.role}`}>
                <div className="message-bubble">
                  {msg.role === 'assistant' && msg.content.includes('<a') ? (
                    <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message message--assistant">
                <div className="message-bubble">
                  <div className="loading-indicator">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form className="input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="input-field"
              placeholder="Type your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="send-btn" disabled={loading || !question.trim()}>
              Send
            </button>
          </form>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <div className="next-steps-title">💡 Next Steps</div>
          <div className="next-steps-list">
            <div className="next-steps-item">
              <span>📚</span>
              <span>
                Didn't find the answer? <Link href="/faqs">Browse all FAQs</Link>
              </span>
            </div>
            <div className="next-steps-item">
              <span>🎫</span>
              <span>
                Still stuck? <Link href="/raise">Raise an issue</Link> and get help from the community
              </span>
            </div>
            <div className="next-steps-item">
              <span>📋</span>
              <span>
                <Link href="/issues">Track your raised issues</Link> here
              </span>
            </div>
          </div>
        </div>
      </div>
  );
}
