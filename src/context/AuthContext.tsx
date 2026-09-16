import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'operator' | 'viewer';
  team: 'A' | 'B' | null;
  name?: string;
  callsign?: string;
}

export interface SessionData {
  token: string;
  user: AuthUser;
  mode: 'live' | 'demo';
  guest?: boolean;
}

export interface AuthContextType {
  session: SessionData | null;
  user: AuthUser | null;
  mode: 'live' | 'demo' | null;
  isDemo: boolean;
  isAuthenticated: boolean;
  restoring: boolean;
  login: (creds: { username: string; password: string; claimedRole: string; mode: string }) => Promise<SessionData>;
  logout: () => Promise<void>;
  startGuestDemo: () => Promise<SessionData>;
  canSend: boolean;
  sendsAsTeam: 'A' | 'B' | null;
  switchModeViaLogout: (newMode: 'live' | 'demo') => void;
  preselectedMode: 'live' | 'demo';
  setPreselectedMode: (mode: 'live' | 'demo') => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = 'skybridge.session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionData | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [preselectedMode, setPreselectedMode] = useState<'live' | 'demo'>('live');

  // Restore an existing session on page load and verify it with the server
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setRestoring(false);
      return;
    }
    let parsed: SessionData;
    try {
      parsed = JSON.parse(saved);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setRestoring(false);
      return;
    }

    api.setToken(parsed.token);
    api
      .get('/auth/me')
      .then((data: any) => {
        setSession({ ...parsed, user: data.user, mode: data.mode });
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        api.setToken(null);
      })
      .finally(() => setRestoring(false));
  }, []);

  const login = useCallback(async ({ username, password, claimedRole, mode }: { username: string; password: string; claimedRole: string; mode: string }) => {
    const data = await api.post('/auth/login', { username, password, claimedRole, mode });
    const next: SessionData = { token: data.token, user: data.user, mode: data.mode };
    api.setToken(data.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    return next;
  }, []);

  const startGuestDemo = useCallback(async () => {
    const data = await api.post('/auth/guest-demo', {});
    const next: SessionData = { token: data.token, user: data.user, mode: 'demo', guest: true };
    api.setToken(data.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      // Signing out locally must work even if server is unreachable
    }
    localStorage.removeItem(STORAGE_KEY);
    api.setToken(null);
    setSession(null);
  }, []);

  const switchModeViaLogout = useCallback(
    (newMode: 'live' | 'demo') => {
      setPreselectedMode(newMode);
      logout();
    },
    [logout]
  );

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    mode: session?.mode ?? null,
    isDemo: session?.mode === 'demo',
    isAuthenticated: Boolean(session),
    restoring,
    login,
    logout,
    startGuestDemo,
    canSend: session?.user?.role === 'operator' || session?.user?.role === 'admin',
    sendsAsTeam: session?.user?.role === 'operator' ? session.user.team : null,
    switchModeViaLogout,
    preselectedMode,
    setPreselectedMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
