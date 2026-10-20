import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react';
import { ArrowRight, Plane, Radio, RotateCcw } from 'lucide-react';
import { Reveal } from './Reveal';

type NodeId = 'a' | 'drone' | 'b';

const NODE_ORDER: NodeId[] = ['a', 'drone', 'b'];

const NODE_LABEL: Record<NodeId, string> = {
  a: 'TEAM A',
  drone: 'DRONE RELAY',
  b: 'TEAM B',
};

const NODE_INFO: Record<NodeId, { name: string; role: string; hardware: string; behaviour: string }> = {
  a: {
    name: 'Team A, ground node',
    role: 'Composes and sends messages',
    hardware: 'ESP32 and SX1278 with an OLED, buttons, a buzzer and a battery',
    behaviour:
      'The operator picks a template or writes a short message. The node transmits it over LoRa and waits for an acknowledgement.',
  },
  drone: {
    name: 'Drone relay, intermediate node',
    role: 'Receives and forwards messages',
    hardware: 'ESP32 and SX1278 payload mounted on an F450 quadcopter',
    behaviour:
      'Checks each message ID against a cache to avoid loops, buffers the packet and re-broadcasts it. Flight is handled separately by the pilot.',
  },
  b: {
    name: 'Team B, ground node',
    role: 'Receives messages and confirms',
    hardware: 'ESP32 and SX1278 with an OLED, buttons, a buzzer and a battery',
    behaviour:
      'Shows the incoming message on its OLED, sounds the buzzer and sends an acknowledgement back along the same route.',
  },
};

const PHASES = ['Ready', 'Sending', 'Relaying', 'Delivered'];

interface DashboardPreviewProps {
  onLaunch: () => void;
  isAuthenticated: boolean;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ onLaunch, isAuthenticated }) => {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(containerRef, { once: true, margin: '-120px' });
  const [selected, setSelected] = useState<NodeId>('drone');
  const [phase, setPhase] = useState<number>(0);
  const timers = useRef<number[]>([]);

  const play = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    setPhase(1);
    timers.current = [
      window.setTimeout(() => setPhase(2), 1400),
      window.setTimeout(() => setPhase(3), 2800),
    ];
  }, []);

  useEffect(() => {
    if (reduce) {
      setPhase(3);
      return;
    }
    if (inView) play();
  }, [inView, reduce, play]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const nodeStatus = (id: NodeId): string => {
    if (id === 'a') return phase === 0 ? 'Standby' : phase === 1 ? 'Sending' : 'Sent';
    if (id === 'drone') return phase < 2 ? 'Standby' : phase === 2 ? 'Relaying' : 'Forwarded';
    return phase < 3 ? 'Standby' : 'Received';
  };

  const info = NODE_INFO[selected];

  return (
    <section
      id="dashboard-preview"
      aria-label="Dashboard preview"
      className="py-16 px-6 border-b border-slate-800/60 bg-slate-950/40"
    >
      <div className="max-w-5xl mx-auto" ref={containerRef}>
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2 font-semibold">
            The Dashboard
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">From hardware to live monitoring</h2>
          <p className="text-sm text-slate-400 mt-3">
            Select a node to see its role. The sequence below is an illustration of one message crossing
            the network.
          </p>
        </Reveal>

        <Reveal>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-slate-800 bg-slate-950/60">
              <span className="font-mono text-xs font-bold tracking-wide text-slate-200 uppercase">
                SkyBridge Control Center
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-700/60 uppercase">
                Demonstration, not live data
              </span>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-stretch gap-2 sm:gap-3">
                {NODE_ORDER.map((id, i) => (
                  <React.Fragment key={id}>
                    {i > 0 && (
                      <div
                        className="flex-1 min-w-4 self-center h-0.5 rounded bg-slate-800 relative overflow-hidden"
                        aria-hidden="true"
                      >
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-cyan-400"
                          initial={false}
                          animate={{ width: phase >= i ? '100%' : '0%' }}
                          transition={{ duration: reduce ? 0 : 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelected(id)}
                      aria-pressed={selected === id}
                      className={`flex-1 min-w-0 text-left rounded-xl border p-3 sm:p-4 transition-colors cursor-pointer ${
                        selected === id
                          ? 'border-cyan-500/60 bg-slate-900'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {id === 'drone' ? (
                          <Plane className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                        )}
                        <span className="text-xs font-mono font-bold text-slate-200 truncate">
                          {NODE_LABEL[id]}
                        </span>
                      </div>
                      <div className="mt-2 text-[11px] font-mono text-slate-400">{nodeStatus(id)}</div>
                    </button>
                  </React.Fragment>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                    <span>Recent message</span>
                    {!reduce && (
                      <button
                        type="button"
                        onClick={play}
                        className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 normal-case cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Replay
                      </button>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-slate-100">&ldquo;Emergency assistance required.&rdquo;</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Team A to Team B</span>
                    <span
                      aria-live="polite"
                      className={`px-2 py-0.5 rounded border ${
                        phase === 3
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                          : 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
                      }`}
                    >
                      {PHASES[phase]}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-1.5" aria-hidden="true">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                          phase >= n ? 'bg-cyan-400' : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 min-h-[11rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selected}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      <div>
                        <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                          {info.role}
                        </div>
                        <h3 className="text-sm font-semibold text-slate-100 mt-1">{info.name}</h3>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{info.behaviour}</p>
                      <p className="text-[11px] font-mono text-slate-500">{info.hardware}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="text-center mt-8">
          <button
            type="button"
            onClick={onLaunch}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{isAuthenticated ? 'Return to Console' : 'Launch Demo Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </Reveal>
      </div>
    </section>
  );
};
