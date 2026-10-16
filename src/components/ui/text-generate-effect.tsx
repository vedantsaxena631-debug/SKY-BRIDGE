// NOT OFFICIAL SOURCE. Hand-written approximation of the Aceternity UI "Text Generate Effect" component,
// created because the official registry (ui.aceternity.com) was unreachable from the dev sandbox.
// Replace with the real file: npx shadcn@latest add @aceternity/<component-name> (see components.json).
// Project-specific changes live in this file; check call sites in LandingView/HardwareShowcase before overwriting.
import React, { useEffect } from 'react';
import { motion, stagger, useAnimate, useInView, useReducedMotion } from 'motion/react';
import { cn } from '@/src/lib/utils';

type Tag = 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';

export const TextGenerateEffect = ({
  words,
  className,
  as = 'div',
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  as?: Tag;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const inView = useInView(scope, { once: true, margin: '0px 0px -10% 0px' });
  const reduceMotion = useReducedMotion();
  const Wrapper = as;
  const wordsArray = words.split(' ');

  useEffect(() => {
    if (!inView || reduceMotion) return;
    animate(
      'span',
      { opacity: 1, filter: filter ? 'blur(0px)' : 'none' },
      { duration, delay: stagger(0.12) },
    );
  }, [inView, reduceMotion, animate, filter, duration]);

  return (
    <Wrapper className={cn('font-bold', className)}>
      <motion.span ref={scope} className="inline">
        {wordsArray.map((word, idx) => (
          <motion.span
            key={word + idx}
            className="inline-block"
            style={
              reduceMotion
                ? undefined
                : { opacity: 0, filter: filter ? 'blur(10px)' : 'none' }
            }
          >
            {word}
            {idx < wordsArray.length - 1 ? '\u00A0' : ''}
          </motion.span>
        ))}
      </motion.span>
    </Wrapper>
  );
};
