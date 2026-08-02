import { useMutation } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import i18n from '../../../../../i18n';
import { viaimperiiApi } from '../../../../../api';
import { useAuth } from '../../../../../contexts/AuthContext';

// Fluxo web do backend: o app abre `GET {API}/auth/{provider}` no browser do sistema;
// o backend faz o OAuth (client Web + secret) e volta para o deep link abaixo com um
// código one-time, que trocamos por tokens em `POST /auth/oauth/exchange`.
const API_HOST = process.env.EXPO_PUBLIC_API_HOST;
const APP_REDIRECT = 'viaimperii://oauth';

WebBrowser.maybeCompleteAuthSession();

/** Lê um parâmetro de query de uma URL sem depender de URL/URLSearchParams (Hermes). */
function getParam(url: string, key: string): string | null {
  const match = url.match(new RegExp(`[?&]${key}=([^&#]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function useOAuth(provider: 'google' | 'github') {
  const { signIn } = useAuth();
  const [running, setRunning] = useState(false);

  const exchange = useMutation({
    mutationFn: (code: string) => viaimperiiApi.auth.oauthExchange(code),
    onSuccess: async (data) => {
      await signIn(data.access_token, data.refresh_token, {
        user_id: data.user_id,
        email: data.email,
        name: data.name,
        is_admin: data.is_admin,
        is_temporary_password: data.is_temporary_password,
        rank: data.rank,
        total_xp: data.total_xp,
        main_specialty: data.main_specialty,
        mastery: data.mastery,
        legion_id: data.legion_id,
        province_id: data.province_id,
        streak: data.streak ?? null,
      });
      Toast.show({ type: 'success', text1: i18n.t('toasts.oauthSuccess') });
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: i18n.t('toasts.oauthError', { provider: provider === 'google' ? 'Google' : 'GitHub' }),
        text2: error.message,
      });
    },
  });

  async function promptAsync() {
    if (running) return;
    setRunning(true);
    try {
      const authUrl = `${API_HOST}/auth/${provider}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, APP_REDIRECT);

      if (result.type !== 'success' || !result.url) {
        // 'cancel' / 'dismiss' → usuário fechou o browser; silencioso.
        return;
      }

      const error = getParam(result.url, 'error');
      if (error) {
        Toast.show({
          type: 'error',
          text1: i18n.t('toasts.oauthError', { provider: provider === 'google' ? 'Google' : 'GitHub' }),
          text2: error,
        });
        return;
      }

      const code = getParam(result.url, 'code');
      if (code) exchange.mutate(code);
    } finally {
      setRunning(false);
    }
  }

  return { promptAsync, disabled: running || exchange.isPending };
}

export function useGoogleAuth() {
  return useOAuth('google');
}

export function useGithubAuth() {
  return useOAuth('github');
}
