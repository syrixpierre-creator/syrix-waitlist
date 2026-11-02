import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react';
import {
  Bot, Coins, Key as KeyIcon, History, Link2, Lock, MessageCircle, Phone, Plus, Radio, Send, Smartphone, Sparkles, Users, Volume2, VolumeX, Wallet, Zap, Camera, Check, ChevronDown, Megaphone,
} from 'lucide-react';
import { t, type Key } from '../i18n';
import { SyrixLogo, WhaRiseLogo } from './brand';
import WaitlistForm from './WaitlistForm';

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const },
};

function Heading({ tag, title, sub, logo }: { tag: string; title: string; sub: string; logo: React.ReactNode }) {
  return (
    <motion.div className="sec-head" {...reveal}>
      <span className="tag">{logo}{tag}</span>
      <h2 className="h2">{title}</h2>
      <p className="sub">{sub}</p>
    </motion.div>
  );
}

const SYRIX_FEATURES: [React.ElementType, Key, Key][] = [
  [MessageCircle, 'f.chat', 'f.chatSub'],
  [Megaphone, 'f.channels', 'f.channelsSub'],
  [Phone, 'f.calls', 'f.callsSub'],
  [Camera, 'f.stories', 'f.storiesSub'],
  [Radio, 'f.live', 'f.liveSub'],
  [Wallet, 'f.money', 'f.moneySub'],
  [Sparkles, 'f.ai', 'f.aiSub'],
  [Bot, 'f.bots', 'f.botsSub'],
  [Lock, 'f.control', 'f.controlSub'],
];

export function SyrixSection() {
  const video = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { margin: '-30%' });
  const [muted, setMuted] = useState(true);
  const { scrollYProgress } = useScroll({ target: box, offset: ['start end', 'end start'] });
  const tilt = useTransform(scrollYProgress, [0, 0.5, 1], [6, 0, -6]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (inView) void v.play().catch(() => undefined);
    else v.pause();
  }, [inView]);

  return (
    <section id="syrix" className="sec">
      <div className="wrap">
        <Heading tag={t('syrix.kicker')} title={t('syrix.title')} sub={t('syrix.sub')} logo={<SyrixLogo size={28} />} />
        <div className="syrix-grid">
          <motion.div ref={box} style={{ rotate: tilt }} {...reveal}>
            <div className="video-phone">
              <video ref={video} src="/media/syrix-promo.mp4" poster="/media/syrix-promo-poster.jpg" muted={muted} loop playsInline preload="metadata" />
              <button className="sound" onClick={() => { setMuted((m) => !m); if (video.current) { video.current.muted = !muted; void video.current.play().catch(() => undefined); } }}>
                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                {muted ? t('syrix.unmute') : t('syrix.mute')}
              </button>
            </div>
            <span className="soon"><Smartphone size={16} />{t('syrix.soon')}</span>
          </motion.div>
          <div className="features">
            {SYRIX_FEATURES.map(([Icon, title, sub], i) => (
              <motion.div key={title} className="feat" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}>
                <span className="ic"><Icon size={22} /></span>
                <h3>{t(title)}</h3>
                <p>{t(sub)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const PICKER = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤', '🔥', '⭐', '🏆', '💎', '🚀', '🌍', '😍', '😂', '🙌', '👏', '🥳', '😎', '✨', '⚡', '🎉', '💯'];
const PICKED = [0, 1, 8, 10, 11, 12, 13];
const LINK = 'https://whatsapp.com/channel/0029VbC6It7K0IBkQwaKYd2J/108';

/** Auto-playing WhaRise walkthrough: type the link, pick emojis, send, watch the post collect reactions. */
function WhaRiseDemo({ onStep }: { onStep: (n: number) => void }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-20%' });
  const [ms, setMs] = useState(reduce ? 7000 : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const start = performance.now() - ms;
    let raf = 0;
    const loop = (now: number) => {
      setMs((now - start) % 9000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);

  const typed = LINK.slice(0, Math.round(LINK.length * Math.min(1, ms / 1800)));
  const picks = PICKED.filter((_, i) => ms > 2000 + i * 260);
  const pressing = ms > 4300 && ms < 4550;
  const sent = ms > 4600;
  const step = ms < 2000 ? 0 : ms < 4300 ? 1 : 2;
  useEffect(() => onStep(step), [step, onStep]);
  const reactions = sent ? Math.min(30, Math.floor((ms - 4600) / 90)) : 0;

  return (
    <div className="demo" ref={ref} aria-hidden="true">
      <div className="demo-top">
        <WhaRiseLogo size={30} />WhaRise
        <span className="coins"><Coins size={15} />{sent ? 90 : 120}</span>
      </div>
      <p className="demo-label">{t('wr.demoLinkLabel')}</p>
      <div className="demo-input">{typed}{ms < 2000 && <span className="caret" />}</div>
      <p className="demo-label">{t('wr.demoEmojis', { n: picks.length })}</p>
      <div className="emoji-grid">
        {PICKER.map((e, i) => <span key={e} className={picks.includes(i) ? 'sel' : ''}>{e}</span>)}
      </div>
      <motion.div className="demo-send" animate={{ scale: pressing ? 0.94 : 1 }}>
        <Send size={18} />{t('wr.demoSend')}
      </motion.div>
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 18, padding: 14, borderRadius: 16, border: '1px solid #262a33', display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800 }}>0029VbC6… / 108</div>
              <div style={{ fontSize: 13, color: '#9aa0ab', marginTop: 2 }}>{PICKED.map((i) => PICKER[i]).join(' ')} · {t('wr.demoReactions', { n: reactions })}</div>
            </div>
            <span className="sent"><Check size={14} strokeWidth={3} />{t('wr.demoSent')}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {sent && Array.from({ length: Math.min(14, reactions) }, (_, i) => (
          <motion.span
            key={i}
            className="float-emoji"
            style={{ left: `${10 + ((i * 37) % 80)}%`, bottom: 30 }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: -260 - (i % 4) * 30, opacity: [0, 1, 0] }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
          >
            {PICKER[PICKED[i % PICKED.length]]}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

const WR_FEATURES: [React.ElementType, Key, Key][] = [
  [Zap, 'wr.auto', 'wr.autoSub'],
  [Coins, 'wr.coins', 'wr.coinsSub'],
  [KeyIcon, 'wr.api', 'wr.apiSub'],
  [History, 'wr.history', 'wr.historySub'],
];

export function WhaRiseSection() {
  const [step, setStep] = useState(0);
  const steps: [React.ElementType, Key, Key][] = [[Link2, 'wr.s1', 'wr.s1Sub'], [Plus, 'wr.s2', 'wr.s2Sub'], [Send, 'wr.s3', 'wr.s3Sub']];
  return (
    <section id="wharise" className="sec" style={{ background: 'linear-gradient(180deg, transparent, #0a0d0b 30%, transparent)' }}>
      <div className="wrap">
        <Heading tag={t('wr.kicker')} title={t('wr.title')} sub={t('wr.sub')} logo={<WhaRiseLogo size={28} />} />
        <div className="wr-grid">
          <div className="steps">
            {steps.map(([Icon, title, sub], i) => (
              <motion.div key={title} className={`step ${step === i ? 'on' : ''}`} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                <span className="n">{i + 1}</span>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icon size={18} />{t(title)}</h3>
                  <p>{t(sub)}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div {...reveal}>
            <WhaRiseDemo onStep={setStep} />
          </motion.div>
        </div>
        <div className="wr-features">
          {WR_FEATURES.map(([Icon, title, sub], i) => (
            <motion.div key={title} className="feat wr" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}>
              <span className="ic"><Icon size={22} /></span>
              <h3>{t(title)}</h3>
              <p>{t(sub)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Band() {
  const reduce = useReducedMotion();
  const items: Key[] = ['f.chat', 'f.live', 'wr.auto', 'f.money', 'f.channels', 'wr.s2', 'f.ai', 'f.stories', 'wr.api', 'f.bots', 'f.calls', 'wr.coins'];
  const row = [...items, ...items];
  return (
    <section className="band">
      <motion.div className="marquee" animate={reduce ? undefined : { x: ['0%', '-50%'] }} transition={{ duration: 40, ease: 'linear', repeat: Infinity }}>
        {row.map((k, i) => (
          <span key={i} className="chip">{k.startsWith('wr') ? <WhaRiseLogo size={20} /> : <SyrixLogo size={20} />}{t(k)}</span>
        ))}
      </motion.div>
      <div className="wrap band-cta">
        <motion.h2 className="h2" {...reveal}>{t('band.title')}</motion.h2>
        <motion.p className="sub" {...reveal}>{t('band.sub')}</motion.p>
        <motion.div {...reveal} style={{ display: 'flex', justifyContent: 'center' }}>
          <WaitlistForm />
        </motion.div>
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const qs: [Key, Key][] = [['faq.q1', 'faq.a1'], ['faq.q2', 'faq.a2'], ['faq.q3', 'faq.a3'], ['faq.q4', 'faq.a4'], ['faq.q5', 'faq.a5']];
  return (
    <section id="faq" className="sec">
      <div className="wrap">
        <motion.h2 className="h2" style={{ textAlign: 'center' }} {...reveal}>{t('faq.title')}</motion.h2>
        <div className="faq">
          {qs.map(([q, a], i) => (
            <motion.div key={q} className="qa" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                {t(q)}
                <motion.span animate={{ rotate: open === i ? 180 : 0 }}><ChevronDown size={20} /></motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <p className="a">{t(a)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const Footer = () => (
  <footer>
    <div className="wrap foot">
      <span>© 2026 · {t('footer.by')}</span>
      <nav>
        <a href="https://syrix.chat/terms">{t('footer.terms')}</a>
        <a href="https://syrix.chat/privacy-policy">{t('footer.privacy')}</a>
        <a href="https://syrix.chat"><Users size={14} style={{ display: 'inline', verticalAlign: '-2px' }} /> syrix.chat</a>
      </nav>
    </div>
  </footer>
);
