import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Arrow, Calendar, Chair, Chat, Check, Close, Logo, Menu, PhoneOff, Search, Star, Stars } from '../components/Icons.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useLang } from '../lib/i18n.jsx';
import { COPY, FEED, OTHERS, PROBLEMS } from './data.js';
import { useReducedMotion } from './hooks.js';

const NAV_IDS = ['how', 'results', 'pricing', 'faq'];

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="seg" role="group" aria-label="Language">
      <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
      <button type="button" aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>VI</button>
    </div>
  );
}

export function Header({ isDesktop, isMobile, scrollY, active, onTrial }) {
  const { lang, setLang } = useLang();
  const t = COPY[lang];
  const { user } = useAuth();
  const account = user ? { to: '/app', label: lang === 'vi' ? 'Bảng điều khiển' : 'My Dashboard' } : { to: '/login', label: t.signIn };
  const [menuOpen, setMenuOpen] = useState(false);
  const solid = scrollY > 80 || menuOpen;

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: solid ? '#fff' : 'transparent', boxShadow: scrollY > 80 ? '0 2px 16px rgba(27,36,64,0.08)' : 'none', transition: 'background 300ms, box-shadow 300ms' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', height: isMobile ? 60 : 72, padding: '0 clamp(16px,4vw,40px)', display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#top" aria-label="GlowBack home" style={{ textDecoration: 'none' }}><Logo /></a>
          {isDesktop && (
            <nav aria-label="Main" style={{ display: 'flex', gap: 28 }}>
              {NAV_IDS.map((id, i) => (
                <a key={id} href={`#${id}`} className={`nav-link${active === id ? ' active' : ''}`}>{t.nav[i]}<span className="underline" /></a>
              ))}
            </nav>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
            {isDesktop && (
              <>
                <LangToggle />
                <Link to={account.to} style={{ color: 'var(--ink)', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>{account.label}</Link>
              </>
            )}
            <button type="button" className="btn btn-primary" onClick={onTrial} style={{ height: 44, padding: '0 20px', fontSize: 15 }}>{t.navCta}</button>
            {!isDesktop && (
              <button type="button" className="icon-btn" aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu /></button>
            )}
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(14,11,20,0.45)' }} />
          <aside aria-label="Menu" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(340px,86vw)', zIndex: 1101, background: '#fff', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '-12px 0 40px rgba(27,36,64,0.2)', animation: 'gbIn 250ms both', overflowY: 'auto' }}>
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)} style={{ alignSelf: 'flex-end' }}><Close /></button>
            {NAV_IDS.map((id, i) => (
              <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)} className="serif" style={{ fontSize: 28, color: 'var(--ink)', textDecoration: 'none', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>{t.nav[i]}</a>
            ))}
            <div className="seg block" role="group" aria-label="Language" style={{ marginTop: 16 }}>
              <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>English</button>
              <button type="button" aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>Tiếng Việt</button>
            </div>
            <Link to={account.to} style={{ padding: '12px 0', fontWeight: 500 }}>{account.label}</Link>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button type="button" className="btn btn-primary btn-block" onClick={() => { setMenuOpen(false); onTrial(); }}>{t.cta}</button>
              <p className="muted small" style={{ margin: 0, textAlign: 'center' }}>{t.micro}</p>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function PhoneMockup() {
  const rm = useReducedMotion();
  const [feedCount, setFeedCount] = useState(rm ? 3 : 0);
  const [reviews, setReviews] = useState(rm ? 203 : 87);

  useEffect(() => {
    if (rm) return;
    let timers = [];
    let raf = 0;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const count = () => {
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 8000);
        setReviews(Math.round(87 + 116 * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const cycle = () => {
      timers.forEach(clearTimeout); timers = [];
      cancelAnimationFrame(raf);
      setFeedCount(0); setReviews(87);
      later(() => setFeedCount(1), 900);
      later(count, 1100);
      later(() => setFeedCount(2), 4200);
      later(() => setFeedCount(3), 7500);
      later(cycle, 17000);
    };
    cycle();
    return () => { timers.forEach(clearTimeout); cancelAnimationFrame(raf); };
  }, [rm]);

  return (
    <div style={{ flex: '2 1 340px', minWidth: 0, display: 'flex', justifyContent: 'center', position: 'relative', padding: '0 0 40px' }}>
      <div style={{ position: 'relative', width: 300, maxWidth: '100%', aspectRatio: '300/610', borderRadius: 48, background: '#0E0B14', padding: 12, boxShadow: '0 30px 70px rgba(91,42,134,0.28)' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 38, overflow: 'hidden', background: 'linear-gradient(170deg,#3A1D5C 0%,#7A2C84 45%,#D63A7E 80%,#FF8A5B 100%)' }}>
          <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 90, height: 26, borderRadius: 999, background: '#0E0B14' }} />
          <div style={{ padding: '58px 14px 0', textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.9 }}>Friday, May 16</div>
            <div style={{ fontSize: 64, fontWeight: 300, lineHeight: 1.05, letterSpacing: '-0.02em' }}>2:14</div>
          </div>
          <div aria-live="polite" aria-label="Example notifications" style={{ position: 'absolute', left: 12, right: 12, top: 170, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FEED.slice(0, feedCount).map((n) => (
              <div key={n.title} style={{ display: 'flex', gap: 10, padding: 12, borderRadius: 20, background: 'rgba(255,255,255,0.94)', boxShadow: '0 6px 18px rgba(14,11,20,0.25)', animation: 'gbIn 500ms cubic-bezier(0.4,0,0.2,1) both', textAlign: 'left' }}>
                <div style={{ flex: 'none', width: 34, height: 34, borderRadius: 10, background: n.kind === 'review' ? '#FFF6DC' : 'var(--lilac)', display: 'grid', placeItems: 'center' }}>
                  {n.kind === 'review' ? <Star size={18} /> : <Chat size={18} />}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--muted)', textTransform: 'uppercase' }}><span>{n.app}</span><span>now</span></div>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, color: 'var(--ink)' }}>{n.title}</div>
                  {n.kind === 'review' && <div style={{ margin: '2px 0' }}><Stars size={12} gap={1} /></div>}
                  <div style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--text-2)' }}>{n.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 'max(0px, calc(50% - 220px))', bottom: 0, background: '#fff', borderRadius: 20, padding: '16px 20px', boxShadow: '0 14px 36px rgba(91,42,134,0.22)', border: '1px solid var(--line)', minWidth: 200 }}>
        <div className="eyebrow">Google reviews</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
          <span style={{ fontSize: 20, color: 'var(--muted)', fontWeight: 500 }}>87</span>
          <Arrow />
          <span className="serif" style={{ fontSize: 40, lineHeight: 1, color: 'var(--plum)' }}>{reviews}</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: '#92400E' }}>Example numbers</div>
      </div>
    </div>
  );
}

export function Hero({ isDesktop, isMobile, onTrial }) {
  const { lang } = useLang();
  const t = COPY[lang];
  const rm = useReducedMotion();
  const [rot, setRot] = useState(0);
  useEffect(() => {
    if (rm) return;
    const id = setInterval(() => setRot((r) => (r + 1) % 3), 2600);
    return () => clearInterval(id);
  }, [rm]);
  const ctaH = isMobile ? 56 : 52;

  return (
    <section id="top" style={{ position: 'relative', overflow: 'hidden', minHeight: isDesktop ? '90vh' : 'auto', padding: 'calc(72px + clamp(40px,7vw,88px)) clamp(20px,4vw,40px) clamp(64px,8vw,100px)', display: 'flex', alignItems: 'center' }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: 620, height: 620, borderRadius: '50%', left: -140, top: -160, background: '#9D2F8C', opacity: 0.1, filter: 'blur(90px)', animation: 'gbAurora 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', right: -120, top: 40, background: '#FF8A5B', opacity: 0.12, filter: 'blur(100px)', animation: 'gbAurora 22s ease-in-out infinite reverse' }} />
        <div style={{ position: 'absolute', width: 480, height: 480, borderRadius: '50%', left: '40%', bottom: -220, background: '#FFD166', opacity: 0.12, filter: 'blur(90px)', animation: 'gbAurora 26s ease-in-out infinite' }} />
      </div>
      <div style={{ position: 'relative', maxWidth: 1200, width: '100%', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(40px,6vw,72px)' }}>
        <div style={{ flex: '3 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 999, background: '#fff', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)', fontSize: 14, fontWeight: 500 }}>
            <Star size={16} />{t.badge}
          </span>
          <h1 className="serif" style={{ margin: 0, fontSize: 'clamp(38px,5.2vw,62px)', lineHeight: 1.1, letterSpacing: '-0.01em', textWrap: 'balance' }}>{t.h1}</h1>
          <p aria-hidden="true" className="serif" style={{ margin: '-8px 0 0', height: '1.3em', fontSize: 'clamp(24px,2.6vw,32px)', lineHeight: 1.3, overflow: 'hidden' }}>
            <span key={rot} style={{ display: 'inline-block', background: 'linear-gradient(90deg,#5B2A86,#D63A7E)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: 'gbIn 500ms both' }}>{t.rot[rot]}</span>
          </p>
          <p style={{ margin: 0, fontSize: 'clamp(18px,1.6vw,20px)', lineHeight: 1.6, color: 'var(--text-2)', maxWidth: 560, textWrap: 'pretty' }}>{t.sub}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, width: '100%' }}>
            <button type="button" className="btn btn-primary btn-hero" onClick={onTrial} style={{ height: ctaH }}>
              <span aria-hidden="true" className="shimmer" />
              <span style={{ position: 'relative' }}>{t.cta}</span>
            </button>
            <a href="#demo" className="btn btn-outline" style={{ height: ctaH, fontSize: 17 }}>{t.cta2}</a>
          </div>
          <p style={{ margin: '-8px 0 0', fontSize: 14, color: 'var(--muted)' }}>{t.micro}</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {t.chips.map((c) => (
              <li key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px 6px 10px', borderRadius: 999, background: 'var(--surface)', fontSize: 14, fontWeight: 500 }}>
                <Check />{c}
              </li>
            ))}
          </ul>
        </div>
        <PhoneMockup />
      </div>
    </section>
  );
}

const PROBLEM_ICON = { phone: <PhoneOff />, chair: <Chair />, cal: <Calendar /> };

export function Problems() {
  return (
    <section aria-labelledby="problem-h" className="lp-section" style={{ background: 'var(--surface)' }}>
      <div className="lp-wrap">
        <h2 id="problem-h" className="lp-h2" style={{ marginBottom: 'clamp(40px,5vw,64px)', maxWidth: 760 }}>Great Nails. Empty Chairs. Why Is the Salon Across the Street Busier?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 24 }}>
          {PROBLEMS.map((p) => (
            <article key={p.title} style={{ background: '#fff', borderRadius: 28, padding: 'clamp(24px,3vw,36px)', display: 'flex', flexDirection: 'column', gap: 16, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FFF0F3', display: 'grid', placeItems: 'center' }}>{PROBLEM_ICON[p.icon]}</div>
              <h3 style={{ margin: 0, fontWeight: 600, fontSize: 24, lineHeight: 1.35 }}>{p.title}</h3>
              <p className="lp-p" style={{ flex: 1 }}>{p.body}</p>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.1, color: 'var(--plum)' }}>{p.stat}</div>
                <div style={{ fontSize: 16, marginTop: 4 }}>{p.statText}</div>
                <div className="eyebrow" style={{ marginTop: 8 }}>{p.source}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MapRanking() {
  const rm = useReducedMotion();
  const ref = useRef(null);
  const [p, setP] = useState(rm ? 1 : 0);
  const raf = useRef(0);

  const run = () => {
    cancelAnimationFrame(raf.current);
    if (rm) { setP(1); return; }
    setP(0);
    const t0 = performance.now() + 200;
    const step = (t) => {
      const k = Math.max(0, Math.min(1, (t - t0) / 3000));
      setP(1 - Math.pow(1 - k, 3));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const el = ref.current;
    if (rm || !el || !('IntersectionObserver' in window)) { setP(1); return; }
    const io = new IntersectionObserver((es) => {
      if (es.some((x) => x.isIntersecting)) { run(); io.disconnect(); }
    }, { threshold: 0.35 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rm]);

  const rowH = 66;
  const myRank = 6 - Math.round(p * 5);
  const others = OTHERS.map((o, i) => { const pos = i < myRank - 1 ? i : i + 1; return { ...o, rank: pos + 1, top: pos * rowH }; });
  const mine = { rank: myRank, top: (myRank - 1) * rowH, reviews: Math.round(87 + (214 - 87) * p), rating: (4.6 + 0.3 * p).toFixed(1) };
  const rowStyle = { position: 'absolute', left: 12, right: 12, height: 64, transition: 'top 450ms cubic-bezier(0.4,0,0.2,1)', display: 'flex', alignItems: 'center', gap: 12 };
  const pin = (left, top, size, color, glow) => (
    <span style={{ position: 'absolute', left, top, width: size, height: size, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: color, boxShadow: glow ? '0 0 0 4px rgba(214,58,126,0.2)' : 'none' }} />
  );

  return (
    <figure ref={ref} style={{ flex: '3 1 460px', minWidth: 0, margin: 0, background: '#fff', border: '1px solid var(--line)', borderRadius: 28, boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
      <div style={{ height: 120, position: 'relative', backgroundColor: '#EEF1EC', backgroundImage: 'linear-gradient(90deg,rgba(255,255,255,0.9) 2px,transparent 2px),linear-gradient(rgba(255,255,255,0.9) 2px,transparent 2px)', backgroundSize: '56px 56px' }}>
        <div style={{ position: 'absolute', left: 18, right: 18, top: 16, height: 44, borderRadius: 999, background: '#fff', boxShadow: '0 2px 8px rgba(27,36,64,0.12)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', fontSize: 15 }}>
          <Search />nail salon near me
        </div>
        {pin('22%', 78, 14, '#9CA3AF')}
        {pin('48%', 86, 14, '#9CA3AF')}
        {pin('70%', 74, 20, '#D63A7E', true)}
      </div>
      <div style={{ position: 'relative', height: rowH * 6, margin: '8px 0' }}>
        <div style={{ ...rowStyle, top: mine.top, zIndex: 2, padding: '0 14px', borderRadius: 18, background: 'var(--lilac)', border: '2px solid var(--plum)' }}>
          <span style={{ width: 28, fontWeight: 700, color: 'var(--plum)' }}>#{mine.rank}</span>
          <div className="grow">
            <div style={{ fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>Your Salon <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: 'var(--plum)', color: '#fff' }}>You</span></div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}><strong style={{ color: 'var(--ink)' }}>{mine.rating}</strong><Star size={12} />({mine.reviews} reviews)</div>
          </div>
        </div>
        {others.map((o) => (
          <div key={o.name} style={{ ...rowStyle, top: o.top, padding: '0 16px', borderBottom: '1px solid #F0ECF3' }}>
            <span style={{ width: 28, fontWeight: 600, color: 'var(--muted)' }}>#{o.rank}</span>
            <div className="grow">
              <div style={{ fontWeight: 500 }}>{o.name}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{o.rating} ★ ({o.reviews} reviews)</div>
            </div>
          </div>
        ))}
      </div>
      <figcaption style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'var(--surface)', fontSize: 13, color: 'var(--text-2)', margin: 0 }}>
        <span>Illustration only. Not a guaranteed result.</span>
        <button type="button" className="link-btn" onClick={run} style={{ fontSize: 13 }}>Replay</button>
      </figcaption>
    </figure>
  );
}

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="solution-h" className="lp-section" style={{ scrollMarginTop: 72 }}>
      <div className="lp-wrap">
        <h2 id="solution-h" className="lp-h2" style={{ marginBottom: 'clamp(32px,4vw,56px)', maxWidth: 820 }}>Your Clients Already Love You. GlowBack Makes Sure Google—and They—Remember.</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(32px,5vw,64px)', alignItems: 'flex-start' }}>
          <div style={{ flex: '2 1 340px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20, fontSize: 18, lineHeight: 1.65, color: '#343B4F' }}>
            <p style={{ margin: 0 }}>You don't need a marketing agency, and you don't need to learn Instagram. Your best marketing is already sitting in your chairs every day: happy clients.</p>
            <p style={{ margin: 0 }}>After each visit, GlowBack sends a friendly text in your salon's name with a one-tap link to leave a Google review. When a regular hasn't been back in a while, it sends a warm "We miss you" text with a link to book. Everything runs by itself.</p>
            <p style={{ margin: 0 }}>More stars move you up on Google Maps. More regulars come back on time. And you get your evenings back.</p>
            <div style={{ marginTop: 12, padding: '24px 28px', background: '#FFF8E6', borderLeft: '4px solid var(--gold)', borderRadius: '6px 20px 20px 6px', color: 'var(--ink)' }}>
              Unlike marketing agencies, GlowBack costs <strong>$49/month</strong>, needs no contract, and shows you every new review and returning client, so you always know it's working.
            </div>
          </div>
          <MapRanking />
        </div>
      </div>
    </section>
  );
}
