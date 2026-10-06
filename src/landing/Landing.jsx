import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Header, Hero, HowItWorks, Problems } from './Top.jsx';
import { Calculator, Features, SocialProof } from './Middle.jsx';
import { DemoVideo, FinalCta, Footer, Pricing, StickyCta, Trust } from './Bottom.jsx';
import SignupModal from './SignupModal.jsx';
import { useWindowWidth } from './hooks.js';

const SECTIONS = ['how', 'results', 'pricing', 'faq'];

export default function Landing() {
  const w = useWindowWidth();
  const isDesktop = w >= 1024;
  const isMobile = w < 768;
  const [scrollY, setScrollY] = useState(0);
  const [active, setActive] = useState(null);
  const [modal, setModal] = useState(null);
  const raf = useRef(0);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        setScrollY(window.scrollY);
        let a = null;
        SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 140) a = id; });
        setActive(a);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Deep links: /#pricing scrolls to the section, ?start=trial or ?start=demo opens the form.
  useEffect(() => {
    const start = new URLSearchParams(location.search).get('start');
    if (start === 'trial' || start === 'demo') setModal(start);
    if (location.hash) setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView(), 50);
  }, [location]);

  const openTrial = useCallback(() => setModal('trial'), []);
  const openDemo = useCallback(() => setModal('demo'), []);
  const close = useCallback(() => setModal(null), []);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header isDesktop={isDesktop} isMobile={isMobile} scrollY={scrollY} active={active} onTrial={openTrial} />
      <main id="main">
        <Hero isDesktop={isDesktop} isMobile={isMobile} onTrial={openTrial} />
        <Problems />
        <HowItWorks />
        <Features />
        <Calculator isMobile={isMobile} onTrial={openTrial} />
        <SocialProof />
        <Pricing isMobile={isMobile} onTrial={openTrial} onDemo={openDemo} />
        <Trust onDemo={openDemo} />
        <DemoVideo isMobile={isMobile} onDemo={openDemo} />
        <FinalCta onTrial={openTrial} onDemo={openDemo} />
      </main>
      <Footer isMobile={isMobile} />
      {isMobile && scrollY > 700 && !modal && <StickyCta onTrial={openTrial} />}
      {modal && <SignupModal mode={modal} onClose={close} />}
    </>
  );
}
