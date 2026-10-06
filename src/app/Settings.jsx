import { useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Upload } from '../components/Icons.jsx';
import { useStore } from '../lib/store.jsx';
import SalonFields from './SalonFields.jsx';
import { useS } from './ui.jsx';

export default function Settings() {
  const s = useS();
  const { toast } = useOutletContext();
  const store = useStore();
  const navigate = useNavigate();
  const [draft, setDraft] = useState(store.salon);
  const [err, setErr] = useState({});
  const fileRef = useRef(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(store.salon);

  useEffect(() => { setDraft(store.salon); }, [store.salon]);

  const patch = (p) => { setDraft((d) => ({ ...d, ...p })); setErr({}); };
  const num = (k, min, max) => (e) => patch({ [k]: Math.max(min, Math.min(max, Number(e.target.value) || min)) });

  const save = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) return setErr({ name: s.nameErr });
    store.updateSalon({ ...draft, name: draft.name.trim() });
    toast(s.saved);
  };

  const exportData = () => {
    const blob = new Blob([localStorage.getItem(store.storageKey) || '{}'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `glowback-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const restore = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.salon || !Array.isArray(data.clients)) throw new Error('bad');
      localStorage.setItem(store.storageKey, JSON.stringify(data));
      window.location.reload();
    } catch {
      window.alert(s.restoreErr);
    }
  };

  return (
    <>
      <div className="app-top">
        <div><h1>{s.settingsTitle}</h1></div>
      </div>

      <form className="panel stack" onSubmit={save} noValidate>
        <SalonFields value={draft} onChange={patch} errors={err} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{s.timing}</div>
          <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
            <label className="field"><span className="hint">{s.weeksAfter(s.services.fill.toLowerCase())}</span>
              <input className="input" type="number" min={1} max={26} value={draft.fillWeeks} onChange={num('fillWeeks', 1, 26)} />
            </label>
            <label className="field"><span className="hint">{s.weeksAfter(s.services.pedicure.toLowerCase())}</span>
              <input className="input" type="number" min={1} max={26} value={draft.pediWeeks} onChange={num('pediWeeks', 1, 26)} />
            </label>
            <label className="field"><span className="hint">{s.weeksAfter(s.services.other.toLowerCase())}</span>
              <input className="input" type="number" min={1} max={52} value={draft.otherWeeks} onChange={num('otherWeeks', 1, 52)} />
            </label>
            <label className="field"><span className="hint">{s.avgTicket}</span>
              <input className="input" type="number" min={5} max={1000} value={draft.avgTicket} onChange={num('avgTicket', 5, 1000)} />
            </label>
          </div>
        </div>
        <div className="hstack">
          <button type="submit" className="btn btn-primary" disabled={!dirty}>{s.save}</button>
          {dirty && <button type="button" className="btn btn-quiet" onClick={() => setDraft(store.salon)}>{s.cancel}</button>}
        </div>
      </form>

      <section className="panel stack">
        <div>
          <h2>{s.data}</h2>
          <p className="muted" style={{ margin: '4px 0 0' }}>{s.dataSub}</p>
        </div>
        <div className="hstack">
          <button type="button" className="btn btn-quiet btn-sm" onClick={exportData}>{s.exportData}</button>
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => fileRef.current?.click()}><Upload size={16} />{s.importData}</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={restore} />
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => { store.loadSample(); navigate('/app'); }}>{s.loadSample}</button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => { if (window.confirm(s.eraseConfirm)) { store.resetAll(); navigate('/app/setup'); } }}>{s.eraseAll}</button>
        </div>
      </section>
    </>
  );
}
