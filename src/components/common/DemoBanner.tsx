import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { mode, toggleDemoMode, currentUser } = useApp();

  if (mode !== 'DEMO') {
    return (
      <div
        id="live-mode-banner"
        className="h-9 bg-emerald-950/30 border-b border-emerald-500/20 px-4 text-xs text-emerald-400 flex items-center justify-between no-print transition-colors"
      >
        <div className="flex items-center gap-2 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider">LIVE HARDWARE MODE</span>
          <span className="text-emerald-500/70 hidden sm:inline">— Awaiting USB Serial Connection on /dev/ttyUSB0</span>
        </div>
        {currentUser.role === 'admin' && (
          <button
            onClick={toggleDemoMode}
            className="px-2.5 py-0.5 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 rounded border border-emerald-500/30 text-[11px] font-mono transition-colors"
          >
            Switch to Demo Mode
          </button>
        )}
      </div>
    );
  }

  return (
    <aside
      id="demo-mode-persistent-banner"
      aria-label="Demo Mode Indicator"
      className="h-9 bg-[#8B5CF6]/10 dark:bg-[#A78BFA]/10 border-b border-[#8B5CF6]/30 px-4 text-xs flex items-center justify-between no-print transition-colors z-50 select-none"
    >
      <div className="flex items-center gap-2.5 font-mono">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8B5CF6] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8B5CF6]" />
        </span>
        <span className="px-1.5 py-0.5 rounded bg-[#8B5CF6] text-white font-bold font-mono text-[10px] tracking-wider uppercase">
          DEMO
        </span>
        <span className="font-bold text-[#8B5CF6] dark:text-[#A78BFA] tracking-wide">
          SIMULATED DATA (NO HARDWARE CONNECTED)
        </span>
        <span className="text-slate-500 dark:text-slate-400 hidden lg:inline text-[11px]">
          — All packets, telemetry, and link metrics are simulated in-memory.
        </span>
      </div>

      <div className="flex items-center gap-2">
        {currentUser.role === 'admin' ? (
          <button
            id="toggle-live-mode-btn"
            onClick={toggleDemoMode}
            className="px-2.5 py-0.5 bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-[#8B5CF6] dark:text-[#A78BFA] rounded border border-[#8B5CF6]/40 text-[11px] font-mono transition-colors"
          >
            Switch to Live Mode
          </button>
        ) : (
          <span className="text-slate-400 text-[10px] font-mono">Admin locked</span>
        )}
      </div>
    </aside>
  );
};
