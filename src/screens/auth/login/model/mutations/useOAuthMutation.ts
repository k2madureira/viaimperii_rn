import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import i18n from '../../../../../i18n';
import { viaimperiiApi } from '../../../../../api';
import { LoginResponse } from '../../../../../api/auth';
import { useAuth } from '../../../../../contexts/AuthContext';

// Fluxo de polling: o app gera um `sid`, abre `GET {API}/auth/{provider}?sid=…` no
// browser do sistema e o backend roda o OAuth server-side, guardando o resultado por
// `sid`. O app NÃO depende de capturar o deep link `viaimperii://` — ele consulta
// `POST /auth/oauth/poll` até o resultado ficar pronto. Ver backend oauth_controller.
const API_HOST = process.env.EXPO_PUBLIC_API_HOST;
const APP_REDIRECT = 'viaimperii://oauth';
const POLL_INTERVAL_MS = 600;
const POLL_TIMEOUT_MS = 30000;

WebBrowser.maybeCompleteAuthSession();

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function pollForResult(sid: string): Promise<LoginResponse | null> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const data = await viaimperiiApi.auth.oauthPoll(sid);
    if (data) return data;
    await delay(POLL_INTERVAL_MS);
  }
  return null;
}

function useOAuth(provider: 'google' | 'github') {
  const { signIn } = useAuth();
  const [running, setRunning] = useState(false);

  function fail(text2?: string) {
    Toast.show({
      type: 'error',
      text1: i18n.t('toasts.oauthError', { provider: provider === 'google' ? 'Google' : 'GitHub' }),
      text2,
    });
  }

  async function promptAsync() {
    if (running) return;
    setRunning(true);
    try {
      const sid = Crypto.randomUUID();
      const authUrl = `${API_HOST}/auth/${provider}?sid=${sid}`;

      // Abre o browser SEM aguardar — em alguns dispositivos (Android, redirect
      // silencioso) o openAuthSessionAsync não resolve no retorno do deep link e
      // ficaria pendurado. Como o OAuth roda no servidor, consultamos o resultado
      // pelo sid EM PARALELO e fechamos o browser quando chega.
      const browserPromise = WebBrowser.openAuthSessionAsync(authUrl, APP_REDIRECT);
      browserPromise.catch(() => {});

      const data = await pollForResult(sid);

      // Fecha o browser (iOS); no Android o foco volta ao app com o signIn.
      try { WebBrowser.dismissAuthSession(); } catch {}
      try { WebBrowser.dismissBrowser(); } catch {}

      if (!data) return; // timeout / cancelado — silencioso

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
    } catch (e) {
      fail(e instanceof Error ? e.message : undefined);
    } finally {
      setRunning(false);
    }
  }

  return { promptAsync, disabled: running };
}

export function useGoogleAuth() {
  return useOAuth('google');
}

export function useGithubAuth() {
  return useOAuth('github');
}
