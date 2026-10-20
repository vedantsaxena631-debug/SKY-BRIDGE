import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ScrollCinematic } from '../landing/ScrollCinematic';
import { Reveal } from '../landing/Reveal';
import { HardwareReveal } from '../landing/HardwareReveal';
import { HowItWorks } from '../landing/HowItWorks';
import { DashboardPreview } from '../landing/DashboardPreview';
import { MissionClosing } from '../landing/MissionClosing';
import {
  Radio,
  ArrowRight,
  WifiOff,
  Server,
  CheckCircle2,
  Clock,
  LogIn,
} from 'lucide-react';

const PROBLEMS = [
  {
    Icon: WifiOff,
    tone: 'text-rose-400',
    title: 'Cellular Blackouts',
    body: 'Base stations lose power, backhaul fiber lines sever, and cell towers collapse, leaving ground teams isolated without basic messaging.',
  },
  {
    Icon: MountainIcon,
    tone: 'text-amber-400',
    title: 'Line-of-Sight Blockage',
    body: 'Rugged ridges, collapsed buildings, and dense canopy obstruct UHF/VHF handheld radios from reaching forward headquarters.',
  },
  {
    Icon: Server,
    tone: 'text-cyan-400',
    title: 'Lack of Central Coordination',
    body: 'Commanders cannot maintain an auditable timeline of tactical sitreps, triage needs, or victim discoveries without a digital log.',
  },
];

export const LandingView: React.FC = () => {
  const { setActiveTab } = useApp();
  const { isAuthenticated, startGuestDemo } = useAuth();

  const handleLaunchConsole = async () => {
    if (!isAuthenticated) {
      try {
        await startGuestDemo();
        setActiveTab('overview');
      } catch {
        setActiveTab('login');
      }
    } else {
      setActiveTab('overview');
    }
  };

  const handleOpenLogin = () => {
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Public Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-30 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Radio className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-mono font-bold tracking-tight text-lg text-slate-100">
            SKYBRIDGE
          </span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            MERN + LoRa
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('docs')}
            className="text-xs text-slate-400 hover:text-slate-200 hidden sm:block transition-colors cursor-pointer"
          >
            Architecture Docs
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className="text-xs text-slate-400 hover:text-slate-200 hidden sm:block transition-colors cursor-pointer"
          >
            System Status
          </button>
          {!isAuthenticated && (
            <button
              onClick={handleOpenLogin}
              className="text-xs text-cyan-400 hover:text-cyan-300 px-3 py-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
          <button
            onClick={handleLaunchConsole}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center gap-1.5 cursor-pointer"
          >
            <span>{isAuthenticated ? 'Return to Console' : 'Launch Demo Console'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* 1. Scroll-Cinematic Pinned Hero Sequence (opening, the problem, the drone bridge) */}
      <ScrollCinematic />

      {/* Anchor for keyboard skip link */}
      <div id="landing-content-start" className="scroll-mt-16" />

      {/* 2. The Problem Statement */}
      <section className="py-16 px-6 border-b border-slate-800/60 max-w-5xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono text-rose-400 uppercase tracking-wider mb-2 font-semibold">
            Operational Challenge
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Infrastructure Failure in Disaster Zones
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            In earthquakes, flash floods, landslides, and remote wilderness search operations, traditional communications crumble within minutes.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROBLEMS.map(({ Icon, tone, title, body }, i) => (
            <Reveal key={title} delay={i * 0.1} className="h-full">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 h-full">
                <Icon className={`w-6 h-6 ${tone} mb-3`} />
                <h3 className="text-sm font-semibold text-slate-200 mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3. Hardware reveal: flight system vs communication system */}
      <HardwareReveal />

      {/* 4. How it works: scroll-driven architecture walkthrough */}
      <HowItWorks />

      {/* 5. Interactive dashboard preview */}
      <DashboardPreview onLaunch={handleLaunchConsole} isAuthenticated={isAuthenticated} />

      {/* 6. Honest Scope vs Future Scope */}
      <section className="py-16 px-6 border-b border-slate-800/60 max-w-5xl mx-auto">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-2 font-semibold">
            Engineering Integrity
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Current Physical Scope vs. Future Scope
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Per the SkyBridge Ground Truth: we never invent hardware capability or simulate fake GPS/telemetry.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Implemented Current Scope */}
          <Reveal className="h-full">
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4 h-full">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>CURRENT HARDWARE & MERN STACK</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>ESP32 Microcontrollers</strong> running 433 MHz SX1278 LoRa SPI transceivers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>F450 Quadcopter Drone</strong> with manual FlySky FS-i6X RC control (independent from comms)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Node.js Serial Gateway</strong> interfacing USB UART to Socket.IO & MongoDB</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Loop Prevention:</strong> unique msgID de-duplication cache in relay firmware</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>ACK Protocol:</strong> full end-to-end receipt confirmation with retry logic</span>
                </li>
              </ul>
            </div>
          </Reveal>

          {/* Explicit Future Scope */}
          <Reveal delay={0.1} className="h-full">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 h-full">
              <div className="flex items-center gap-2 text-slate-400 font-mono text-sm font-bold">
                <Clock className="w-5 h-5" />
                <span>FUTURE EXTENSIONS (OUT OF CURRENT SCOPE)</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 font-bold">•</span>
                  <span><strong>GPS Geolocation:</strong> NMEA UART modules on ground nodes for map plotting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 font-bold">•</span>
                  <span><strong>Live FPV Video / Camera:</strong> Airborne Raspberry Pi streaming payload</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 font-bold">•</span>
                  <span><strong>Autonomous Flight:</strong> ArduPilot waypoint patrol and auto-hover station-keeping</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 font-bold">•</span>
                  <span><strong>LoRaWAN Gateways:</strong> Integration with The Things Network (TTN) or ChirpStack</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-500 font-bold">•</span>
                  <span><strong>Multi-Team Mesh:</strong> Ad-hoc AODV routing beyond two ground teams</span>
                </li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 7. Mission closing */}
      <MissionClosing
        onLaunch={handleLaunchConsole}
        onDocs={() => setActiveTab('docs')}
        isAuthenticated={isAuthenticated}
      />

      {/* Footer */}
      <footer className="mt-auto py-8 px-6 border-t border-slate-800 bg-slate-950">
        <div className="text-[11px] font-mono text-slate-400 flex flex-wrap justify-between items-center gap-2 max-w-4xl mx-auto">
          <span>SkyBridge Emergency Communication Network v2.0</span>
          <button
            onClick={() => setActiveTab('status')}
            className="hover:text-slate-200 transition-colors cursor-pointer"
          >
            System Status
          </button>
          <span>MERN Stack + ESP32 / SX1278 Hardware Reference</span>
        </div>
      </footer>
    </div>
  );
};

function MountainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
