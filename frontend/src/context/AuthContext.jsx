import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/auth.js';
import { invalidateCache, tokenStore, userStore } from '../api/http.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => userStore.get());
  const [token, setToken] = useState(() => tokenStore.get());
  const [loading, setLoading] = useState(Boolean(tokenStore.get()));

  const signOut = useCallback(() => {
    tokenStore.clear();
    userStore.clear();
    invalidateCache();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('swiftbus:unauthorized', handleUnauthorized);
    return () =>
      window.removeEventListener('swiftbus:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    let active = true;

    if (!token) {
      setLoading(false);
      return undefined;
    }

    authApi
      .me()
      .then(({ user: currentUser }) => {
        if (!active) return;
        setUser(currentUser);
        userStore.set(currentUser);
      })
      .catch(() => {
        if (active) signOut();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, signOut]);

  const completeSignIn = useCallback(({ token: nextToken, user: nextUser }) => {
    tokenStore.set(nextToken);
    userStore.set(nextUser);
    setToken(nextToken);
    setUser(nextUser);
    return nextUser;
  }, []);

  const updateUser = useCallback((nextUser) => {
    userStore.set(nextUser);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    (credentials) => authApi.login(credentials).then(completeSignIn),
    [completeSignIn]
  );

  const register = useCallback(
    (details) => authApi.register(details).then(completeSignIn),
    [completeSignIn]
  );

  const value = useMemo(
    () => ({ user, token, loading, login, register, signOut, updateUser }),
    [user, token, loading, login, register, signOut, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}
