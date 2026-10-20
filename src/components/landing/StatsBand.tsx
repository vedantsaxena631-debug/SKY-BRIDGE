import React, { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';
import { Reveal } from './Reveal';

const CountUp: React.FC<{ to: number }> = ({ to }) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const [value, setValue] = useState<number>(reduce ? to : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, to]);

  return <span ref={ref}>{value}</span>;
};

// Every figure comes from the project's own design: the radio band, the two ground teams,
// the single airborne relay, and the two LoRa hops of the path Team A -> drone -> Team B.
const STATS: { value: number; unit: string; label: string }[] = [
  { value: 433, unit: 'MHz', label: 'LoRa band' },
  { value: 2, unit: '', label: 'Ground teams' },
  { value: 1, unit: '', label: 'Airborne relay' },
  { value: 2, unit: '', label: 'LoRa hops, A to B' },
];

export const StatsBand: React.FC = () => (
  <section aria-label="Key figures" className="py-14 px-6 border-b border-slate-800/60 bg-slate-950/40">
    <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
      {STATS.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.1} className="text-center">
          <div className="font-mono font-extrabold text-4xl sm:text-5xl text-cyan-300 tabular-nums">
            <CountUp to={s.value} />
            {s.unit && <span className="text-xl sm:text-2xl text-cyan-500 ml-1">{s.unit}</span>}
          </div>
          <div className="mt-2 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            {s.label}
          </div>
        </Reveal>
      ))}
    </div>
  </section>
);
