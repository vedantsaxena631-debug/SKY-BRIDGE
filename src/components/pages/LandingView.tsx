import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  ArrowRight,
  Shield,
  WifiOff,
  Plane,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Terminal,
  Clock,
  ChevronRight,
  Lock,
} from 'lucide-react';

export const LandingView: React.FC = () => {
  const { setActiveTab, toggleDemoMode, mode } = useApp();

  const handleLaunchDemo = () => {
    setActiveTab('overview');
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
            className="text-xs text-slate-400 hover:text-slate-200 hidden sm:block transition-colors"
          >
            Architecture Docs
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className="text-xs text-slate-400 hover:text-slate-200 hidden sm:block transition-colors"
          >
            System Status
          </button>
          <button
            onClick={handleLaunchDemo}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center gap-1.5"
          >
            <span>Launch Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <header className="relative pt-16 pb-20 px-6 border-b border-slate-800/80 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Drone-Relay Emergency Communication Network</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-100 leading-tight">
              Communication shouldn't stop when infrastructure does.
            </h1>

            <p className="text-base text-slate-400 max-w-xl leading-relaxed">
              SkyBridge deploys a drone-mounted ESP32 and SX1278 LoRa payload to bridge isolated search-and-rescue teams over difficult topography — operating entirely independently of cellular, satellite, and Wi-Fi networks.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-explore-platform-btn"
                onClick={handleLaunchDemo}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2"
              >
                <span>Explore Operations Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('docs')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium text-sm transition-colors"
              >
                View Architecture Specification
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Zero Cellular Dependency
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                433 MHz SX1278 LoRa
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Store-and-Forward Logic
              </span>
            </div>
          </div>

          {/* Hero Visual: Subtle LoRa Relay Diagram with Loop Animation */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                  Physical Link Simulation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  DEMO HARNESS
                </span>
              </div>

              {/* Topology Animation Diagram */}
              <div className="relative py-8 flex flex-col items-center gap-8">
                {/* Aerial Drone Node */}
                <div className="p-4 rounded-xl bg-slate-950 border-2 border-cyan-500/60 text-center w-48 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.2 bg-cyan-500 text-slate-950 text-[9px] font-mono font-bold rounded">
                    AIRBORNE RELAY
                  </div>
                  <Plane className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-200">DRONE PAYLOAD</div>
                  <div className="text-[10px] font-mono text-slate-400">ESP32 + SX1278 (433MHz)</div>
                </div>

                {/* Ground Nodes */}
                <div className="w-full flex items-center justify-between gap-4">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center flex-1">
                    <Radio className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <div className="text-xs font-bold text-slate-200">TEAM A</div>
                    <div className="text-[10px] font-mono text-slate-400">Ground Base</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-cyan-400 animate-pulse">
                      LoRa RF 433MHz
                    </span>
                    <span className="text-[10px] text-slate-400">Store & Forward</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-center flex-1">
                    <Radio className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <div className="text-xs font-bold text-slate-200">TEAM B</div>
                    <div className="text-[10px] font-mono text-slate-400">Search Team</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Packet De-duplication:</span>
                <span className="text-emerald-400 font-semibold">Unique msgID Check</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. The Problem Statement */}
      <section className="py-16 px-6 border-b border-slate-800/60 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-mono text-rose-400 uppercase tracking-wider mb-2 font-semibold">
            Operational Challenge
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Infrastructure Failure in Disaster Zones
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            In earthquakes, flash floods, landslides, and remote wilderness search operations, traditional communications crumble within minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <WifiOff className="w-6 h-6 text-rose-400 mb-3" />
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Cellular Blackouts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Base stations lose power, backhaul fiber lines sever, and cell towers collapse, leaving ground teams isolated without basic messaging.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <MountainIcon className="w-6 h-6 text-amber-400 mb-3" />
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Line-of-Sight Blockage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rugged ridges, collapsed buildings, and dense canopy obstruct UHF/VHF handheld radios from reaching forward headquarters.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <Server className="w-6 h-6 text-cyan-400 mb-3" />
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Lack of Central Coordination</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Commanders cannot maintain an auditable timeline of tactical sitreps, triage needs, or victim discoveries without a digital log.
            </p>
          </div>
        </div>
      </section>

      {/* 3. How SkyBridge Works */}
      <section className="py-16 px-6 border-b border-slate-800/60 bg-slate-950/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2 font-semibold">
              The Architecture
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Airborne Store-and-Forward LoRa
            </h2>
            <p className="text-sm text-slate-400 mt-3">
              By hoisting a low-power LoRa repeater into the air aboard an F450 quadcopter, SkyBridge establishes an elevated radio horizon above terrain obstacles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-cyan-400 font-bold">STEP 01</div>
              <h4 className="text-sm font-semibold text-slate-200">Ground Input</h4>
              <p className="text-xs text-slate-400">
                Team A selects a priority template (e.g. "VICTIM FOUND") or drafts a short packet on their ESP32 console.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-cyan-400 font-bold">STEP 02</div>
              <h4 className="text-sm font-semibold text-slate-200">LoRa Uplink</h4>
              <p className="text-xs text-slate-400">
                SX1278 transmits the formatted JSON packet over 433 MHz with a unique <code className="text-cyan-300">msgID</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-cyan-400 font-bold">STEP 03</div>
              <h4 className="text-sm font-semibold text-slate-200">Airborne Repeat</h4>
              <p className="text-xs text-slate-400">
                The drone payload verifies the ID against its cache to prevent loops, buffers the packet, and re-broadcasts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs font-mono text-cyan-400 font-bold">STEP 04</div>
              <h4 className="text-sm font-semibold text-slate-200">Delivery & ACK</h4>
              <p className="text-xs text-slate-400">
                Team B receives the alert on their OLED display and buzzer, and returns an automated verification ACK.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Honest Scope vs Future Scope */}
      <section className="py-16 px-6 border-b border-slate-800/60 max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-mono text-purple-400 uppercase tracking-wider mb-2 font-semibold">
            Engineering Integrity
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Current Physical Scope vs. Future Scope
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Per the SkyBridge Ground Truth: we never invent hardware capability or simulate fake GPS/telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Implemented Current Scope */}
          <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-4">
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

          {/* Explicit Future Scope */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
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
        </div>
      </section>

      {/* 5. Call to Action Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-slate-800 bg-slate-950 text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-slate-100">Ready to inspect the network?</h3>
          <p className="text-xs text-slate-400">
            Access the live operations console with interactive packet transmission, SITREP reporting, and diagnostic tests.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleLaunchDemo}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2"
            >
              <span>Launch Operations Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono"
            >
              Check System Status
            </button>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 pt-6 border-t border-slate-900 flex flex-wrap justify-between items-center max-w-4xl mx-auto">
          <span>SkyBridge Emergency Communication Network v2.0</span>
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
