import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useScrollStage } from '../../hooks/useScrollStage';

type System = 'flight' | 'comms' | 'ground';

interface HardwareStage {
  id: string;
  system: System;
  title: string;
  detail: string;
}

const STAGES: HardwareStage[] = [
  {
    id: 'frame',
    system: 'flight',
    title: 'Quadcopter frame',
    detail: 'An F450 airframe carries the flight controller, the 3S LiPo battery and the relay payload.',
  },
  {
    id: 'propulsion',
    system: 'flight',
    title: 'Motors and ESCs',
    detail: 'Four A2212 1000KV motors driven by 30A ESCs. The drone is flown by hand with a FlySky FS-i6X.',
  },
  {
    id: 'esp32',
    system: 'comms',
    title: 'ESP32',
    detail: 'Runs the relay firmware: it checks each message ID, buffers the packet and re-broadcasts it.',
  },
  {
    id: 'lora',
    system: 'comms',
    title: 'SX1278 LoRa module',
    detail: 'The 433 MHz radio link between the drone and the ground teams, with an antenna hanging below.',
  },
  {
    id: 'ground',
    system: 'ground',
    title: 'Ground nodes',
    detail: 'Each team has an ESP32 and SX1278 with an OLED, buttons and a buzzer to send and receive messages.',
  },
];

const SYSTEM_STYLE: Record<System, { label: string; chip: string }> = {
  flight: { label: 'Flight system', chip: 'text-amber-300 bg-amber-950/50 border-amber-700/50' },
  comms: { label: 'Communication system', chip: 'text-cyan-300 bg-cyan-950/50 border-cyan-700/50' },
  ground: { label: 'Communication system', chip: 'text-cyan-300 bg-cyan-950/50 border-cyan-700/50' },
};

const AMBER = '#F59E0B';
const CYAN = '#22D3EE';
const PANEL = '#0F172A';

const MOTORS: [number, number][] = [
  [205, 75],
  [395, 75],
  [205, 265],
  [395, 265],
];
const ESCS: [number, number][] = [
  [245, 115],
  [355, 115],
  [245, 225],
  [355, 225],
];

/** Top-down drone that builds up one part at a time. `stage` is the part being introduced. */
const DroneDiagram: React.FC<{ stage: number }> = ({ stage }) => {
  // Parts not yet introduced are hidden, the current one is bright, earlier ones are dimmed.
  const level = (n: number) => (stage < n ? 0 : stage === n ? 1 : 0.55);
  const fade = { duration: 0.4 };

  return (
    <svg
      viewBox="0 0 600 360"
      className="w-full h-auto"
      role="img"
      aria-label="Top-down diagram of the SkyBridge drone, built up from its flight hardware to its communication payload"
    >
      <motion.g initial={false} animate={{ opacity: stage === 4 ? 0.4 : 1 }} transition={fade}>
        {/* Stage 1: frame */}
        <motion.g initial={false} animate={{ opacity: level(0) }} transition={fade}>
          <line x1="285" y1="155" x2="205" y2="75" stroke={AMBER} strokeWidth="5" strokeLinecap="round" />
          <line x1="315" y1="155" x2="395" y2="75" stroke={AMBER} strokeWidth="5" strokeLinecap="round" />
          <line x1="285" y1="185" x2="205" y2="265" stroke={AMBER} strokeWidth="5" strokeLinecap="round" />
          <line x1="315" y1="185" x2="395" y2="265" stroke={AMBER} strokeWidth="5" strokeLinecap="round" />
          <rect x="270" y="140" width="60" height="60" rx="8" fill={PANEL} stroke={AMBER} strokeWidth="2" />
          <rect x="288" y="158" width="24" height="24" rx="3" fill="none" stroke={AMBER} strokeWidth="1.5" opacity="0.7" />
        </motion.g>

        {/* Stage 2: motors and ESCs */}
        <motion.g initial={false} animate={{ opacity: level(1) }} transition={fade}>
          {MOTORS.map(([x, y]) => (
            <g key={`motor-${x}-${y}`}>
              <circle cx={x} cy={y} r="38" fill={AMBER} fillOpacity="0.07" stroke={AMBER} strokeOpacity="0.4" strokeDasharray="4 4" />
              <circle cx={x} cy={y} r="13" fill={PANEL} stroke={AMBER} strokeWidth="2" />
            </g>
          ))}
          {ESCS.map(([x, y]) => (
            <rect key={`esc-${x}-${y}`} x={x - 8} y={y - 8} width="16" height="16" rx="3" fill={PANEL} stroke={AMBER} strokeWidth="1.5" />
          ))}
        </motion.g>

        {/* Stage 3: ESP32 */}
        <motion.g initial={false} animate={{ opacity: level(2) }} transition={fade}>
          <line x1="300" y1="200" x2="300" y2="208" stroke={CYAN} strokeWidth="2" />
          <rect x="268" y="208" width="64" height="34" rx="5" fill={PANEL} stroke={CYAN} strokeWidth="2" />
          <text x="300" y="229" fill={CYAN} fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            ESP32
          </text>
        </motion.g>

        {/* Stage 4: SX1278 and antenna */}
        <motion.g initial={false} animate={{ opacity: level(3) }} transition={fade}>
          <line x1="300" y1="242" x2="300" y2="252" stroke={CYAN} strokeWidth="2" />
          <rect x="276" y="252" width="48" height="22" rx="4" fill={PANEL} stroke={CYAN} strokeWidth="2" />
          <text x="300" y="267" fill={CYAN} fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            LoRa
          </text>
          <line x1="300" y1="274" x2="300" y2="318" stroke="#94A3B8" strokeWidth="1.5" />
          <circle cx="300" cy="322" r="4" fill={CYAN} />
          <path d="M 278,332 Q 300,344 322,332" fill="none" stroke={CYAN} strokeOpacity="0.6" strokeWidth="1.5" />
          <path d="M 266,338 Q 300,356 334,338" fill="none" stroke={CYAN} strokeOpacity="0.35" strokeWidth="1.5" />
        </motion.g>
      </motion.g>

      {/* Stage 5: ground nodes appear either side and link to the drone */}
      <motion.g initial={false} animate={{ opacity: stage === 4 ? 1 : 0 }} transition={fade}>
        <path d="M 100,210 Q 170,150 262,165" fill="none" stroke={CYAN} strokeWidth="2" strokeDasharray="6 5" />
        <path d="M 500,210 Q 430,150 338,165" fill="none" stroke={CYAN} strokeWidth="2" strokeDasharray="6 5" />
        {[
          { x: 20, label: 'TEAM A' },
          { x: 480, label: 'TEAM B' },
        ].map((node) => (
          <g key={node.label}>
            <rect x={node.x} y="210" width="100" height="56" rx="8" fill={PANEL} stroke={CYAN} strokeWidth="2" />
            <text x={node.x + 50} y="233" fill="#E2E8F0" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {node.label}
            </text>
            <text x={node.x + 50} y="251" fill="#94A3B8" fontSize="9" fontFamily="monospace" textAnchor="middle">
              ESP32 + SX1278
            </text>
          </g>
        ))}
      </motion.g>
    </svg>
  );
};

const SectionHeader: React.FC = () => (
  <div className="max-w-2xl">
    <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2 font-semibold">
      Inside SkyBridge
    </div>
    <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Two systems, one airframe</h2>
    <p className="hidden sm:block text-sm text-slate-400 mt-2">
      Flight hardware keeps the drone in the air. A separate communication payload carries the messages.
    </p>
  </div>
);

const Legend: React.FC = () => (
  <div className="mt-4">
    <div className="flex flex-wrap gap-4 text-[11px] font-mono text-slate-400">
      <span className="inline-flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        Flight system
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400" />
        Communication system
      </span>
    </div>
    <p className="hidden md:block mt-2 text-xs text-slate-500 max-w-xl">
      The ESP32 and LoRa module only handle messaging. The drone is flown separately by a pilot with a
      FlySky FS-i6X transmitter.
    </p>
  </div>
);

const HardwareScroll: React.FC = () => {
  const { ref, stage, progress } = useScrollStage(STAGES.length);

  return (
    <section
      ref={ref}
      id="landing-hardware-reveal"
      aria-label="Inside SkyBridge: the hardware"
      className="relative border-b border-slate-800/60 bg-slate-950/40"
      style={{ height: `${STAGES.length * 90}vh` }}
    >
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col justify-center overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-6">
          <SectionHeader />

          <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center mt-4">
            <DroneDiagram stage={stage} />

            <ol className="space-y-2">
              {STAGES.map((s, i) => {
                const active = i === stage;
                const style = SYSTEM_STYLE[s.system];
                return (
                  <motion.li
                    key={s.id}
                    initial={false}
                    animate={{ opacity: active ? 1 : i < stage ? 0.6 : 0.35 }}
                    transition={{ duration: 0.3 }}
                    className={`rounded-xl border px-4 py-3 ${
                      active ? 'border-cyan-500/50 bg-slate-900' : 'border-slate-800 bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-slate-500">0{i + 1}</span>
                      <span className="text-sm font-semibold text-slate-100">{s.title}</span>
                      <span className={`ml-auto hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded border ${style.chip}`}>
                        {style.label}
                      </span>
                    </div>
                    <motion.div
                      initial={false}
                      animate={{ height: active ? 'auto' : 0, opacity: active ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="pt-2 text-xs text-slate-400 leading-relaxed">{s.detail}</p>
                    </motion.div>
                  </motion.li>
                );
              })}
            </ol>
          </div>

          <Legend />
        </div>

        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="absolute bottom-0 left-0 right-0 h-0.5 origin-left bg-cyan-400/70"
        />
      </div>
    </section>
  );
};

/** Reduced-motion version: everything visible at once, nothing tied to scroll. */
const HardwareStatic: React.FC = () => (
  <section
    id="landing-hardware-reveal"
    aria-label="Inside SkyBridge: the hardware"
    className="py-16 px-6 border-b border-slate-800/60 bg-slate-950/40"
  >
    <div className="max-w-6xl mx-auto">
      <SectionHeader />
      <div className="grid md:grid-cols-2 gap-8 items-center mt-6">
        <DroneDiagram stage={3} />
        <ol className="space-y-3">
          {STAGES.map((s, i) => {
            const style = SYSTEM_STYLE[s.system];
            return (
              <li key={s.id} className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-500">0{i + 1}</span>
                  <span className="text-sm font-semibold text-slate-100">{s.title}</span>
                  <span className={`ml-auto text-[10px] font-mono px-2 py-0.5 rounded border ${style.chip}`}>
                    {style.label}
                  </span>
                </div>
                <p className="pt-2 text-xs text-slate-400 leading-relaxed">{s.detail}</p>
              </li>
            );
          })}
        </ol>
      </div>
      <Legend />
    </div>
  </section>
);

export const HardwareReveal: React.FC = () => {
  const reduce = useReducedMotion();
  return reduce ? <HardwareStatic /> : <HardwareScroll />;
};
