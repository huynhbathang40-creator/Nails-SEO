import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Close, Copy, Send } from '../components/Icons.jsx';
import { digits, fmtPhone } from '../lib/calc.js';
import { useLang } from '../lib/i18n.jsx';
import { buildMessage, SERVICES, smsHref } from '../lib/messages.js';
import { today, useStore } from '../lib/store.jsx';
import { S } from './strings.js';

export const useS = () => S[useLang().lang];

export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?';
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

export function Modal({ title, sub, onClose, children, width = 520 }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-h" style={{ width: `min(${width}px, 100%)` }}>
        <div className="rainbow-bar" />
        <div className="dialog-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <h2 id="dlg-h">{title}</h2>
              {sub && <p style={{ margin: '4px 0 0', fontSize: 15, color: 'var(--muted)' }}>{sub}</p>}
            </div>
            <button type="button" className="icon-btn" aria-label="Close" onClick={onClose} style={{ width: 44, height: 44 }}><Close size={18} /></button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// Shows the ready-to-send text for one client and opens the phone's Messages app.
export function SendSheet({ client, kind, onClose, toast }) {
  const s = useS();
  const { salon, templates, markSent } = useStore();
  const [text, setText] = useState(() => buildMessage(kind, client, salon, templates));
  const [copied, setCopied] = useState(false);
  const [opened, setOpened] = useState(false);
  const missing = kind === 'review' ? !salon.googleReviewLink : !salon.bookingLink && !salon.phone;

  const done = () => { markSent(client.id, kind); toast?.(s.sentToast); onClose(); };

  return (
    <Modal title={s.sendTitle[kind]} sub={`${s.sendTo(client.name)} · ${client.phone}`} onClose={onClose}>
      {missing && (
        <div style={{ background: '#FEF3C7', color: '#92400E', borderRadius: 18, padding: '12px 16px', fontSize: 14 }}>
          {s.missingLink[kind]} <Link to="/app/settings" onClick={onClose} style={{ color: '#92400E', fontWeight: 600 }}>{s.goSettings} →</Link>
        </div>
      )}
      <label className="field">
        <span className="sr-only">Message</span>
        <textarea className="input" lang={client.language} value={text} onChange={(e) => setText(e.target.value)} rows={5} style={{ background: '#F1EEF4', border: 0, borderRadius: '20px 20px 20px 6px' }} />
      </label>
      <p className="muted small" style={{ margin: 0 }}>{s.sendHint}</p>
      <a className="btn btn-primary btn-block" href={smsHref(client.phone, text)} onClick={() => setOpened(true)}><Send />{s.openMessages}</a>
      <div className="hstack">
        <button type="button" className="btn btn-quiet" style={{ flex: 1 }} onClick={async () => { if (await copyText(text)) { setCopied(true); setTimeout(() => setCopied(false), 1500); } }}>
          <Copy />{copied ? s.copied : s.copy}
        </button>
        <button type="button" className={`btn ${opened ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={done}>{s.markSent}</button>
      </div>
    </Modal>
  );
}

export function ClientForm({ client, onClose, onSave }) {
  const s = useS();
  const { salon } = useStore();
  const [f, setF] = useState(() => ({
    name: client?.name || '',
    phone: client?.phone || '',
    language: client?.language || salon?.textLanguage || 'en',
    service: client?.service || 'fill',
    lastVisit: client?.lastVisit || today(),
    notes: client?.notes || '',
  }));
  const [err, setErr] = useState({});
  const set = (k) => (e) => { const v = e.target.value; setF((x) => ({ ...x, [k]: k === 'phone' ? fmtPhone(v) : v })); setErr((x) => ({ ...x, [k]: null })); };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = s.nameErr;
    if (digits(f.phone) !== 10) er.phone = s.phoneErr;
    setErr(er);
    if (Object.keys(er).length) return;
    onSave({ ...f, name: f.name.trim() });
    onClose();
  };

  return (
    <Modal title={client ? s.editClient : s.addClient} onClose={onClose}>
      <form onSubmit={submit} noValidate className="stack">
        <label className="field">{s.name}
          <input className="input" autoFocus value={f.name} onChange={set('name')} aria-invalid={!!err.name} placeholder="Rachel Moore" />
          {err.name && <span className="err">{err.name}</span>}
        </label>
        <label className="field">{s.phone}
          <input className="input" type="tel" value={f.phone} onChange={set('phone')} aria-invalid={!!err.phone} placeholder="(561) 555-0142" />
          {err.phone && <span className="err">{err.phone}</span>}
        </label>
        <div className="grid-2">
          <label className="field">{s.service}
            <select className="input" value={f.service} onChange={set('service')}>{SERVICES.map((k) => <option key={k} value={k}>{s.services[k]}</option>)}</select>
          </label>
          <label className="field">{s.lastVisit}
            <input className="input" type="date" max={today()} value={f.lastVisit} onChange={set('lastVisit')} />
          </label>
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{s.textLang}</legend>
          <div className="seg block">
            <button type="button" aria-pressed={f.language === 'en'} onClick={() => setF((x) => ({ ...x, language: 'en' }))}>English</button>
            <button type="button" aria-pressed={f.language === 'vi'} onClick={() => setF((x) => ({ ...x, language: 'vi' }))}>Tiếng Việt</button>
          </div>
        </fieldset>
        <label className="field">{s.notes}
          <input className="input" value={f.notes} onChange={set('notes')} placeholder="Likes almond shape, gel" />
        </label>
        <div className="hstack" style={{ marginTop: 4 }}>
          <button type="button" className="btn btn-quiet" onClick={onClose}>{s.cancel}</button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{s.save}</button>
        </div>
      </form>
    </Modal>
  );
}
