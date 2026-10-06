import { useState } from 'react';
import { buildMessage } from '../lib/messages.js';
import { useStore } from '../lib/store.jsx';
import { useS } from './ui.jsx';

const VARS = ['{first}', '{salon}', '{owner}', '{link}', '{weeks}', '{service}'];

function TemplateEditor({ kind, title }) {
  const s = useS();
  const { salon, templates, setTemplate } = useStore();
  const [lang, setLang] = useState('en');
  const sample = {
    name: lang === 'vi' ? 'Hạnh Nguyễn' : 'Rachel Moore',
    language: lang,
    service: 'fill',
    lastVisit: new Date(Date.now() - 3 * 7 * 864e5).toISOString().slice(0, 10),
  };
  const preview = buildMessage(kind, sample, salon, templates);

  return (
    <section className="panel stack">
      <div className="panel-head" style={{ marginBottom: 0 }}>
        <h2>{title}</h2>
        <div className="seg" role="group" aria-label="Language">
          <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
          <button type="button" aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>Tiếng Việt</button>
        </div>
      </div>
      <textarea className="input" lang={lang} rows={4} value={templates[kind][lang]} onChange={(e) => setTemplate(kind, lang, e.target.value)} aria-label={`${title} (${lang})`} />
      <div className="small muted">
        {s.vars}{' '}
        {VARS.filter((v) => kind === 'winback' || !['{weeks}', '{service}'].includes(v)).map((v) => (
          <code key={v} style={{ background: 'var(--lilac)', color: 'var(--plum)', borderRadius: 8, padding: '1px 6px', marginRight: 6 }}>{v}</code>
        ))}
      </div>
      <div>
        <div className="eyebrow" style={{ marginBottom: 6 }}>{s.preview}</div>
        <div className="msg-preview" lang={lang}>{preview}</div>
        <div className="muted small" style={{ marginTop: 6 }}>{preview.length} characters{preview.length > 160 ? ` · ${Math.ceil(preview.length / 153)} SMS` : ''}</div>
      </div>
    </section>
  );
}

export default function Templates() {
  const s = useS();
  const { resetTemplates } = useStore();
  return (
    <>
      <div className="app-top">
        <div>
          <h1>{s.templatesTitle}</h1>
          <p>{s.templatesSub}</p>
        </div>
        <button type="button" className="btn btn-quiet btn-sm" onClick={() => window.confirm(s.resetConfirm) && resetTemplates()}>{s.reset}</button>
      </div>
      <TemplateEditor kind="review" title={s.tplReview} />
      <TemplateEditor kind="winback" title={s.tplWinback} />
    </>
  );
}
