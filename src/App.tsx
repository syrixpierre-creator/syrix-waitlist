import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { setLang, t, useLang } from './i18n';
import { SyrixLogo } from './components/brand';
import WaitlistForm from './components/WaitlistForm';
import HeroVisual from './components/HeroVisual';
import { Band, Faq, Footer, SyrixSection, WhaRiseSection } from './components/Sections';

function Nav() {
  const lang = useLang();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="wrap nav-in">
        <a href="#top" className="brand"><SyrixLogo size={32} />SYRIX</a>
        <nav className="nav-links">
          <a href="#syrix">{t('nav.syrix')}</a>
          <a href="#wharise">{t('nav.wharise')}</a>
          <a href="#faq">{t('nav.faq')}</a>
        </nav>
        <span className="spacer" />
        <div className="lang" role="group" aria-label="Language">
          <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
          <button aria-pressed={lang === 'fr'} onClick={() => setLang('fr')}>FR</button>
        </div>
        <a className="btn btn-primary" href="#join">{t('nav.join')}</a>
      </div>
    </header>
  );
}

/** Headline words slide up from behind a mask, one after another. */
function Kinetic({ text, accent = false, delay = 0 }: { text: string; accent?: boolean; delay?: number }) {
  return (
    <span className="line">
      {text.split(' ').map((w, i) => (
        <motion.span
          key={`${text}-${i}`}
          className={`word ${accent ? 'accent' : ''}`}
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.7, delay: delay + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

export default function App() {
  const lang = useLang();
  useEffect(() => {
    document.title = lang === 'fr' ? "Liste d'attente · SYRIX CHAT & WhaRise" : 'Waitlist · SYRIX CHAT & WhaRise';
  }, [lang]);
  return (
    <>
      <Nav />
      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <motion.span className="kicker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <span className="dot" />{t('hero.kicker')}
              </motion.span>
              <h1 className="h1" key={lang}>
                <Kinetic text={t('hero.title1')} delay={0.1} />
                <Kinetic text={t('hero.title2')} accent delay={0.35} />
              </h1>
              <motion.p className="lead" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
                {t('hero.sub')}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.6 }}>
                <WaitlistForm id="join" />
              </motion.div>
            </div>
            <HeroVisual key={lang} />
          </div>
        </section>
        <SyrixSection />
        <WhaRiseSection />
        <Band />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
