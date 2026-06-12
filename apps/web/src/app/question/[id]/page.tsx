'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function QuestionDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('SPAM');
  const [flagDetails, setFlagDetails] = useState('');

  async function fetchQuestion() {
    try {
      const data = await api.questions.get(id as string);
      setQuestion(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  useEffect(() => { if (id) fetchQuestion(); }, [id]);

  async function handleVote(answerId: string, value: number) {
    try {
      await api.answers.vote(answerId, value);
      fetchQuestion();
    } catch (e) { console.error(e); }
  }

  async function handlePostAnswer() {
    if (newAnswer.trim().length < 10) return alert('Answer must be at least 10 characters.');
    setSubmitting(true);
    try {
      await api.answers.create({ questionId: id as string, body: newAnswer });
      setNewAnswer('');
      fetchQuestion();
    } catch (e) { alert('Failed to post answer.'); }
    setSubmitting(false);
  }

  async function handleFlag() {
    try {
      await api.moderation.createFlag({ targetId: id as string, targetType: 'QUESTION', reason: flagReason, details: flagDetails });
      setShowFlagModal(false);
      setFlagDetails('');
      alert('Content flagged for review. Thank you!');
    } catch { alert('Failed to submit flag.'); }
  }

  if (loading) return (
    <div className="page-container">
      <div className="skeleton skeleton--title" style={{ width: '60%', marginBottom: '1rem' }} />
      <div className="skeleton skeleton--text" />
      <div className="skeleton skeleton--text" style={{ width: '80%' }} />
      <div className="skeleton skeleton--card" style={{ marginTop: '2rem' }} />
    </div>
  );

  if (!question) return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
      <h2>Question not found</h2>
      <Link href="/" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Return Home</Link>
    </div>
  );

  const rawAnswers = question.answers || [];
  const sortedAnswers = [...rawAnswers].sort((a: any, b: any) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    if (a.isExpertVerified && !b.isExpertVerified) return -1;
    if (!a.isExpertVerified && b.isExpertVerified) return 1;
    return (b.voteScore || 0) - (a.voteScore || 0);
  });

  const bestAnswer = question.bestAnswer || sortedAnswers[0];
  const otherAnswers = question.otherAnswers || sortedAnswers.filter((a: any) => a.id !== bestAnswer?.id);
  const answerCount = bestAnswer ? otherAnswers.length + 1 : rawAnswers.length;

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/" className="breadcrumb__item">Home</Link>
        <span className="breadcrumb__separator">/</span>
        <span className="breadcrumb__item breadcrumb__item--active">{question.title?.substring(0, 40)}...</span>
      </div>

      {/* Question */}
      <article className="glass-panel" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.8rem', lineHeight: 1.25, fontWeight: 700, flex: 1, marginRight: '1rem', fontFamily: 'var(--font-heading)' }}>
            {question.title}
          </h1>
          <span className={`badge ${question.status === 'OPEN' ? 'badge--warning' : 'badge--success'}`}>
            {question.status}
          </span>
        </div>

        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '1rem', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
          {question.bodyMarkdown}
        </div>

        <div className="tags" style={{ marginBottom: '1.25rem' }}>
          {question.tags?.map((t: any) => (
            <span key={t.tag?.name || t.tagId} className="tag">#{t.tag?.name || t.name}</span>
          ))}
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <button className="btn-ghost btn-sm">📤 Share</button>
          <button className="btn-ghost btn-sm" onClick={() => setShowFlagModal(true)}>🚩 Flag</button>
          <button className="btn-ghost btn-sm">✏️ Edit</button>
          <button className="btn-ghost btn-sm">🔔 Follow</button>
        </div>
      </article>

      {/* Best Answer (if exists) */}
      {bestAnswer && (
        <div className="best-answer answer-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div className="vote-column">
            <button className="vote-arrow" onClick={() => handleVote(bestAnswer.id, 1)}>▲</button>
            <span className="vote-count">{bestAnswer.voteScore || 0}</span>
            <button className="vote-arrow" onClick={() => handleVote(bestAnswer.id, -1)}>▼</button>
          </div>
          <div className="answer-body">
            {bestAnswer.isExpertVerified && <span className="badge badge--expert" style={{ marginBottom: '0.75rem', display: 'inline-flex' }}>✅ Expert Verified</span>}
            <p style={{ whiteSpace: 'pre-wrap' }}>{bestAnswer.bodyMarkdown}</p>
          </div>
        </div>
      )}

      {/* Answers */}
      <section>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          {answerCount} Answer{answerCount !== 1 ? 's' : ''}
        </h3>

        {otherAnswers.map((ans: any) => (
          <div key={ans.id} className="answer-card">
            <div className="vote-column">
              <button className="vote-arrow" onClick={() => handleVote(ans.id, 1)}>▲</button>
              <span className="vote-count">{ans.voteScore || 0}</span>
              <button className="vote-arrow" onClick={() => handleVote(ans.id, -1)}>▼</button>
            </div>
            <div className="answer-body">
              {ans.isExpertVerified && <span className="badge badge--expert" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>✅ Expert Verified</span>}
              {ans.isAIGenerated && <span className="badge badge--ai" style={{ marginBottom: '0.5rem', display: 'inline-flex' }}>🤖 AI Generated</span>}
              <p style={{ whiteSpace: 'pre-wrap' }}>{ans.bodyMarkdown}</p>
            </div>
          </div>
        ))}

        {answerCount === 0 && (
          <div className="glass-panel glass-panel--static" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
            <p style={{ color: 'var(--text-muted)' }}>No answers yet. Be the first to help out!</p>
          </div>
        )}
      </section>

      {/* Post Answer */}
      <section style={{ marginTop: '2rem', marginBottom: '4rem' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Your Answer</h3>
        <div className="glass-panel glass-panel--static" style={{ padding: '1.5rem' }}>
          <textarea className="form-textarea" value={newAnswer} onChange={e => setNewAnswer(e.target.value)}
            placeholder="Write a clear, helpful answer... (supports markdown)" rows={6} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn-primary" onClick={handlePostAnswer} disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Answer →'}
            </button>
          </div>
        </div>
      </section>

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="modal-overlay" onClick={() => setShowFlagModal(false)}>
          <div className="modal-content animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🚩 Flag Content</h3>
              <button className="btn-icon" onClick={() => setShowFlagModal(false)}>✕</button>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Reason</label>
              <select className="form-select" value={flagReason} onChange={e => setFlagReason(e.target.value)}>
                <option value="SPAM">Spam</option>
                <option value="INAPPROPRIATE">Inappropriate</option>
                <option value="OFF_TOPIC">Off Topic</option>
                <option value="DUPLICATE">Duplicate</option>
                <option value="LOW_QUALITY">Low Quality</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Details (optional)</label>
              <textarea className="form-textarea" value={flagDetails} onChange={e => setFlagDetails(e.target.value)}
                placeholder="Provide additional context..." rows={3} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowFlagModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleFlag}>Submit Flag</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
