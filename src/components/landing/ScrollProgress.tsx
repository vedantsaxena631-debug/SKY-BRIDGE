import React from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

/** Thin gradient bar fixed to the top of the screen that fills as the page scrolls. */
export const ScrollProgress: React.FC = () => {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-50 bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400"
    />
  );
};
