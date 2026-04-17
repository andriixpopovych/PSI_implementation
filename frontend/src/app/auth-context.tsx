import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  demoAccounts,
  getSessionUser,
  login,
  logout,
} from '@/features/stay-smart/lib/api';
import type { SessionUser } from '@/features/stay-smart/lib/api-types';

type DemoAccountKey = keyof typeof demoAccounts;

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  loginAs: (account: DemoAccountKey) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getSessionUser()
      .then((response) => {
        if (!cancelled) {
          setUser(response.user);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    async loginAs(account) {
      const credentials = demoAccounts[account];
      const response = await login(credentials.email, credentials.password);
      setUser(response.user);
    },
    async signOut() {
      await logout();
      setUser(null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
