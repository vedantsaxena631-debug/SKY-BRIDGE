import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Radio } from 'lucide-react';
import { Reveal } from './Reveal';

interface MissionClosingProps {
  onLaunch: () => void;
  onDocs: () => void;
  isAuthenticated: boolean;
}

export const MissionClosing: React.FC<MissionClosingProps> = ({ onLaunch, onDocs, isAuthenticated }) => {
  const reduce = useReducedMotion();

  // The two links draw in one after the other as the section scrolls into view.
  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true, margin: '-80px' },
          transition: { duration: 1.2, delay, ease: 'easeOut' as const },
        };

  return (
    <section id="mission" aria-label="Mission" className="py-20 px-6 text-center bg-slate-950">
      <div className="max-w-2xl mx-auto space-y-7">
        <Reveal>
          <svg viewBox="0 0 400 120" className="w-full max-w-sm mx-auto h-auto" aria-hidden="true">
            <motion.path
              d="M 54,88 Q 110,40 184,42"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="2.5"
              strokeLinecap="round"
              {...draw(0.2)}
            />
            <motion.path
              d="M 216,42 Q 290,40 346,88"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="2.5"
              strokeLinecap="round"
              {...draw(1.2)}
            />
            <circle cx="40" cy="92" r="9" fill="#0F172A" stroke="#22D3EE" strokeWidth="2" />
            <circle cx="360" cy="92" r="9" fill="#0F172A" stroke="#22D3EE" strokeWidth="2" />
            <g transform="translate(200,42)">
              <line x1="-16" y1="-8" x2="16" y2="8" stroke="#64748B" strokeWidth="2.5" />
              <line x1="-16" y1="8" x2="16" y2="-8" stroke="#64748B" strokeWidth="2.5" />
              <ellipse cx="-16" cy="-8" rx="8" ry="2.5" fill="#38BDF8" opacity="0.5" />
              <ellipse cx="16" cy="-8" rx="8" ry="2.5" fill="#38BDF8" opacity="0.5" />
              <ellipse cx="-16" cy="8" rx="8" ry="2.5" fill="#38BDF8" opacity="0.5" />
              <ellipse cx="16" cy="8" rx="8" ry="2.5" fill="#38BDF8" opacity="0.5" />
              <rect x="-10" y="-5" width="20" height="10" rx="3" fill="#0F172A" stroke="#22D3EE" strokeWidth="1.5" />
            </g>
          </svg>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Radio className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-mono font-bold tracking-tight text-lg text-slate-100">SKYBRIDGE</span>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Bridging communication when infrastructure is unavailable.
          </h2>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onDocs}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono cursor-pointer"
            >
              Explore the Technology
            </button>
            <button
              type="button"
              onClick={onLaunch}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{isAuthenticated ? 'Return to Console' : 'Open Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <p className="text-xs font-mono text-slate-500">
            Designed to explore drone-assisted communication for emergency scenarios.
          </p>
        </Reveal>
      </div>
    </section>
  );
};
