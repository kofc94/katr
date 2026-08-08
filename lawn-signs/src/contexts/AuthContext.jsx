import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { Hub } from 'aws-amplify/utils';

import { isCloudConfigured } from '../config/appConfig';
import { getCurrentUser, initAuth, signOut as authSignOut } from '../services/authService';
import { getStorageMode, setStorageMode } from '../services/signsService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState(getStorageMode);

  const refresh = useCallback(async () => {
    setUser(await getCurrentUser());
  }, []);

  useEffect(() => {
    initAuth();

    let cancelled = false;
    (async () => {
      const current = await getCurrentUser();
      if (!cancelled) {
        setUser(current);
        setIsLoading(false);
      }
    })();

    // The hosted-UI redirect resolves after mount, so listen for the result
    // rather than only reading the session once.
    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      if (['signedIn', 'signedOut', 'tokenRefresh'].includes(payload.event)) {
        refresh();
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  const switchMode = useCallback((next) => {
    setStorageMode(next);
    setMode(next);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      mode,
      switchMode,
      refresh,
      signOut,
      isDemo: mode === 'demo',
      // Demo mode is deliberately usable with no account at all.
      isAuthenticated: mode === 'demo' || Boolean(user),
      cloudAvailable: isCloudConfigured
    }),
    [user, isLoading, mode, switchMode, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider');
  return ctx;
}
