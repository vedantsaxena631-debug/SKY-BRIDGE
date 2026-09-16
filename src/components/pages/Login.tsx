import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, RefreshCw, Radio, Terminal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const STATUS_URL = '/api/v1/status';
const POLL_MS = 8000;

const ROLES = [
  { id: 'admin', label: 'Admin', hint: 'Devices, settings and audit log.' },
  { id: 'operator', label: 'Operator', hint: 'Sends messages for your own team only.' },
  { id: 'viewer', label: 'Viewer', hint: 'Read-only. Cannot send messages.' },
];

const NODE_LABELS: Record<string, string> = { A: 'Team A', DRONE: 'Drone relay', B: 'Team B' };

function relativeTime(iso: string | null) {
  if (!iso) return 'no contact yet';
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

interface LoginProps {
  onSuccess?: () => void;
  onOpenLanding?: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onOpenLanding }) => {
  const { login, startGuestDemo, preselectedMode } = useAuth();

  const [mode, setMode] = useState<'live' | 'demo'>(preselectedMode || 'live');
  const [role, setRole] = useState<'admin' | 'operator' | 'viewer'>('operator');
  const [username, setUsername] = useState('team-a');
  const [password, setPassword] = useState('teama123');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [status, setStatus] = useState<any>(null);
  const [statusError, setStatusError] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  // Sync preselected mode if it changes
  useEffect(() => {
    if (preselectedMode) {
      setMode(preselectedMode);
    }
  }, [preselectedMode]);

  // Live system status, polled, unauthenticated
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchStatus() {
      try {
        const res = await fetch(STATUS_URL, { signal: controller.signal });
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          setStatus(data);
          setStatusError(false);
        }
      } catch {
        if (!cancelled) setStatusError(true);
      }
    }

    fetchStatus();
    const timer = setInterval(fetchStatus, POLL_MS);
    return () => {
      cancelled = true;
      controller.abort();
      clearInterval(timer);
    };
  }, []);

  // Screen reader focus on error
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!username.trim()) errs.username = 'Enter your username.';
    if (!password) errs.password = 'Enter your password.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({ username: username.trim(), password, claimedRole: role, mode });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(
        err.code === 'NETWORK'
          ? 'Cannot reach the SkyBridge server. Check that the backend is running.'
          : err.message || 'Login failed.'
      );
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGuestDemo() {
    setError(null);
    setSubmitting(true);
    try {
      await startGuestDemo();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Could not start guest demo.');
    } finally {
      setSubmitting(false);
    }
  }

  const handleQuickFill = (u: string, p: string, r: 'admin' | 'operator' | 'viewer') => {
    setUsername(u);
    setPassword(p);
    setRole(r);
    setError(null);
  };

  const liveReady = status?.liveReady;

  return (
    <div
      id="skybridge-login-screen"
      className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-[#070A0E] text-slate-100 font-sans"
    >
      {/* ------------------------------------------------ left: system status */}
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-[#0C1017] border-r border-slate-800/80">
        <div>
          <div className="flex items-center gap-3.5 mb-2">
            <SkyBridgeMark />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SkyBridge <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">v3.0</span>
              </h1>
              <p className="text-xs text-slate-400">
                Autonomous LoRa Drone-Relay Mission Communication Network
              </p>
            </div>
          </div>
        </div>

        <section
          aria-label="Live system status"
          className="rounded-xl border border-slate-800 bg-[#111622] p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <header className="flex items-baseline justify-between mb-5">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-200">Hardware Network Status</h2>
            </div>
            <span className="text-[11px] text-emerald-400/90 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              LIVE SYSTEM
            </span>
          </header>

          {statusError ? (
            <div className="flex items-start gap-3 text-sm text-slate-300">
              <RefreshCw size={16} className="mt-0.5 shrink-0 text-amber-400 animate-spin" aria-hidden />
              <p>
                Status unavailable. Retrying every {POLL_MS / 1000} seconds.
                {status && (
                  <>
                    <br />
                    <span className="text-slate-400 text-xs">Last contact {relativeTime(status.updatedAt)}.</span>
                  </>
                )}
              </p>
            </div>
          ) : !status ? (
            <div className="space-y-3" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-6 rounded bg-slate-800/60 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <ul className="space-y-3">
                {['A', 'DRONE', 'B'].map((id) => {
                  const node = status.nodes?.[id] || { status: 'unknown', lastSeen: null };
                  return (
                    <li key={id} className="flex items-center justify-between gap-4 text-sm bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800/60">
                      <span className="flex items-center gap-2.5 font-medium text-slate-200">
                        <StatusDot status={node.status} />
                        {NODE_LABELS[id]}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        {node.status === 'online' ? relativeTime(node.lastSeen) : node.status}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-5 pt-5 border-t border-slate-800/80 space-y-2.5 text-xs font-mono">
                <Row
                  label="Serial Bridge"
                  value={status.system?.serialPort || status.system?.serialBridge?.replace('_', ' ')}
                  ok={status.system?.serialBridge === 'connected'}
                />
                <Row
                  label="Primary Datastore"
                  value={status.system?.database}
                  ok={status.system?.database === 'connected'}
                />
              </div>

              <p className="mt-4 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                <span>Telemetry sync</span>
                <span>{relativeTime(status.updatedAt)}</span>
              </p>
            </>
          )}
        </section>

        <div className="space-y-3">
          <div className="p-3.5 rounded-lg border border-slate-800 bg-[#0E141D] text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300 block mb-1">Architectural Boundary Enforcement:</span>
            Ground teams communicate over LoRa through a drone-mounted relay. Real hardware telemetry is never blended with simulation data.
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            SkyBridge Tactical Command · Port 3000 Ingress Protected
          </p>
        </div>
      </aside>

      {/* ------------------------------------------------------- right: sign in */}
      <main className="flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-md py-4">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <SkyBridgeMark />
            <h1 className="text-xl font-bold tracking-tight text-white">SkyBridge v3.0</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1.5">Sign In to SkyBridge</h2>
            <p className="text-xs text-slate-400">
              Select your session mode and the authoritative role your credentials possess.
            </p>
          </div>

          {onOpenLanding && (
            <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/40 border border-cyan-800/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">First time exploring SkyBridge?</p>
                  <p className="text-[11px] text-slate-400">Scroll through the Montfort-style drone relay story.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenLanding}
                className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-600/40 transition-colors shrink-0 cursor-pointer"
              >
                Watch Story →
              </button>
            </div>
          )}

          {/* mode selection ------------------------------------------------------------ */}
          <fieldset className="mb-6">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              1. Session Mode
            </legend>
            <div role="radiogroup" className="grid grid-cols-2 gap-3">
              {(['live', 'demo'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  id={`mode-radio-${m}`}
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={[
                    'rounded-xl border p-3.5 text-left transition-all duration-150 relative cursor-pointer',
                    mode === m
                      ? m === 'demo'
                        ? 'border-purple-500 bg-purple-950/30 ring-1 ring-purple-500/50'
                        : 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${mode === m ? (m === 'demo' ? 'text-purple-300' : 'text-emerald-300') : 'text-slate-300'}`}>
                      {m === 'live' ? 'Live Mode' : 'Demo Mode'}
                    </span>
                    {mode === m && (
                      <span className={`w-2 h-2 rounded-full ${m === 'demo' ? 'bg-purple-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                    )}
                  </div>
                  <span className="block text-xs text-slate-400 mt-1">
                    {m === 'live' ? 'Connected Hardware' : 'Isolated Simulator'}
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-2.5 text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              {mode === 'demo'
                ? 'Everything you see will be simulated and labelled Demo. Nothing touches physical radios.'
                : liveReady === false
                  ? 'No hardware detected. You can still sign in — the network will honestly show as offline until nodes report.'
                  : liveReady
                    ? `Serial bridge active${status?.system?.serialPort ? ` on ${status.system.serialPort}` : ''}.`
                    : 'Checking for connected hardware…'}
            </p>
          </fieldset>

          {/* role selection ------------------------------------------------------------ */}
          <fieldset className="mb-6">
            <legend className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              2. Claimed Account Role
            </legend>
            <div role="radiogroup" className="flex rounded-xl border border-slate-800 bg-slate-950 p-1 gap-1">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  id={`role-btn-${r.id}`}
                  aria-checked={role === r.id}
                  onClick={() => setRole(r.id as any)}
                  className={[
                    'flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer text-center',
                    role === r.id
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900',
                  ].join(' ')}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {ROLES.find((r) => r.id === role)?.hint}
            </p>
          </fieldset>

          {/* Quick Fill Preset Buttons for fast evaluation */}
          <div className="mb-5 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              Quick fill credentials:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('team-a', 'teama123', 'operator')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-300 border border-slate-700"
              >
                team-a (Operator A)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('team-b', 'teamb123', 'operator')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-amber-300 border border-slate-700"
              >
                team-b (Operator B)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123', 'admin')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-rose-300 border border-slate-700"
              >
                admin (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('observer', 'viewer123', 'viewer')}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 border border-slate-700"
              >
                observer (Viewer)
              </button>
            </div>
          </div>

          {/* credentials ----------------------------------------------------- */}
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={submitting}
                className={[
                  'w-full rounded-lg border bg-[#0F141E] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-60',
                  fieldErrors.username ? 'border-rose-500' : 'border-slate-800',
                ].join(' ')}
              />
              {fieldErrors.username && <p className="mt-1 text-xs text-rose-400">{fieldErrors.username}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={submitting}
                  className={[
                    'w-full rounded-lg border bg-[#0F141E] px-3.5 py-2.5 pr-11 text-sm text-slate-100 placeholder-slate-500',
                    'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 disabled:opacity-60',
                    fieldErrors.password ? 'border-rose-500' : 'border-slate-800',
                  ].join(' ')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-rose-400">{fieldErrors.password}</p>}
            </div>
          </div>

          {error && (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-950/30 px-3.5 py-3 text-xs text-rose-300"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-400" aria-hidden />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            id="login-submit-btn"
            className={[
              'w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition-all cursor-pointer shadow-md disabled:opacity-60',
              mode === 'demo'
                ? 'bg-purple-600 hover:bg-purple-500 focus:ring-2 focus:ring-purple-400'
                : 'bg-emerald-600 hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-400',
            ].join(' ')}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" aria-hidden />
                Authenticating Credentials...
              </span>
            ) : (
              `Sign In to ${mode === 'demo' ? 'Demo' : 'Live'} Mode`
            )}
          </button>

          <button
            type="button"
            onClick={handleGuestDemo}
            disabled={submitting}
            id="guest-demo-btn"
            className="mt-4 w-full text-xs text-slate-400 underline underline-offset-4 hover:text-slate-200 disabled:opacity-60 cursor-pointer"
          >
            Explore the demo without signing in (Guest Viewer)
          </button>
        </form>
      </main>
    </div>
  );
};

function StatusDot({ status }: { status: string }) {
  const colour =
    status === 'online' ? '#10B981' : status === 'offline' ? '#64748B' : '#F59E0B';
  return (
    <span
      className="inline-block size-2.5 rounded-full shrink-0 shadow-sm"
      style={{ backgroundColor: colour }}
      aria-hidden
    />
  );
}

function Row({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className="flex items-center gap-2 text-slate-200">
        <StatusDot status={ok ? 'online' : 'offline'} />
        {value}
      </span>
    </div>
  );
}

function SkyBridgeMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden>
      <rect width="34" height="34" rx="8" fill="#10B981" />
      <path d="M8 22c0-5.5 4-9 9-9s9 3.5 9 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="22" r="2.4" fill="white" />
      <circle cx="26" cy="22" r="2.4" fill="white" />
      <circle cx="17" cy="11" r="2.8" fill="white" />
    </svg>
  );
}

export default Login;
