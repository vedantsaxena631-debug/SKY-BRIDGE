import React from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

const ROW_ONE = [
  '433 MHz LoRa',
  'ESP32',
  'SX1278',
  'Store-and-forward relay',
  'msgID de-duplication',
  'ACK with retry',
];
const ROW_TWO = [
  'F450 quadcopter',
  'Node.js serial gateway',
  'MongoDB',
  'Socket.IO',
  'React dashboard',
  'Demo and live modes',
];

const Row: React.FC<{ items: string[]; reverse?: boolean }> = ({ items, reverse = false }) => {
  // Each row is rendered twice so the loop is seamless when it travels half its width.
  const doubled = [...items, ...items];
  return (
    <motion.div
      className="flex w-max gap-4"
      animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
      transition={{ duration: 38, ease: 'linear', repeat: Infinity }}
    >
      {doubled.map((label, i) => (
        <span
          key={`${label}-${i}`}
          className="shrink-0 px-4 py-2 rounded-full border border-slate-800 bg-slate-900/70 text-xs font-mono text-slate-300"
        >
          {label}
        </span>
      ))}
    </motion.div>
  );
};

/** Two opposite-direction tickers of the real hardware and software the project uses. */
export const Marquee: React.FC = () => {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  // A little extra skew that follows scroll position keeps the strip feeling alive.
  const skew = useTransform(scrollYProgress, [0, 1], [-1.5, 1.5]);

  if (reduce) {
    return (
      <section aria-label="Technology used" className="py-8 px-6 border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-3">
          {[...ROW_ONE, ...ROW_TWO].map((label) => (
            <span
              key={label}
              className="px-4 py-2 rounded-full border border-slate-800 bg-slate-900/70 text-xs font-mono text-slate-300"
            >
              {label}
            </span>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Technology used"
      className="py-8 border-b border-slate-800/60 overflow-hidden"
    >
      <motion.div style={{ skewY: skew }} className="space-y-4">
        <Row items={ROW_ONE} />
        <Row items={ROW_TWO} reverse />
      </motion.div>
    </section>
  );
};
