import { useMemo, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Check, Edit, Plus, Search, Send, Trash, Upload } from '../components/Icons.jsx';
import { digits, fmtPhone } from '../lib/calc.js';
import { firstName, weeksSince } from '../lib/messages.js';
import { clientStatus, today, useStore } from '../lib/store.jsx';
import { ClientForm, initials, Modal, SendSheet, useS } from './ui.jsx';

const FILTERS = ['all', 'review', 'winback', 'waiting'];
const STATUS_TAG = { review: 'amber', winback: 'pink', waiting: 'grey', ok: 'green' };

// --- CSV import -----------------------------------------------------------

function splitLine(line) {
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
    else if ((ch === ',' || ch === '\t' || ch === ';') && !q) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function parseDate(v) {
  if (!v) return null;
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) {
    const y = m[3].length === 2 ? '20' + m[3] : m[3];
    return `${y}-${m[1].padStart(2, '0')}-${m[2].padStart(2, '0')}`;
  }
  const d = new Date(v);
  return isNaN(d) ? null : d.toISOString().slice(0, 10);
}

function parseService(v = '') {
  const s = v.toLowerCase();
  if (/fill|refill|acrylic|dip|gel/.test(s)) return 'fill';
  if (/pedi|chân|foot/.test(s)) return 'pedicure';
  if (/mani|tay/.test(s)) return 'manicure';
  return v ? 'other' : 'fill';
}

export function parseClients(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { rows: [], skipped: 0 };
  let cols = { name: 0, phone: 1, lastVisit: 2, service: 3, language: 4 };
  const head = splitLine(lines[0]).map((h) => h.toLowerCase());
  const hasHeader = head.some((h) => /name|tên/.test(h)) && head.some((h) => /phone|mobile|điện thoại|sđt/.test(h));
  if (hasHeader) {
    const find = (re) => head.findIndex((h) => re.test(h));
    cols = { name: find(/name|tên/), phone: find(/phone|mobile|điện thoại|sđt/), lastVisit: find(/last|visit|date|ngày/), service: find(/service|dịch vụ/), language: find(/lang|ngôn ngữ/) };
    lines.shift();
  }
  let skipped = 0;
  const rows = [];
  for (const line of lines) {
    const c = splitLine(line);
    const name = c[cols.name] || '';
    const phone = c[cols.phone] || '';
    if (!name || digits(phone.replace(/^\+?1(?=\d{10}$)/, '')) < 10) { skipped++; continue; }
    const lang = (c[cols.language] || '').toLowerCase();
    rows.push({
      name,
      phone: fmtPhone(phone),
      lastVisit: (cols.lastVisit >= 0 && parseDate(c[cols.lastVisit])) || today(),
      service: cols.service >= 0 ? parseService(c[cols.service]) : 'fill',
      ...(lang ? { language: /vi|viet/.test(lang) ? 'vi' : 'en' } : {}),
    });
  }
  return { rows, skipped };
}

function ImportModal({ onClose, onImport }) {
  const s = useS();
  const [text, setText] = useState('');
  const parsed = useMemo(() => parseClients(text), [text]);
  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(setText);
  };
  return (
    <Modal title={s.importTitle} sub={s.importSub} onClose={onClose} width={600}>
      <textarea className="input" rows={7} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Rachel Moore, (561) 555-0142, 2026-08-20, Fill\nHạnh Nguyễn, 5615550193, 7/30/2026, Pedicure'} style={{ fontFamily: 'ui-monospace, monospace', fontSize: 14 }} />
      <label className="btn btn-quiet" style={{ alignSelf: 'flex-start' }}>
        <Upload />{s.importFile}
        <input type="file" accept=".csv,.txt,text/csv" onChange={onFile} className="sr-only" />
      </label>
      {text && (
        <div className="stack" style={{ gap: 4 }}>
          <div style={{ fontWeight: 600, color: 'var(--green)' }}>{s.importPreview(parsed.rows.length)}</div>
          {parsed.skipped > 0 && <div className="small" style={{ color: '#92400E' }}>{s.importSkip(parsed.skipped)}</div>}
          <div className="small muted">{parsed.rows.slice(0, 3).map((r) => `${r.name} · ${r.phone} · ${r.lastVisit}`).join('  |  ')}</div>
        </div>
      )}
      <div className="hstack">
        <button type="button" className="btn btn-quiet" onClick={onClose}>{s.cancel}</button>
        <button type="button" className="btn btn-primary" style={{ flex: 1 }} disabled={!parsed.rows.length} onClick={() => { onImport(parsed.rows); onClose(); }}>{s.importBtn(parsed.rows.length)}</button>
      </div>
    </Modal>
  );
}

// --- Page -------------------------------------------------------------------

export default function Clients() {
  const s = useS();
  const { toast } = useOutletContext();
  const store = useStore();
  const { salon, clients } = store;
  const [params, setParams] = useSearchParams();
  const filter = FILTERS.includes(params.get('filter')) ? params.get('filter') : 'all';
  const [q, setQ] = useState('');
  const [modal, setModal] = useState(null);

  const withStatus = useMemo(() => clients.map((c) => ({ ...c, status: clientStatus(c, salon) })), [clients, salon]);
  const counts = useMemo(() => FILTERS.reduce((acc, f) => ({ ...acc, [f]: f === 'all' ? withStatus.length : withStatus.filter((c) => c.status === f).length }), {}), [withStatus]);
  const shown = withStatus.filter((c) => {
    if (filter !== 'all' && c.status !== filter) return false;
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return c.name.toLowerCase().includes(needle) || c.phone.replace(/\D/g, '').includes(needle.replace(/\D/g, '') || '§');
  });

  const visit = (c) => {
    const won = c.winbackSentAt && c.winbackSentAt >= c.lastVisit;
    store.recordVisit(c.id);
    toast(won ? s.wonToast(firstName(c.name)) : s.visitToast);
  };

  return (
    <>
      <div className="app-top">
        <div>
          <h1>{s.clientsTitle}</h1>
          <p>{s.clientsSub}</p>
        </div>
        <div className="hstack">
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setModal({ type: 'import' })}><Upload size={16} />{s.import}</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'add' })}><Plus size={16} />{s.addClient}</button>
        </div>
      </div>

      <section className="panel">
        <div className="stack" style={{ marginBottom: 8 }}>
          <label style={{ position: 'relative', display: 'block' }}>
            <span className="sr-only">{s.search}</span>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}><Search /></span>
            <input className="input input-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder={s.search} style={{ paddingLeft: 44 }} />
          </label>
          <div className="chips" role="group" aria-label="Filter">
            {FILTERS.map((f) => (
              <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => setParams(f === 'all' ? {} : { filter: f })}>
                {s.filters[f]} <span style={{ opacity: 0.7 }}>{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="empty">
            <p style={{ margin: '0 0 14px' }}>{clients.length ? s.noMatch : s.noClients}</p>
            {!clients.length && (
              <div className="hstack" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'add' })}><Plus size={16} />{s.addClient}</button>
                <button type="button" className="btn btn-quiet btn-sm" onClick={() => setModal({ type: 'import' })}><Upload size={16} />{s.import}</button>
              </div>
            )}
          </div>
        ) : (
          shown.map((c) => (
            <div key={c.id} className="row" style={{ flexWrap: 'wrap' }}>
              <span className="avatar">{initials(c.name)}</span>
              <div className="grow" style={{ minWidth: 160 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                  <strong className="truncate">{c.name}</strong>
                  <span className={`tag ${STATUS_TAG[c.status]}`}>{s.status[c.status]}</span>
                </div>
                <div className="muted small">
                  <a href={`tel:${c.phone.replace(/\D/g, '')}`} style={{ color: 'inherit' }}>{c.phone}</a> · {s.services[c.service]} · {s.lastVisit}: {s.weeksAgo(weeksSince(c.lastVisit))} · {c.language === 'vi' ? 'VI' : 'EN'}
                  {c.notes ? ` · ${c.notes}` : ''}
                </div>
              </div>
              <div className="hstack" style={{ gap: 6 }}>
                <button type="button" className={`btn btn-xs ${c.status === 'review' ? 'btn-primary' : 'btn-quiet'}`} onClick={() => setModal({ type: 'send', client: c, kind: 'review' })}><Send size={14} />{s.ask}</button>
                <button type="button" className={`btn btn-xs ${c.status === 'winback' ? 'btn-primary' : 'btn-quiet'}`} onClick={() => setModal({ type: 'send', client: c, kind: 'winback' })}><Send size={14} />{s.winback}</button>
                <button type="button" className="btn btn-quiet btn-xs" onClick={() => visit(c)} disabled={c.lastVisit === today()} title={s.cameIn}><Check size={14} />{s.cameIn}</button>
                <button type="button" className="btn btn-quiet btn-xs" onClick={() => setModal({ type: 'edit', client: c })} aria-label={`${s.edit} ${c.name}`}><Edit size={14} /></button>
                <button type="button" className="btn btn-danger btn-xs" onClick={() => window.confirm(s.deleteConfirm(c.name)) && store.removeClient(c.id)} aria-label={`${s.delete} ${c.name}`}><Trash size={14} /></button>
              </div>
            </div>
          ))
        )}
      </section>

      {modal?.type === 'add' && <ClientForm onClose={() => setModal(null)} onSave={store.addClient} />}
      {modal?.type === 'edit' && <ClientForm client={modal.client} onClose={() => setModal(null)} onSave={(patch) => store.updateClient(modal.client.id, patch)} />}
      {modal?.type === 'import' && <ImportModal onClose={() => setModal(null)} onImport={store.importClients} />}
      {modal?.type === 'send' && <SendSheet client={modal.client} kind={modal.kind} toast={toast} onClose={() => setModal(null)} />}
    </>
  );
}
