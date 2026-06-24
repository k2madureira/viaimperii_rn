import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { registerAuthHandlers } from '../api/config/authBridge';
import { closeMissionEvents } from '../api/missions/missionEvents';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

export interface AuthUser {
  user_id: string;
  email: string;
  name: string;
  is_admin: boolean;
  is_temporary_password: boolean;
  rank: string;
  total_xp: number;
  main_specialty: string | null;
  mastery: Record<string, number>;
  legion_id: number | null;
  province_id: number | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (accessToken: string, refreshToken: string, user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
  markPasswordUpdated: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    refreshToken: null,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    async function restore() {
      try {
        const [access, refresh, userRaw] = await Promise.all([
          SecureStore.getItemAsync(ACCESS_KEY),
          SecureStore.getItemAsync(REFRESH_KEY),
          SecureStore.getItemAsync(USER_KEY),
        ]);
        if (access && refresh && userRaw) {
          setState({ accessToken: access, refreshToken: refresh, user: JSON.parse(userRaw), isLoading: false });
          return;
        }
      } catch {}
      setState(s => ({ ...s, isLoading: false }));
    }
    restore();
  }, []);

  // Liga o tokenManager (fora do React) ao estado: refresh atualiza os tokens,
  // expiração da sessão desloga e leva de volta ao login.
  useEffect(() => {
    registerAuthHandlers({
      onTokensRefreshed: (accessToken, refreshToken) => {
        setState((prev) => ({ ...prev, accessToken, refreshToken }));
      },
      onSessionExpired: () => {
        setState({ accessToken: null, refreshToken: null, user: null, isLoading: false });
      },
    });
    return () => registerAuthHandlers({});
  }, []);

  const signIn = useCallback(async (accessToken: string, refreshToken: string, user: AuthUser) => {
    const userJson = JSON.stringify(user);
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
      SecureStore.setItemAsync(USER_KEY, userJson),
    ]);
    setState({ accessToken, refreshToken, user, isLoading: false });
  }, []);

  const signOut = useCallback(async () => {
    // Encerra a sessão SSE no servidor ANTES de apagar o token (o DELETE precisa
    // do header de auth). Best-effort — não bloqueia o logout se falhar.
    await closeMissionEvents();
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    setState({ accessToken: null, refreshToken: null, user: null, isLoading: false });
  }, []);

  const markPasswordUpdated = useCallback(async () => {
    setState(prev => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, is_temporary_password: false };
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(updated));
      return { ...prev, user: updated };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, markPasswordUpdated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
