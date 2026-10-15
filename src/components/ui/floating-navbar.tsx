// Aceternity UI "Floating Navbar" (https://ui.aceternity.com/components/floating-navbar)
// Adapted for SkyBridge: no Next.js <Link> (the app switches views via state, not routes),
// an `actions` slot for the auth/launch buttons, always visible at the top of the page,
// hides on scroll down / reveals on scroll up, keyboard + reduced-motion safe.
import React, { useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react';
import { cn } from '@/src/lib/utils';

export type FloatingNavItem = {
  name: string;
  onClick: () => void;
  icon?: React.ReactNode;
  /** Hide this item on very small screens (the original nav did this for text links). */
  hideOnMobile?: boolean;
};

export const FloatingNav = ({
  brand,
  navItems,
  actions,
  className,
}: {
  brand?: React.ReactNode;
  navItems: FloatingNavItem[];
  actions?: React.ReactNode;
  className?: string;
}) => {
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollY, 'change', (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (current < 80) {
      setVisible(true); // always shown at the very top of the page
    } else if (current < previous) {
      setVisible(true); // scrolling up
    } else if (current > previous) {
      setVisible(false); // scrolling down
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.nav
        aria-label="Primary"
        initial={{ opacity: 0, y: reduceMotion ? 0 : -100 }}
        animate={{ opacity: visible ? 1 : 0, y: visible || reduceMotion ? 0 : -100 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        // Hidden state must not be tabbable / clickable.
        inert={!visible}
        onFocusCapture={() => setVisible(true)}
        className={cn(
          'fixed top-3 inset-x-0 mx-auto z-40 w-[calc(100%-1.5rem)] max-w-4xl',
          'flex items-center justify-between gap-3 rounded-full',
          'border border-slate-700/70 bg-slate-950/80 backdrop-blur-md',
          'shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]',
          'pl-4 pr-2 py-2',
          !visible && 'pointer-events-none',
          className,
        )}
      >
        {brand}

        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={item.onClick}
              className={cn(
                'items-center gap-1 rounded-full px-3 py-1.5 text-xs text-slate-400 hover:text-slate-100 transition-colors cursor-pointer',
                item.hideOnMobile ? 'hidden sm:flex' : 'flex',
              )}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
          {actions}
        </div>
      </motion.nav>
    </AnimatePresence>
  );
};
