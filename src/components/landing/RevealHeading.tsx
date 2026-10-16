import React, { useRef } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import { TextGenerateEffect } from '../ui/text-generate-effect';

/**
 * Call-site adapter for the official Aceternity TextGenerateEffect (kept as published).
 * The official component animates as soon as it mounts, so below-the-fold headings would finish
 * before anyone sees them. This mounts it when the heading scrolls into view, keeps the layout
 * reserved until then, shows plain text under prefers-reduced-motion, and exposes a real heading
 * role. Colour/size classes override the official light-theme defaults (the landing page is dark-only).
 */
export const RevealHeading: React.FC<{ words: string; id?: string }> = ({ words, id }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduceMotion = useReducedMotion();

  const sizing =
    'font-bold text-slate-100 [&>div]:mt-0! [&_div]:text-2xl! sm:[&_div]:text-3xl! [&_span]:text-slate-100!';

  return (
    <div ref={ref} id={id} role="heading" aria-level={2} aria-label={words}>
      {reduceMotion ? (
        <div className={sizing}>
          <div>
            <div className="leading-snug tracking-wide text-2xl sm:text-3xl">{words}</div>
          </div>
        </div>
      ) : inView ? (
        <div aria-hidden="true">
          <TextGenerateEffect words={words} className={sizing} />
        </div>
      ) : (
        // Invisible placeholder so the page doesn't jump when the effect mounts.
        <div aria-hidden="true" className={`${sizing} invisible`}>
          <div>
            <div className="leading-snug tracking-wide text-2xl sm:text-3xl">{words}</div>
          </div>
        </div>
      )}
    </div>
  );
};
