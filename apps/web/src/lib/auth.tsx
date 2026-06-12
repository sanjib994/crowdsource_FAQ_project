'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from './api';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  reputationScore: number;
  startDate: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; displayName: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      setToken(stored);
      api.auth.me()
        .then((data) => setUser(data.user || data))
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    const t = data.token;
    localStorage.setItem('token', t);
    setToken(t);
    const me = await api.auth.me();
    setUser(me.user || me);
  }, []);

  const register = useCallback(async (info: { email: string; password: string; displayName: string }) => {
    const data = await api.auth.register(info);
    const t = data.token;
    localStorage.setItem('token', t);
    setToken(t);
    const me = await api.auth.me();
    setUser(me.user || me);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
