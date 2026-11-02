import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Eye, Forward } from 'lucide-react';
import { Avatar } from './brand';
import { getLang } from '../i18n';

const SCRIPT = {
  en: [
    ['other', 'Are you coming tonight?'],
    ['me', 'Yes! Going LIVE at 9pm'],
    ['other', 'I’ll send you a gift'],
    ['me', 'You’re the best'],
    ['other', 'Sharing your channel link'],
  ],
  fr: [
    ['other', 'Tu viens ce soir ?'],
    ['me', 'Oui ! Je passe en LIVE à 21h'],
    ['other', 'Je t’envoie un cadeau'],
    ['me', 'Tu es le meilleur'],
    ['other', 'Je partage le lien de ta chaîne'],
  ],
} as const;
const EMOJIS = ['❤️', '🔥', '🏆', '⭐', '💎', '🚀', '🌍', '🧡'];

/** Hero illustration: a SYRIX CHAT conversation that keeps typing, next to a channel post collecting reactions. */
export default function HeroVisual() {
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(reduce ? 4 : 0);
  const [count, setCount] = useState(512);
  const [bursts, setBursts] = useState<{ id: number; e: string; x: number }[]>([]);

  useEffect(() => {
    if (reduce) return;
    const a = setInterval(() => setTick((n) => n + 1), 1500);
    const b = setInterval(() => {
      setCount((c) => c + 1 + Math.floor(Math.random() * 3));
      const id = Date.now() + Math.random();
      setBursts((cur) => [...cur.slice(-10), { id, e: EMOJIS[Math.floor(Math.random() * EMOJIS.length)], x: Math.random() * 220 }]);
    }, 520);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, [reduce]);

  const lines = SCRIPT[getLang()];
  const shown = Array.from({ length: Math.min(4, (tick % 7) + 1) }, (_, i) => ({ i: (Math.max(0, (tick % 7) - 3) + i) % lines.length, k: tick - (tick % 7) + Math.max(0, (tick % 7) - 3) + i }));

  return (
    <div className="visual" aria-hidden="true">
      <motion.div
        className="phone"
        style={{ left: '4%', top: 0 }}
        initial={{ y: 60, opacity: 0, rotate: -4 }}
        animate={{ y: 0, opacity: 1, rotate: -4 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
      >
        <div className="screen">
          <div className="island" />
          <div className="chat-head">
            <Avatar name="Mia Lee" size={28} />
            <div>
              Mia Lee
              <div style={{ fontSize: 10.5, color: '#8b8f98', fontWeight: 500 }}>{getLang() === 'fr' ? 'en ligne' : 'online'}</div>
            </div>
          </div>
          <div className="bubbles">
            <AnimatePresence initial={false}>
              {shown.map(({ i, k }) => (
                <motion.div
                  key={k}
                  layout
                  className={`bub ${lines[i][0]}`}
                  initial={{ opacity: 0, scale: 0.6, y: 14 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  style={{ transformOrigin: lines[i][0] === 'me' ? 'right bottom' : 'left bottom' }}
                >
                  {lines[i][1]}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="composer">Message</div>
        </div>
      </motion.div>

      <motion.div
        className="post"
        style={{ right: '0%', top: 250 }}
        initial={{ x: 60, opacity: 0, rotate: 3 }}
        animate={{ x: 0, opacity: 1, rotate: 3 }}
        transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: 0.45 }}
      >
        <div className="quote">{getLang() === 'fr' ? 'Nouvelle vidéo en ligne ce soir' : 'New video drops tonight'}</div>
        <div className="msg">{getLang() === 'fr' ? 'Rendez-vous à 21h sur la chaîne !' : 'See you at 9pm on the channel!'}</div>
        <div className="meta">
          <Eye size={13} /> 6 K · 15:50 <Forward size={13} />
        </div>
        <div className="reacts">
          <span>🏆</span>
          <span>🧡</span>
          <span>❤️</span>
          <motion.span key={count} initial={{ y: -6, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} style={{ marginLeft: 4, fontVariantNumeric: 'tabular-nums' }}>
            {count.toLocaleString()}
          </motion.span>
        </div>
        <AnimatePresence>
          {bursts.map((b) => (
            <motion.span
              key={b.id}
              className="float-emoji"
              style={{ left: b.x, bottom: 0 }}
              initial={{ y: 0, opacity: 0, scale: 0.5 }}
              animate={{ y: -170, opacity: [0, 1, 1, 0], scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
            >
              {b.e}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
