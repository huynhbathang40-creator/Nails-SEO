import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Play, Shield } from '../components/Icons.jsx';
import { submitForm } from '../lib/forms.js';
import { useLang } from '../lib/i18n.jsx';
import { CHAPTERS, COMPARE, COPY, FAQS, FOOTER_COLS, INTEGRATIONS, PLANS, PRICING_TRUST, TRUST } from './data.js';

export function Pricing({ isMobile, onTrial, onDemo }) {
  const [annual, setAnnual] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);
  const ctaH = isMobile ? 56 : 52;

  return (
    <section id="pricing" aria-labelledby="pricing-h" className="lp-section" style={{ scrollMarginTop: 72, background: '#fff' }}>
      <div className="lp-wrap">
        <h2 id="pricing-h" className="lp-h2" style={{ marginBottom: 24 }}>Simple Pricing. No Contract. Cancel Anytime.</h2>
        <div className="seg lg" role="group" aria-label="Billing period" style={{ padding: 4, marginBottom: 'clamp(40px,5vw,56px)' }}>
          <button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</button>
          <button type="button" aria-pressed={annual} onClick={() => setAnnual(true)}>Annual <span style={{ fontSize: 12, opacity: 0.85 }}>· 2 months free</span></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 24, alignItems: 'stretch' }}>
          {PLANS.map((p) => {
            const custom = p.m === 'Custom';
            return (
              <div
                key={p.key}
                className="plan"
                style={{
                  order: isMobile && p.popular ? -1 : 0,
                  background: p.popular ? 'linear-gradient(135deg,#5B2A86,#D63A7E,#FF8A5B,#FFD166)' : 'var(--line)',
                  '--lift': p.popular && !isMobile ? 'translateY(-8px)' : 'none',
                }}
              >
                <div style={{ height: '100%', minHeight: 500, background: '#fff', borderRadius: 28, padding: 32, display: 'flex', flexDirection: 'column', gap: 20, position: 'relative', boxShadow: p.popular ? '0 20px 50px rgba(91,42,134,0.18)' : 'var(--shadow-sm)' }}>
                  {p.popular && <span style={{ position: 'absolute', top: -14, left: 32, padding: '5px 14px', borderRadius: 999, background: 'var(--gold)', color: 'var(--ink)', fontSize: 12, fontWeight: 700, letterSpacing: '0.03em' }}>MOST POPULAR</span>}
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 600, fontSize: 24 }}>{p.name}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 15, color: 'var(--muted)' }}>{p.for}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minHeight: 64 }}>
                    <span className="serif" style={{ fontSize: 52, lineHeight: 1 }}>{annual ? p.y : p.m}</span>
                    <span style={{ fontSize: 16, color: 'var(--muted)' }}>{custom ? '' : annual ? '/year' : '/month'}</span>
                  </div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    {p.features.map((f) => (
                      <li key={f} style={{ display: 'flex', gap: 10, fontSize: 15, lineHeight: 1.45 }}><Check size={18} style={{ flex: 'none', marginTop: 2 }} /><span>{f}</span></li>
                    ))}
                  </ul>
                  <button type="button" className={`btn btn-block ${p.popular ? 'btn-primary' : 'btn-outline'}`} onClick={p.key === 'multi' ? onDemo : onTrial} style={{ height: ctaH }}>{p.cta}</button>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ margin: '32px auto 0', display: 'flex', flexWrap: 'wrap', gap: '8px 24px', justifyContent: 'center', fontSize: 15, fontWeight: 500 }}>
          {PRICING_TRUST.map((c) => <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Check />{c}</span>)}
        </div>
        <div style={{ marginTop: 40 }}>
          <button type="button" className="btn btn-quiet" onClick={() => setCompareOpen((o) => !o)} aria-expanded={compareOpen} style={{ display: 'flex', margin: '0 auto', height: 48, padding: '0 22px', fontSize: 15, color: 'var(--plum)' }}>
            {compareOpen ? 'Hide full comparison' : 'Compare all features'}
          </button>
          {compareOpen && (
            <div style={{ marginTop: 24, overflowX: 'auto', background: '#fff', borderRadius: 24, border: '1px solid var(--line)' }}>
              <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: 15 }}>
                <thead>
                  <tr>
                    {['Feature', 'Essentials', 'Growth', 'Multi-Location'].map((h, i) => (
                      <th key={h} style={{ padding: i ? '16px 12px' : '16px 20px', textAlign: i ? 'center' : 'left', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--line)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((r) => {
                    const head = r.length === 1;
                    const bg = head ? 'var(--surface)' : '#fff';
                    return (
                      <tr key={r[0]}>
                        <td style={{ padding: '12px 20px', fontWeight: head ? 700 : 400, background: bg, color: head ? 'var(--plum)' : 'var(--ink)', borderBottom: '1px solid #F0ECF3' }}>{r[0]}</td>
                        {[1, 2, 3].map((i) => <td key={i} style={{ padding: 12, textAlign: 'center', background: bg, borderBottom: '1px solid #F0ECF3' }}>{r[i] || ''}</td>)}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div id="faq" style={{ scrollMarginTop: 88, maxWidth: 800, margin: 'clamp(64px,8vw,96px) auto 0' }}>
          <h3 className="serif" style={{ margin: '0 0 20px', fontSize: 'clamp(26px,2.6vw,32px)' }}>Questions owners ask us</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQS.map(([q, a], i) => {
              const open = faqOpen === i;
              return (
                <div key={q} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 24 }}>
                  <button type="button" className="faq-q" onClick={() => setFaqOpen(open ? -1 : i)} aria-expanded={open}>
                    <span>{q}</span>
                    <span aria-hidden="true" style={{ flex: 'none', width: 28, height: 28, borderRadius: '50%', background: 'var(--lilac)', color: 'var(--plum)', display: 'grid', placeItems: 'center', fontSize: 18, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 300ms' }}>+</span>
                  </button>
                  {open && <p style={{ margin: 0, padding: '0 24px 22px', fontSize: 16, lineHeight: 1.6, color: 'var(--text-2)' }}>{a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Trust({ onDemo }) {
  return (
    <section id="integrations" aria-label="Integrations and trust" style={{ background: 'var(--surface)', padding: '100px clamp(20px,4vw,40px)' }}>
      <div className="lp-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(40px,6vw,80px)' }}>
        <div style={{ flex: '1 1 400px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 className="serif" style={{ margin: 0, fontSize: 'clamp(28px,3vw,36px)', lineHeight: 1.25 }}>Works With the Tools You Already Use</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
            {INTEGRATIONS.map((i) => <div key={i} className="integration">{i}</div>)}
          </div>
          <p style={{ margin: 0, fontSize: 17, color: '#343B4F' }}>No booking app? Upload a list from your phone or a spreadsheet.</p>
          <a href="#demo" onClick={(e) => { e.preventDefault(); onDemo(); }} style={{ fontWeight: 600 }}>Don't see your booking app? Ask us.</a>
        </div>
        <div style={{ flex: '1 1 400px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2 className="serif" style={{ margin: 0, fontSize: 'clamp(28px,3vw,36px)', lineHeight: 1.25 }}>Safe for Your Clients. Fair to Google.</h2>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {TRUST.map((t) => (
              <li key={t.h} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: '#fff', borderRadius: 22, padding: '18px 20px' }}>
                <span style={{ flex: 'none', width: 40, height: 40, borderRadius: '50%', background: '#FFF0F3', display: 'grid', placeItems: 'center' }}><Shield /></span>
                <span style={{ fontSize: 16, lineHeight: 1.55 }}><strong style={{ display: 'block', fontWeight: 600 }}>{t.h}</strong><span style={{ color: 'var(--text-2)' }}>{t.d}</span></span>
              </li>
            ))}
          </ul>
          <Link to="/privacy" style={{ fontWeight: 600 }}>How We Protect Your Clients →</Link>
        </div>
      </div>
    </section>
  );
}

export function DemoVideo({ isMobile, onDemo }) {
  const [videoLang, setVideoLang] = useState('EN');
  const [videoOn, setVideoOn] = useState(false);
  const [chapter, setChapter] = useState(0);
  return (
    <section id="demo" aria-labelledby="demo-h" className="lp-section" style={{ scrollMarginTop: 72 }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h2 id="demo-h" className="lp-h2">See GlowBack in Action (2 Minutes)</h2>
        <div className="chips">
          <button type="button" className="chip" aria-pressed={videoLang === 'EN'} onClick={() => setVideoLang('EN')}>English captions</button>
          <button type="button" className="chip" aria-pressed={videoLang === 'VI'} onClick={() => setVideoLang('VI')}>Tiếng Việt</button>
        </div>
        <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 28, overflow: 'hidden', background: 'linear-gradient(135deg,#3A1D5C,#9D2F8C 55%,#FF8A5B)' }}>
          {!videoOn ? (
            <button type="button" onClick={() => setVideoOn(true)} aria-label="Play the 2-minute GlowBack video" style={{ position: 'absolute', inset: 0, border: 0, background: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <span style={{ position: 'absolute', left: 24, top: 20, color: 'rgba(255,255,255,0.85)', font: '500 13px var(--sans)', textAlign: 'left' }}>Thumbnail: owner smiling at her phone with a new 5-star notification</span>
              <span className="play-circle"><Play /></span>
            </button>
          ) : (
            // Replace this block with your YouTube or Vimeo <iframe> when the video is ready.
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff', textAlign: 'center', padding: 24, fontSize: 15, background: 'rgba(14,11,20,0.55)' }}>
              Video embed loads here (YouTube/Vimeo, {videoLang === 'EN' ? 'English' : 'Vietnamese'} captions) · starting at {CHAPTERS[chapter][0]}
            </div>
          )}
        </div>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CHAPTERS.map(([tm, l], i) => (
            <li key={tm}>
              <button type="button" className={`chapter${videoOn && chapter === i ? ' on' : ''}`} onClick={() => { setChapter(i); setVideoOn(true); }}>
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--plum)', width: 40 }}>{tm}</span>{l}
              </button>
            </li>
          ))}
        </ol>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '24px 28px', borderRadius: 28, background: 'var(--surface)' }}>
          <p style={{ margin: 0, fontSize: 17, flex: '1 1 300px' }}>Want us to walk you through it? Book a 15-minute demo, in English or Vietnamese.</p>
          <button type="button" className="btn btn-outline" onClick={onDemo} style={{ height: isMobile ? 56 : 52, padding: '0 24px', background: '#fff' }}>Book a 15-Minute Demo</button>
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ onTrial, onDemo }) {
  const { lang } = useLang();
  const t = COPY[lang];
  return (
    <section aria-labelledby="final-h" style={{ position: 'relative', background: 'var(--rainbow)', color: '#fff', padding: 'clamp(96px,12vw,150px) clamp(20px,4vw,40px)' }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(14,11,20,0.2),rgba(14,11,20,0.45))' }} />
      <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <h2 id="final-h" className="serif" style={{ margin: 0, fontSize: 'clamp(36px,5vw,56px)', lineHeight: 1.15, textWrap: 'balance', textShadow: '0 2px 18px rgba(14,11,20,0.25)' }}>{t.finalH}</h2>
        <p style={{ margin: 0, fontSize: 'clamp(18px,1.6vw,20px)', lineHeight: 1.6, maxWidth: 620, textShadow: '0 1px 10px rgba(14,11,20,0.3)' }}>{t.finalSub}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          <button type="button" className="btn btn-white" onClick={onTrial} style={{ height: 60, padding: '0 36px', fontSize: 17 }}>{t.cta}</button>
          <button type="button" className="btn btn-white-outline" onClick={onDemo} style={{ height: 60, padding: '0 30px', fontSize: 17 }}>{t.demoCta}</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 20px', fontSize: 15, fontWeight: 500 }}>
          {t.finalTrust.map((c) => <span key={c}>✓ {c}</span>)}
        </div>
      </div>
    </section>
  );
}

export function Footer({ isMobile }) {
  const [news, setNews] = useState('');
  const [status, setStatus] = useState('idle');
  const send = async (e) => {
    e.preventDefault();
    if (!news.trim()) return;
    setStatus('loading');
    try { await submitForm('newsletter', { contact: news.trim() }); setStatus('sent'); } catch { setStatus('error'); }
  };
  return (
    <footer className="footer" style={{ background: 'var(--ink)', color: '#D5D8E2', padding: `80px clamp(20px,4vw,40px) ${isMobile ? 120 : 40}px`, fontSize: 14, lineHeight: 1.6 }}>
      <div className="lp-wrap" style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 24, alignItems: 'flex-end', paddingBottom: 40, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <div style={{ flex: '1 1 320px' }}>
            <div className="serif" style={{ fontSize: 24, color: '#fff', lineHeight: 1.3 }}>Get one simple tip each week to bring more clients into your salon.</div>
          </div>
          {status === 'sent' ? (
            <p style={{ margin: 0, color: 'var(--gold)', fontWeight: 600 }}>Thank you! Your first tip is on the way.</p>
          ) : (
            <form onSubmit={send} style={{ flex: '1 1 360px', display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 480 }}>
              <input aria-label="Email or mobile number" placeholder="Email or mobile number" value={news} onChange={(e) => setNews(e.target.value)} style={{ flex: 1, minWidth: 0, height: 52, font: '16px var(--sans)', padding: '0 20px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: '#fff' }} />
              <button type="submit" className="btn" disabled={status === 'loading'} style={{ padding: '0 24px', background: 'var(--gold)', color: 'var(--ink)', fontWeight: 700, fontSize: 15 }}>{status === 'loading' ? 'Sending…' : 'Send me tips'}</button>
              {status === 'error' && <p className="err" style={{ flexBasis: '100%', color: '#FCA5A5' }}>Something went wrong. Please try again.</p>}
            </form>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="serif" style={{ fontSize: 24, color: '#fff' }}>GlowBack</span>
            <span>More stars. More regulars.</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {['FB', 'IG', 'TT', 'YT'].map((s) => <a key={s} href="#" aria-label={s} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>{s}</a>)}
            </div>
          </div>
          {FOOTER_COLS.map((col) => (
            <nav key={col.h} aria-label={col.h} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#fff', marginBottom: 4 }}>{col.h}</span>
              {col.links.map(([l, href]) => (href.startsWith('/') && !href.startsWith('/#') ? <Link key={l} to={href}>{l}</Link> : <a key={l} href={href}>{l}</a>))}
            </nav>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.12)', color: '#A7ADBE' }}>
          <span>© {new Date().getFullYear()} GlowBack. All rights reserved.</span>
          <span>Call or text <a href="tel:+15615550123" style={{ color: 'var(--gold)', fontWeight: 600 }}>(561) 555-0123</a></span>
        </div>
      </div>
    </footer>
  );
}

export function StickyCta({ onTrial }) {
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 900, padding: '10px 12px calc(10px + env(safe-area-inset-bottom))', background: 'rgba(255,255,255,0.96)', boxShadow: '0 -6px 20px rgba(27,36,64,0.12)', animation: 'gbIn 300ms both' }}>
      <button type="button" className="btn btn-primary btn-block" onClick={onTrial} style={{ height: 56 }}>Start Free Trial – $49/mo, No Contract</button>
    </div>
  );
}
