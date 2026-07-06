import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, clearSession, getStoredUser, saveSession } from './api';
import type { LoginResponse, SessionUser } from './types';
import { registerForPushNotifications, unregisterPushToken } from './push';

interface AuthState {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On launch: restore the stored user, then validate the token against the
  // server. An invalid/expired token drops back to the login screen.
  useEffect(() => {
    (async () => {
      try {
        const stored = await getStoredUser<SessionUser>();
        if (stored) {
          setUser(stored);
          try {
            const fresh = await api<{ user: SessionUser }>('/api/mobile/auth/session');
            setUser(fresh.user);
          } catch {
            await clearSession();
            setUser(null);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<LoginResponse>('/api/mobile/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    await saveSession(res.token, res.cookieName, res.user);
    setUser(res.user);
    // Fire-and-forget: no-op in Expo Go / simulators without push support.
    registerForPushNotifications().catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    await unregisterPushToken().catch(() => {});
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
