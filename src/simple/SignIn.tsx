import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

// Role each demo account signs in with
const ROLE_FOR: Record<string, string> = {
  admin: 'admin',
  'team-a': 'operator',
  'team-b': 'operator',
  observer: 'viewer',
};

export function SignIn() {
  const { login, startGuestDemo, preselectedMode } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'live' | 'demo'>(preselectedMode ?? 'demo');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    signIn();
  }

  async function signIn() {
    if (busy) return; // stop duplicate submissions
    const name = username.trim().toLowerCase();
    setBusy(true);
    setError('');
    try {
      await login({ username: name, password, claimedRole: ROLE_FOR[name] ?? 'operator', mode });
    } catch (err: any) {
      setError(err?.message || 'Could not sign in. Check your username and password.');
    } finally {
      setBusy(false);
    }
  }

  async function tryDemo() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await startGuestDemo();
    } catch (err: any) {
      setError(err?.message || 'Could not start Demo Mode.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ios-app ios-center">
      <div className="ios-signin">
        <h1 className="ios-large">SkyBridge</h1>
        <p className="ios-note">Sign in to send and receive messages.</p>

        <form onSubmit={submit} className="ios-group">
          <label className="ios-field">
            <span>Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              required
            />
          </label>
          <label className="ios-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
        </form>

        <div className="ios-seg" role="group" aria-label="Mode">
          <button type="button" aria-pressed={mode === 'demo'} onClick={() => setMode('demo')}>
            Demo
          </button>
          <button type="button" aria-pressed={mode === 'live'} onClick={() => setMode('live')}>
            Live
          </button>
        </div>
        <p className="ios-note">
          {mode === 'demo'
            ? 'Demo: practice mode. Nothing is sent by radio.'
            : 'Live: needs the radio connected. Without it, no devices will show.'}
        </p>

        {error && (
          <p role="alert" className="ios-error">
            {error}
          </p>
        )}

        <button type="button" className="ios-btn primary" disabled={busy || !username || !password} onClick={signIn}>
          {busy ? 'Signing in…' : 'Sign In'}
        </button>
        <button type="button" className="ios-btn ghost-btn" disabled={busy} onClick={tryDemo}>
          Try Demo without an account
        </button>
      </div>
    </div>
  );
}

export default SignIn;
