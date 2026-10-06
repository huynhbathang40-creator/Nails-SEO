import { fmtPhone } from '../lib/calc.js';
import { useS } from './ui.jsx';

// Salon profile fields shared by Setup and Settings. `value` is the salon object; `onChange(patch)`.
export default function SalonFields({ value, onChange, errors = {}, compact = false }) {
  const s = useS();
  const set = (k, fmt) => (e) => onChange({ [k]: fmt ? fmt(e.target.value) : e.target.value });
  return (
    <div className="stack">
      <div className="grid-2">
        <label className="field">{s.salonName} <span className="hint">· {s.required}</span>
          <input className="input" value={value.name} onChange={set('name')} aria-invalid={!!errors.name} placeholder="Lux Nails & Spa" autoComplete="organization" />
          {errors.name && <span className="err">{errors.name}</span>}
        </label>
        <label className="field">{s.ownerName}
          <input className="input" value={value.owner} onChange={set('owner')} placeholder="Linda Tran" autoComplete="name" />
        </label>
      </div>
      <div className="grid-2">
        <label className="field">{s.salonPhone}
          <input className="input" type="tel" value={value.phone} onChange={set('phone', fmtPhone)} placeholder="(561) 555-0123" />
        </label>
        {!compact && (
          <label className="field">{s.city}
            <input className="input" value={value.city} onChange={set('city')} placeholder="Delray Beach, FL" />
          </label>
        )}
      </div>
      <label className="field">{s.googleLink}
        <input className="input" type="url" inputMode="url" value={value.googleReviewLink} onChange={set('googleReviewLink')} placeholder="https://g.page/r/…/review" />
        <span className="hint">{s.googleHelp}</span>
      </label>
      <label className="field">{s.bookingLink}
        <input className="input" type="url" inputMode="url" value={value.bookingLink} onChange={set('bookingLink')} placeholder="https://squareup.com/appointments/book/…" />
        <span className="hint">{s.bookingHelp}</span>
      </label>
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{s.defaultLang}</legend>
        <div className="seg block" style={{ maxWidth: 420 }}>
          <button type="button" aria-pressed={value.textLanguage === 'en'} onClick={() => onChange({ textLanguage: 'en' })}>English</button>
          <button type="button" aria-pressed={value.textLanguage === 'vi'} onClick={() => onChange({ textLanguage: 'vi' })}>Tiếng Việt</button>
        </div>
      </fieldset>
    </div>
  );
}
