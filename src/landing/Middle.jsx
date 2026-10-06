import { useState } from 'react';
import { Check, Star, Stars } from '../components/Icons.jsx';
import { calculateWinBack, digits, fmtPhone } from '../lib/calc.js';
import { submitForm } from '../lib/forms.js';
import { DASH_LANGS, TESTIMONIALS, TIMELINE, WINBACK } from './data.js';
import { useTween } from './hooks.js';

const Placeholder = () => <span className="tag amber" style={{ fontSize: 10, letterSpacing: '0.05em', padding: '2px 8px' }}>PLACEHOLDER</span>;

function Feature({ kicker, title, body, stat, flip, art, artBg }) {
  return (
    <div className={`feature-row${flip ? ' flip' : ''}`}>
      <div className="feature-copy">
        <span className="feature-kicker">{kicker}</span>
        <h3>{title}</h3>
        <p className="lp-p">{body}</p>
        <div className="feature-stat">{stat}</div>
      </div>
      <div className="feature-art" style={{ background: artBg }}>{art}</div>
    </div>
  );
}

function WinBackPreview() {
  const [lang, setLang] = useState('en');
  const w = WINBACK[lang];
  return (
    <div className="phone-card" style={{ width: 'min(320px,100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Text preview</span>
        <div className="seg tinted" role="group" aria-label="Text language">
          <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')} style={{ fontSize: 12 }}>English</button>
          <button type="button" aria-pressed={lang === 'vi'} onClick={() => setLang('vi')} style={{ fontSize: 12 }}>Tiếng Việt</button>
        </div>
      </div>
      <div lang={lang} className="bubble" style={{ fontSize: 14, lineHeight: 1.55, padding: '12px 14px' }}>{w.msg} <span style={{ color: '#2563EB', textDecoration: 'underline' }}>book.glowback.co/lux</span></div>
      <div lang={lang} className="bubble me" style={{ fontSize: 14, lineHeight: 1.55, padding: '12px 14px' }}>{w.reply}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--green)', fontWeight: 600 }}><Check size={14} />{w.booked}</div>
    </div>
  );
}

export function Features() {
  return (
    <section aria-label="Features" style={{ padding: '0 clamp(20px,4vw,40px) clamp(80px,10vw,120px)' }}>
      <div className="lp-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(64px,8vw,100px)' }}>
        <Feature
          kicker="01 · Reviews"
          title="Automatic Review Requests"
          body="Every client gets a friendly text after their appointment with a one-tap link to your Google page. No more asking at the counter and hoping they remember. Reviews come in while you're working on the next client."
          stat={<><strong style={{ fontSize: 20 }}>[X]</strong> Reviews in the first week <Placeholder /></>}
          artBg="linear-gradient(150deg,#F6F3F8,#FDEBEF)"
          art={
            <>
              <div className="phone-card" style={{ width: 'min(250px,56%)', padding: '16px 14px', gap: 8 }}>
                <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>Lux Nails &amp; Spa · Text</div>
                <div className="bubble">Hi Rachel! Thank you for coming in today. Loved your nails? A quick Google review helps us a lot:</div>
                <div className="bubble" style={{ color: '#2563EB', textDecoration: 'underline' }}>g.page/luxnails/review</div>
              </div>
              <div className="phone-card" style={{ width: 'min(230px,50%)', marginLeft: -28, marginTop: 90, borderRadius: 24, padding: 18, boxShadow: '0 16px 36px rgba(91,42,134,0.2)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}>Google · Rate your visit</div>
                <Stars size={24} gap={4} />
                <div style={{ fontSize: 13, lineHeight: 1.45, color: '#343B4F' }}>"Linda is an artist. Best nails in Delray, hands down."</div>
                <div style={{ alignSelf: 'flex-end', padding: '6px 16px', borderRadius: 999, background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 600 }}>Post</div>
              </div>
            </>
          }
        />
        <Feature
          flip
          kicker="02 · Regulars"
          title="Smart Win-Back Texts"
          body="GlowBack notices when a regular hasn't been back in her usual time, 3 weeks for a fill or 6 weeks for a pedicure, and sends a warm, personal text with a link to book. Clients like Mrs. Johnson come back. You never have to make an awkward call."
          stat={<><strong style={{ fontSize: 20 }}>[X]</strong> clients won back per month <Placeholder /></>}
          artBg="linear-gradient(150deg,#FFF4E8,#F6F3F8)"
          art={<WinBackPreview />}
        />
        <Feature
          kicker="03 · Language"
          title="English & Vietnamese, Built In"
          body="Set up and manage GlowBack in the language you're most comfortable with. Choose which language your texts go out in. Support is available in both English and Vietnamese."
          stat="2 languages, 1 simple dashboard"
          artBg="linear-gradient(150deg,#F6F3F8,#EFE7F6)"
          art={
            <div style={{ display: 'flex', gap: 14, width: '100%', justifyContent: 'center' }}>
              {DASH_LANGS.map((d) => (
                <div key={d.code} lang={d.lang} className="phone-card" style={{ flex: 1, maxWidth: 220, borderRadius: 24, padding: 18, gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: 'var(--muted)' }}><span>{d.head}</span><span className="tag" style={{ padding: '1px 8px' }}>{d.code}</span></div>
                  {d.rows.map(([k, v]) => (
                    <div key={k}><div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{k}</div><div style={{ fontSize: 22, fontWeight: 700 }}>{v}</div></div>
                  ))}
                </div>
              ))}
            </div>
          }
        />
        <Feature
          flip
          kicker="04 · Results"
          title="Your Results on One Simple Screen"
          body="No confusing charts. Open the app and see three numbers: how many new reviews you got, how many clients came back, and how much money that brought in. You'll always know your $49 is working."
          stat="3 numbers. That's it."
          artBg="linear-gradient(150deg,#FDEBEF,#FFF4E8)"
          art={
            <div className="phone-card" style={{ width: 'min(280px,100%)', padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>This month</div>
              {[['New reviews', '116'], ['Clients returned', '31'], ['Estimated revenue recovered', '$1,705']].map(([k, v]) => (
                <div key={k} style={{ padding: '12px 16px', borderRadius: 18, background: 'var(--surface)' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{k}</div>
                  <div className="serif" style={{ fontSize: 36, lineHeight: 1.1, color: 'var(--plum)' }}>{v}</div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: '#92400E', textAlign: 'center' }}>Example numbers</div>
            </div>
          }
        />
        <Feature
          kicker="05 · Replies"
          title="Review Alerts & Easy Replies"
          body="Get an alert every time someone reviews you. GlowBack writes a polite thank-you reply for you to approve with one tap. Replying to reviews shows new clients you care and helps you stand out on Google."
          stat="Reply to every review in 5 seconds"
          artBg="linear-gradient(150deg,#F6F3F8,#FFF8E6)"
          art={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
              <div style={{ width: 'min(340px,100%)', display: 'flex', gap: 10, padding: 14, borderRadius: 20, background: '#fff', boxShadow: '0 8px 22px rgba(91,42,134,0.12)' }}>
                <div style={{ flex: 'none', width: 36, height: 36, borderRadius: 10, background: '#FFF6DC', display: 'grid', placeItems: 'center' }}><Star size={18} /></div>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>New 5-star review from Tina P.</div><div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.45 }}>"So relaxing, and my dip lasted three weeks."</div></div>
              </div>
              <div className="phone-card" style={{ width: 'min(340px,100%)', borderRadius: 20, boxShadow: '0 12px 30px rgba(91,42,134,0.16)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--magenta)' }}>Suggested reply</div>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>Thank you so much, Tina! We're so happy your dip lasted. See you at your next visit!</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ padding: '8px 18px', borderRadius: 999, background: 'var(--plum)', color: '#fff', fontSize: 13, fontWeight: 600 }}>Approve</span>
                  <span style={{ padding: '8px 18px', borderRadius: 999, border: '1px solid var(--line)', fontSize: 13, fontWeight: 600 }}>Edit</span>
                </div>
              </div>
            </div>
          }
        />
      </div>
    </section>
  );
}

function Slider({ label, value, display, min, max, step, onChange }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontWeight: 500 }}><span>{label}</span><strong style={{ color: 'var(--plum)' }}>{display ?? value}</strong></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </label>
  );
}

export function Calculator({ isMobile, onTrial }) {
  const [calc, setCalc] = useState({ clients: 800, spend: 55, lapsed: 30, visits: 12 });
  const [spendInput, setSpendInput] = useState('55');
  const [lead, setLead] = useState({ open: false, name: '', phone: '', status: 'idle', err: '' });
  const set = (k) => (v) => setCalc((c) => ({ ...c, [k]: v }));
  const res = calculateWinBack(calc.clients, calc.spend, calc.lapsed, calc.visits);
  const shown = useTween(res.monthlyRevenue, 300);
  const costPct = Math.max(3, Math.min(100, (49 / Math.max(res.monthlyRevenue, 49)) * 100));
  const ctaH = isMobile ? 56 : 52;

  const sendLead = async (e) => {
    e.preventDefault();
    if (digits(lead.phone) !== 10) return setLead((l) => ({ ...l, err: 'Please check the phone number—it should have 10 digits.' }));
    setLead((l) => ({ ...l, status: 'loading', err: '' }));
    try {
      await submitForm('results', { name: lead.name, phone: lead.phone, monthly: res.monthlyRevenue, ...calc });
      setLead((l) => ({ ...l, status: 'sent' }));
    } catch {
      setLead((l) => ({ ...l, status: 'idle', err: 'Something went wrong. Please try again or call (561) 555-0123.' }));
    }
  };

  return (
    <section id="results" aria-labelledby="calc-h" className="lp-section" style={{ scrollMarginTop: 72, background: 'var(--surface)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 id="calc-h" className="lp-h2" style={{ marginBottom: 12 }}>How Much Money Is Walking Out Your Door?</h2>
        <p className="lp-p" style={{ marginBottom: 32 }}>Move the sliders to match your salon.</p>
        <div style={{ position: 'relative', background: '#fff', borderRadius: 28, boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
          <div className="rainbow-bar" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px,4vw,48px)', padding: 'clamp(24px,4vw,40px)' }}>
            <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Slider label="Clients in your phone or booking list" value={calc.clients} display={calc.clients.toLocaleString('en-US')} min={100} max={3000} step={50} onChange={set('clients')} />
              <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontWeight: 500 }}>Average spend per visit</span>
                <span style={{ position: 'relative', display: 'block' }}>
                  <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>$</span>
                  <input
                    className="input" type="number" inputMode="numeric" min={10} max={500} value={spendInput} style={{ paddingLeft: 32 }}
                    onChange={(e) => { setSpendInput(e.target.value); const n = parseFloat(e.target.value); if (n >= 10 && n <= 500) set('spend')(n); }}
                    onBlur={() => { const n = Math.min(500, Math.max(10, parseFloat(spendInput) || 55)); setSpendInput(String(n)); set('spend')(n); }}
                  />
                </span>
              </label>
              <Slider label="Clients who haven't come back in 2+ months" value={calc.lapsed} display={`${calc.lapsed}%`} min={10} max={60} step={1} onChange={set('lapsed')} />
              <Slider label="Visits per year for a regular" value={calc.visits} min={4} max={26} step={1} onChange={set('visits')} />
            </div>
            <div aria-live="polite" style={{ flex: '1 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16, padding: 'clamp(20px,3vw,28px)', borderRadius: 24, background: '#FBF9FC' }}>
              <div>
                <div className="serif" style={{ fontSize: 'clamp(48px,6vw,60px)', lineHeight: 1.05, color: 'var(--plum)', fontVariantNumeric: 'tabular-nums' }}>≈ ${shown.toLocaleString('en-US')}</div>
                <div style={{ fontSize: 18, fontWeight: 500 }}>per month you could win back</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8 }}>
                {[[res.clientsWonBack, 'clients won back'], [res.visitsMonthly, 'visits recovered / mo'], ['$49', 'GlowBack / mo']].map(([v, l]) => (
                  <div key={l}><div style={{ fontSize: 22, fontWeight: 700 }}>{v}</div><div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.35 }}>{l}</div></div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                {[['GlowBack', costPct + '%', '#9CA3AF'], ['Won back', '100%', 'linear-gradient(90deg,#5B2A86,#D63A7E,#FF8A5B)']].map(([l, w, bg]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 84, flex: 'none', color: 'var(--text-2)' }}>{l}</span>
                    <div style={{ flex: 1, height: 14, borderRadius: 999, background: '#EEE9F2' }}><div style={{ height: '100%', width: w, borderRadius: 999, background: bg, transition: 'width 300ms' }} /></div>
                  </div>
                ))}
              </div>
              <div style={{ fontWeight: 600, color: 'var(--green)' }}>≈ {res.returnMultiple}× what GlowBack costs</div>
            </div>
          </div>
          <div style={{ padding: '0 clamp(24px,4vw,40px) clamp(24px,4vw,40px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p className="eyebrow" style={{ margin: 0, fontSize: 12, lineHeight: 1.5 }}>Estimate only, based on the assumptions above. Your results depend on your salon and clients. Assumes 8% of lapsed clients return for about half a year.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <button type="button" className="btn btn-primary" onClick={onTrial} style={{ height: ctaH }}>Start My Free Trial</button>
              <button type="button" className="btn btn-outline" onClick={() => setLead((l) => ({ ...l, open: !l.open }))} aria-expanded={lead.open} style={{ height: ctaH, padding: '0 24px' }}>Text Me My Results</button>
            </div>
            {lead.open && lead.status !== 'sent' && (
              <form onSubmit={sendLead} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
                <input className="input" aria-label="Your name" placeholder="Your name" autoComplete="name" value={lead.name} onChange={(e) => setLead((l) => ({ ...l, name: e.target.value }))} style={{ flex: '1 1 180px', width: 'auto' }} />
                <input className="input" aria-label="Mobile number" type="tel" autoComplete="tel" placeholder="(561) 555-0123" value={lead.phone} aria-invalid={!!lead.err} onChange={(e) => setLead((l) => ({ ...l, phone: fmtPhone(e.target.value), err: '' }))} style={{ flex: '1 1 180px', width: 'auto' }} />
                <button type="submit" className="btn btn-primary" disabled={lead.status === 'loading'} style={{ padding: '0 24px' }}>{lead.status === 'loading' ? 'Sending…' : 'Send'}</button>
                {lead.err && <p className="err" style={{ flexBasis: '100%' }}>{lead.err}</p>}
              </form>
            )}
            {lead.status === 'sent' && <p className="ok-msg">Sent! We'll text your results to {lead.phone}.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SocialProof() {
  const big = (v, l) => (
    <div key={l}><div className="serif" style={{ fontSize: 'clamp(30px,3.5vw,40px)', lineHeight: 1.1, color: 'var(--plum)' }}>{v}</div><div style={{ fontSize: 14, color: 'var(--text-2)' }}>{l}</div></div>
  );
  return (
    <section aria-labelledby="proof-h" className="lp-section">
      <div className="lp-wrap">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 'clamp(32px,4vw,48px)' }}>
          <h2 id="proof-h" className="lp-h2" style={{ maxWidth: 760 }}>Salon Owners Like You Are Filling Their Chairs Again</h2>
          <span className="tag amber" style={{ fontSize: 11, letterSpacing: '0.05em' }}>PLACEHOLDER · replace with real beta results</span>
        </div>
        <article style={{ display: 'flex', flexWrap: 'wrap', borderRadius: 32, overflow: 'hidden', background: 'var(--surface)' }}>
          <div style={{ flex: '1 1 380px', minHeight: 320, position: 'relative', background: 'linear-gradient(160deg,#E7DDF0,#F8DCE3 60%,#FCE9D6)' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--plum)', fontSize: 14, fontWeight: 500, textAlign: 'center', padding: 24 }}>Salon photo</div>
            <div style={{ position: 'absolute', left: 24, bottom: 24, width: 88, height: 88, borderRadius: '50%', background: '#D8CBE4', border: '4px solid #fff', display: 'grid', placeItems: 'center', fontSize: 12, color: 'var(--plum)', textAlign: 'center' }}>Owner photo</div>
          </div>
          <div style={{ flex: '1.3 1 420px', minWidth: 0, padding: 'clamp(24px,4vw,48px)', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="eyebrow">Lux Nails &amp; Spa · 8-station salon, Delray Beach, FL</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}>
              {big('+116', 'Google reviews')}{big('31', 'regulars back')}{big('#1', 'on Google Maps')}
            </div>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
              {TIMELINE.map((s) => (
                <li key={s.w} style={{ background: '#fff', borderRadius: 20, padding: 16 }}>
                  <div className="feature-kicker" style={{ fontWeight: 600 }}>{s.w}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.45, marginTop: 4 }}>{s.t}</div>
                </li>
              ))}
            </ol>
            <blockquote className="serif" style={{ margin: 0, fontSize: 'clamp(20px,2vw,24px)', lineHeight: 1.4 }}>"I paid $3,600 for charts and nothing. This I understand. Last week I searched on my phone and saw my own salon at the top of the map."</blockquote>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Linda T., Owner</span>
            </div>
          </div>
        </article>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 20, marginTop: 24 }}>
          {TESTIMONIALS.map((q) => (
            <figure key={q.quote} style={{ margin: 0, background: '#fff', border: '1px solid var(--line)', borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
              <Stars size={16} />
              <blockquote style={{ margin: 0, fontSize: 17, lineHeight: 1.55, flex: 1 }}>"{q.quote}"</blockquote>
              <figcaption style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 0, fontSize: 14, color: 'var(--text-2)' }}>
                <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#EFE7F6', flex: 'none' }} />
                <span><strong style={{ color: 'var(--ink)', display: 'block' }}>{q.name}</strong>{q.salon}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
