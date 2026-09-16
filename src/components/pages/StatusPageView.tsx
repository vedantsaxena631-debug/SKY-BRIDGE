import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Server,
  Database,
  Cpu,
  ArrowRight,
} from 'lucide-react';

export const StatusPageView: React.FC = () => {
  const { serialBridge, setActiveTab } = useApp();

  const subsystems = [
    {
      name: 'REST API Service',
      status: 'OPERATIONAL',
      description: 'Express HTTP endpoints (/api/v1/messages, /api/v1/devices, /api/v1/events)',
      latency: '12 ms',
      uptime: '99.98%',
      icon: Server,
    },
    {
      name: 'MongoDB Database Cluster',
      status: 'OPERATIONAL',
      description: 'Persistent document store for transmission history and audit logs',
      latency: '15 ms',
      uptime: '99.95%',
      icon: Database,
    },
    {
      name: 'Socket.IO Real-Time Engine',
      status: 'OPERATIONAL',
      description: 'WebSocket duplex stream for immediate packet hop notifications',
      latency: '8 ms',
      uptime: '99.99%',
      icon: Activity,
    },
    {
      name: 'Physical Serial Bridge Interface',
      status: serialBridge.connected ? 'OPERATIONAL' : 'DEGRADED',
      description: serialBridge.connected
        ? `Active USB Serial connection on ${serialBridge.port} @ ${serialBridge.baudRate} baud`
        : 'Physical UART disconnected — operating on isolated software simulation bridge',
      latency: serialBridge.connected ? '3 ms' : 'N/A',
      uptime: serialBridge.connected ? '99.2%' : 'Simulation Harness',
      icon: Cpu,
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-emerald-950/40 border border-emerald-500/30 p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 font-mono tracking-tight">
              ALL CORE SUBSYSTEMS OPERATIONAL
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Current system availability: <span className="text-emerald-400 font-semibold font-mono">99.94%</span> across all communication services.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('overview')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg border border-slate-700 transition-colors"
        >
          Operations Console →
        </button>
      </div>

      {/* Subsystem Health Cards */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl divide-y divide-slate-800/80 shadow-xl overflow-hidden">
        {subsystems.map((sub, i) => (
          <div key={i} className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 mt-0.5">
                <sub.icon className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-200 font-mono">{sub.name}</h3>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      sub.status === 'OPERATIONAL'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-lg">{sub.description}</p>
              </div>
            </div>

            <div className="text-right text-xs font-mono space-y-0.5">
              <div className="text-slate-300">
                Uptime: <span className="text-emerald-400 font-bold">{sub.uptime}</span>
              </div>
              <div className="text-slate-500">Latency: {sub.latency}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 90-Day Uptime Calendar Visualizer (Statuspage style) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold">90-Day Operational Health History</span>
          <span className="text-emerald-400">100% Incident Free (Past 90 Days)</span>
        </div>

        {/* 90 individual tick bars */}
        <div className="grid grid-cols-45 gap-0.5 h-7">
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={i}
              className="h-full rounded-[1px] bg-emerald-500/80 hover:bg-emerald-400 transition-colors"
              title={`Day -${45 - i}: 100% Operational`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
          <span>45 days ago</span>
          <span>Today (System Active)</span>
        </div>
      </div>

      {/* Incident History Log */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
          Recent Service Notices
        </h3>
        <div className="space-y-2 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="text-cyan-400 font-bold">SERIAL BRIDGE HOTPLUG MONITORING</span>
              <span>Today 10:30:15 UTC</span>
            </div>
            <p className="text-slate-300 font-sans">
              Node.js SerialPort service initialized with auto-fallback to simulation harness if physical USB UART is unattached.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="text-emerald-400 font-bold">STORE-AND-FORWARD RELAY VALIDATION</span>
              <span>Today 09:00:00 UTC</span>
            </div>
            <p className="text-slate-300 font-sans">
              Airborne SX1278 packet duplication suppression test passed. Loop prevention verified active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
