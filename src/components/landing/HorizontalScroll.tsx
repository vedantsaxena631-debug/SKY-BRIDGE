import React, { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';

const CARDS = [
  {
    n: '01',
    title: 'ESP32 ground nodes',
    body: 'An OLED, buttons and a buzzer let each team send and receive short messages in the field.',
  },
  {
    n: '02',
    title: '433 MHz LoRa link',
    body: 'SX1278 radios carry every packet between the ground teams and the airborne relay.',
  },
  {
    n: '03',
    title: 'Loop prevention',
    body: 'The relay keeps a cache of message IDs so a packet is never forwarded twice.',
  },
  {
    n: '04',
    title: 'ACK with retry',
    body: 'Receipts confirm delivery end to end, and messages without one are retried.',
  },
  {
    n: '05',
    title: 'USB serial gateway',
    body: 'A Node.js gateway reads the ESP32 over USB and stores each message in MongoDB.',
  },
  {
    n: '06',
    title: 'Live dashboard',
    body: 'A React front end updated over Socket.IO, with message history and device status.',
  },
];

const Card: React.FC<(typeof CARDS)[number]> = ({ n, title, body }) => (
  <article className="shrink-0 w-[78vw] sm:w-[380px] rounded-2xl border border-slate-800 bg-slate-900/80 p-7 flex flex-col justify-between min-h-[15rem]">
    <div className="font-mono text-5xl font-extrabold text-cyan-500/30">{n}</div>
    <div>
      <h3 className="text-lg font-bold text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">{body}</p>
    </div>
  </article>
);

const Heading: React.FC = () => (
  <div className="max-w-6xl mx-auto w-full px-6 mb-8">
    <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2 font-semibold">
      What is built
    </div>
    <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Six pieces, one network</h2>
  </div>
);

const HorizontalScrollMotion: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [maxX, setMaxX] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -maxX]);

  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setMaxX(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="landing-built"
      aria-label="What is built"
      className="relative border-b border-slate-800/60"
      style={{ height: '320vh' }}
    >
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col justify-center overflow-hidden">
        <Heading />
        <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-6 px-6 pr-[12vw]">
          {CARDS.map((c) => (
            <Card key={c.n} {...c} />
          ))}
        </motion.div>
        <motion.div
          aria-hidden="true"
          style={{ scaleX: scrollYProgress }}
          className="absolute bottom-0 left-0 right-0 h-0.5 origin-left bg-cyan-400/70"
        />
      </div>
    </section>
  );
};

/** Vertical scroll drives a sideways slide through the six pieces. Plain grid for reduced motion. */
export const HorizontalScroll: React.FC = () => {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <section
        id="landing-built"
        aria-label="What is built"
        className="py-16 px-6 border-b border-slate-800/60"
      >
        <div className="max-w-6xl mx-auto">
          <Heading />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
            {CARDS.map((c) => (
              <article
                key={c.n}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-2"
              >
                <div className="font-mono text-3xl font-extrabold text-cyan-500/30">{c.n}</div>
                <h3 className="text-lg font-bold text-slate-100">{c.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{c.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return <HorizontalScrollMotion />;
};
