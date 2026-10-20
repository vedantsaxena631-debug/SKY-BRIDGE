import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useScrollStage } from '../../hooks/useScrollStage';

type NodeId = 'a' | 'drone' | 'b' | 'gateway' | 'dashboard';
type Point = [number, number];

interface Step {
  id: string;
  title: string;
  body: string;
  nodes: NodeId[];
  links: string[];
}

const STEPS: Step[] = [
  {
    id: 'create',
    title: 'Message creation',
    body: 'Team A picks a priority template or writes a short message on the ESP32 console.',
    nodes: ['a'],
    links: [],
  },
  {
    id: 'uplink',
    title: 'LoRa transmission',
    body: 'The SX1278 sends the message over 433 MHz as a packet with a unique message ID.',
    nodes: ['a', 'drone'],
    links: ['a-drone'],
  },
  {
    id: 'relay',
    title: 'Relay processing',
    body: 'The drone payload checks the ID against its cache to avoid loops, buffers the packet and re-broadcasts it.',
    nodes: ['drone'],
    links: [],
  },
  {
    id: 'receive',
    title: 'Destination reception',
    body: 'Team B receives the message on its OLED and buzzer, and sends back an acknowledgement.',
    nodes: ['drone', 'b'],
    links: ['drone-b'],
  },
  {
    id: 'dashboard',
    title: 'Dashboard update',
    body: 'When a ground node is connected over USB, the Node.js gateway stores the message in MongoDB and pushes it to the dashboard over Socket.IO.',
    nodes: ['b', 'gateway', 'dashboard'],
    links: ['b-gateway', 'gateway-dashboard'],
  },
];

const NODES: Record<NodeId, { x: number; y: number; w: number; h: number; title: string; sub: string }> = {
  a: { x: 20, y: 70, w: 130, h: 70, title: 'TEAM A', sub: 'ESP32 + SX1278' },
  drone: { x: 255, y: 30, w: 130, h: 70, title: 'DRONE RELAY', sub: 'ESP32 + SX1278' },
  b: { x: 490, y: 70, w: 130, h: 70, title: 'TEAM B', sub: 'ESP32 + SX1278' },
  gateway: { x: 490, y: 240, w: 130, h: 60, title: 'GATEWAY', sub: 'Node.js + MongoDB' },
  dashboard: { x: 255, y: 240, w: 130, h: 60, title: 'DASHBOARD', sub: 'React web app' },
};

const LINKS: {
  id: string;
  from: Point;
  to: Point;
  label: string;
  labelAt: Point;
  anchor: 'start' | 'middle' | 'end';
}[] = [
  { id: 'a-drone', from: [150, 105], to: [255, 65], label: 'LoRa', labelAt: [190, 74], anchor: 'middle' },
  { id: 'drone-b', from: [385, 65], to: [490, 105], label: 'LoRa', labelAt: [448, 74], anchor: 'middle' },
  { id: 'b-gateway', from: [555, 140], to: [555, 240], label: 'USB serial', labelAt: [565, 195], anchor: 'start' },
  { id: 'gateway-dashboard', from: [490, 270], to: [385, 270], label: 'Socket.IO', labelAt: [437, 260], anchor: 'middle' },
];

const Packet: React.FC<{ from: Point; to: Point }> = ({ from, to }) => (
  <motion.circle
    r={5}
    fill="#67E8F9"
    initial={{ cx: from[0], cy: from[1], opacity: 0 }}
    animate={{ cx: [from[0], to[0]], cy: [from[1], to[1]], opacity: [0, 1, 1, 0] }}
    transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
  />
);

const ArchitectureDiagram: React.FC<{ step: Step; showAll?: boolean }> = ({ step, showAll = false }) => {
  const nodeOn = (id: NodeId) => showAll || step.nodes.includes(id);
  const linkOn = (id: string) => showAll || step.links.includes(id);

  return (
    <svg
      viewBox="0 0 640 330"
      className="w-full h-auto"
      role="img"
      aria-label="Architecture diagram: Team A, the drone relay and Team B linked over LoRa, then a USB serial gateway feeding the web dashboard"
    >
      {LINKS.map((l) => {
        const on = linkOn(l.id);
        return (
          <g key={l.id}>
            <motion.line
              x1={l.from[0]}
              y1={l.from[1]}
              x2={l.to[0]}
              y2={l.to[1]}
              strokeWidth={2.5}
              strokeDasharray="6 5"
              strokeLinecap="round"
              initial={false}
              animate={{ stroke: on ? '#22D3EE' : '#334155', opacity: on ? 1 : 0.6 }}
              transition={{ duration: 0.4 }}
            />
            <text
              x={l.labelAt[0]}
              y={l.labelAt[1]}
              textAnchor={l.anchor}
              fontSize="11"
              fontFamily="monospace"
              fill={on ? '#67E8F9' : '#64748B'}
            >
              {l.label}
            </text>
            {on && !showAll && <Packet from={l.from} to={l.to} />}
          </g>
        );
      })}

      {(Object.keys(NODES) as NodeId[]).map((id) => {
        const n = NODES[id];
        const on = nodeOn(id);
        return (
          <g key={id}>
            <motion.rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              rx={10}
              fill="#0F172A"
              strokeWidth={2}
              initial={false}
              animate={{ stroke: on ? '#22D3EE' : '#334155', opacity: on ? 1 : 0.55 }}
              transition={{ duration: 0.4 }}
            />
            <text
              x={n.x + n.w / 2}
              y={n.y + n.h / 2 - 4}
              textAnchor="middle"
              fontSize="13"
              fontWeight="bold"
              fontFamily="monospace"
              fill={on ? '#E2E8F0' : '#64748B'}
            >
              {n.title}
            </text>
            <text
              x={n.x + n.w / 2}
              y={n.y + n.h / 2 + 14}
              textAnchor="middle"
              fontSize="10"
              fontFamily="monospace"
              fill="#64748B"
            >
              {n.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const SectionHeader: React.FC = () => (
  <div>
    <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2 font-semibold">
      The Architecture
    </div>
    <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Airborne store-and-forward LoRa</h2>
  </div>
);

const HowItWorksScroll: React.FC = () => {
  const { ref, stage, progress } = useScrollStage(STEPS.length);
  const step = STEPS[stage];

  return (
    <section
      ref={ref}
      id="landing-architecture"
      aria-label="How SkyBridge works"
      className="relative border-b border-slate-800/60"
      style={{ height: `${STEPS.length * 100}vh` }}
    >
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        <div className="max-w-6xl mx-auto w-full px-6 grid md:grid-cols-2 gap-6 md:gap-12 items-center">
          <div className="space-y-5">
            <SectionHeader />
            <div className="font-mono text-xs text-slate-500">
              STEP 0{stage + 1} / 0{STEPS.length}
            </div>
            <div className="min-h-[7.5rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-100">{step.title}</h3>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-md">{step.body}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex gap-1.5" aria-hidden="true">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1 w-8 rounded-full transition-colors duration-300 ${
                    i <= stage ? 'bg-cyan-400' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <ArchitectureDiagram step={step} />
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

/** Reduced-motion version: all five steps listed, diagram fully lit and still. */
const HowItWorksStatic: React.FC = () => (
  <section
    id="landing-architecture"
    aria-label="How SkyBridge works"
    className="py-16 px-6 border-b border-slate-800/60"
  >
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start">
      <div className="space-y-5">
        <SectionHeader />
        <ol className="space-y-3">
          {STEPS.map((s, i) => (
            <li key={s.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-xs font-mono text-cyan-400 font-bold">STEP 0{i + 1}</div>
              <h3 className="text-sm font-semibold text-slate-100 mt-1">{s.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
      <ArchitectureDiagram step={STEPS[STEPS.length - 1]} showAll />
    </div>
  </section>
);

export const HowItWorks: React.FC = () => {
  const reduce = useReducedMotion();
  return reduce ? <HowItWorksStatic /> : <HowItWorksScroll />;
};
