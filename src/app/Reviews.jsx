import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Copy, External, Plus, Star, Stars, Trash } from '../components/Icons.jsx';
import { useLang } from '../lib/i18n.jsx';
import { suggestReply } from '../lib/messages.js';
import { useStore } from '../lib/store.jsx';
import { copyText, Modal, useS } from './ui.jsx';

const GOOGLE_REVIEWS_URL = 'https://business.google.com/reviews';

function AddReview({ onClose, onSave }) {
  const s = useS();
  const [f, setF] = useState({ author: '', rating: 5, text: '' });
  const submit = (e) => {
    e.preventDefault();
    if (!f.author.trim()) return;
    onSave({ ...f, author: f.author.trim(), text: f.text.trim() });
    onClose();
  };
  return (
    <Modal title={s.addReview} onClose={onClose}>
      <form onSubmit={submit} className="stack">
        <label className="field">{s.reviewer}
          <input className="input" autoFocus required value={f.author} onChange={(e) => setF({ ...f, author: e.target.value })} placeholder="Tina P." />
        </label>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{s.stars}</legend>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" aria-label={`${n}`} aria-pressed={f.rating === n} onClick={() => setF({ ...f, rating: n })} style={{ border: 0, background: 'none', padding: 4, cursor: 'pointer' }}>
                <Star size={32} color={n <= f.rating ? '#FFB547' : '#E5E1EA'} />
              </button>
            ))}
          </div>
        </fieldset>
        <label className="field">{s.reviewText}
          <textarea className="input" rows={4} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} placeholder="So relaxing, and my dip lasted three weeks!" />
        </label>
        <div className="hstack">
          <button type="button" className="btn btn-quiet" onClick={onClose}>{s.cancel}</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{s.save}</button>
        </div>
      </form>
    </Modal>
  );
}

function ReviewCard({ review, salon, onUpdate, onRemove, toast }) {
  const s = useS();
  const { lang: uiLang } = useLang();
  const [lang, setLang] = useState(uiLang);
  const [draft, setDraft] = useState(review.reply || suggestReply(review, salon, uiLang));

  const switchLang = (l) => { setLang(l); setDraft(suggestReply(review, salon, l)); };
  const approve = async () => {
    if (await copyText(draft)) toast(s.copied);
    onUpdate({ reply: draft, replied: true });
  };

  return (
    <article className="panel stack">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div className="grow">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <strong>{review.author}</strong>
            <Stars n={review.rating} size={15} />
            {review.replied && <span className="tag green">{s.replied}</span>}
          </div>
          <div className="muted small">{new Date(review.date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
        <button type="button" className="btn btn-danger btn-xs" aria-label={s.delete} onClick={onRemove}><Trash size={14} /></button>
      </div>
      {review.text && <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55 }}>"{review.text}"</p>}
      <div style={{ background: 'var(--surface)', borderRadius: 22, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--magenta)' }}>{s.suggested}</span>
          <div className="seg" role="group" aria-label={s.replyLang}>
            <button type="button" aria-pressed={lang === 'en'} onClick={() => switchLang('en')}>EN</button>
            <button type="button" aria-pressed={lang === 'vi'} onClick={() => switchLang('vi')}>VI</button>
          </div>
        </div>
        <textarea className="input" lang={lang} rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} style={{ background: '#fff' }} />
        <div className="hstack">
          <button type="button" className="btn btn-primary btn-sm" onClick={approve}><Copy size={16} />{s.approveCopy}</button>
          <a className="btn btn-quiet btn-sm" href={GOOGLE_REVIEWS_URL} target="_blank" rel="noreferrer"><External />{s.openGoogle}</a>
          {!review.replied && <button type="button" className="link-btn" onClick={() => onUpdate({ reply: draft, replied: true })}>{s.markReplied}</button>}
        </div>
      </div>
    </article>
  );
}

export default function Reviews() {
  const s = useS();
  const { toast } = useOutletContext();
  const { salon, reviews, addReview, updateReview, removeReview } = useStore();
  const [adding, setAdding] = useState(false);
  const sorted = [...reviews].sort((a, b) => Number(a.replied) - Number(b.replied) || b.date.localeCompare(a.date));

  return (
    <>
      <div className="app-top">
        <div>
          <h1>{s.reviewsTitle}</h1>
          <p>{s.reviewsSub}</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}><Plus size={16} />{s.addReview}</button>
      </div>

      <section className="panel" style={{ background: 'linear-gradient(150deg,#F6F3F8,#FFF8E6)' }}>
        <h2>{s.shareTitle}</h2>
        <p className="muted" style={{ margin: '4px 0 12px' }}>{s.shareSub}</p>
        {salon.googleReviewLink ? (
          <div className="hstack">
            <code style={{ background: '#fff', borderRadius: 999, padding: '10px 18px', fontSize: 14, wordBreak: 'break-all' }}>{salon.googleReviewLink}</code>
            <button type="button" className="btn btn-quiet btn-sm" onClick={async () => (await copyText(salon.googleReviewLink)) && toast(s.copied)}><Copy size={16} />{s.copy}</button>
          </div>
        ) : (
          <p style={{ margin: 0 }}>{s.noLink} <Link to="/app/settings" style={{ fontWeight: 600 }}>{s.goSettings} →</Link></p>
        )}
      </section>

      {sorted.length === 0 ? (
        <section className="panel empty">{s.noReviews}</section>
      ) : (
        sorted.map((r) => (
          <ReviewCard key={r.id} review={r} salon={salon} toast={toast} onUpdate={(p) => updateReview(r.id, p)} onRemove={() => removeReview(r.id)} />
        ))
      )}

      {adding && <AddReview onClose={() => setAdding(false)} onSave={addReview} />}
    </>
  );
}
