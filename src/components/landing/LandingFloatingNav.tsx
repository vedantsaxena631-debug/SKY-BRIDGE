import React from 'react';
import { AlertTriangle, Layers, Cpu, Target } from 'lucide-react';
import { FloatingNav } from '../ui/floating-navbar';

interface LandingFloatingNavProps {
  isAuthenticated: boolean;
  onLogin: () => void;
}

/**
 * Call-site adapter for the official Aceternity FloatingNav (src/components/ui/floating-navbar.tsx,
 * kept as published). The official component only accepts { name, link, icon } items plus a
 * built-in "Login" button with no handler, so SkyBridge behaviour is wired up from the outside:
 *  - links are in-page section anchors (SkyBridge has no router; docs/status/auth stay in the top bar)
 *  - clicks on the built-in button are delegated to the existing Sign In handler
 *  - for signed-in users that button is hidden, because "Login" would be misleading
 */
export const LandingFloatingNav: React.FC<LandingFloatingNavProps> = ({
  isAuthenticated,
  onLogin,
}) => {
  const iconClass = 'h-4 w-4 text-neutral-500 dark:text-white';
  const navItems = [
    { name: 'Problem', link: '#landing-problem', icon: <AlertTriangle className={iconClass} /> },
    { name: 'How it works', link: '#landing-architecture', icon: <Layers className={iconClass} /> },
    { name: 'Hardware', link: '#landing-hardware', icon: <Cpu className={iconClass} /> },
    { name: 'Scope', link: '#landing-scope', icon: <Target className={iconClass} /> },
  ];

  return (
    <div
      className={isAuthenticated ? '[&_button]:hidden [&_.w-px]:hidden' : undefined}
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          e.preventDefault();
          onLogin();
        }
      }}
    >
      <FloatingNav navItems={navItems} className="top-24 sm:top-[4.75rem]" />
    </div>
  );
};
