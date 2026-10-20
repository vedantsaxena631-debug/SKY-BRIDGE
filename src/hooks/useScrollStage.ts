import { useRef, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'motion/react';

/**
 * Maps the scroll position through a tall section to a discrete stage index.
 *
 * Attach `ref` to a section that is `count * N vh` tall and holds a
 * `position: sticky` viewport. `stage` runs from 0 to count - 1 as the
 * visitor scrolls through it, and `progress` is the raw 0..1 value.
 */
export function useScrollStage(count: number) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const [stage, setStage] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(p * count)));
    setStage((prev) => (prev === next ? prev : next));
  });

  return { ref, stage, progress: scrollYProgress };
}
