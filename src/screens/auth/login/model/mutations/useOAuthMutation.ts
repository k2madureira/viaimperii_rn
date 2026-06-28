import { useMutation } from '@tanstack/react-query';
import {
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
} from 'expo-auth-session';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import i18n from '../../../../../i18n';
import { oauthRequest } from '../../../../../api/auth/authApi';

const redirectUri = makeRedirectUri({ scheme: 'viaimperii' });

const GITHUB_DISCOVERY = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  userInfoEndpoint: 'https://api.github.com/user',
};

function useOAuthMutation(provider: 'google' | 'github') {
  return useMutation({
    mutationFn: (accessToken: string) => oauthRequest(provider, accessToken),
    onSuccess: () => {
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
}

export function useGoogleAuth() {
  const discovery = useAutoDiscovery('https://accounts.google.com');
  const { mutate } = useOAuthMutation('google');

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      mutate(response.authentication.accessToken);
    } else if (response?.type === 'error') {
      Toast.show({ type: 'error', text1: i18n.t('toasts.oauthGoogleCancelled') });
    }
  }, [response]);

  return { promptAsync, disabled: !request };
}

export function useGithubAuth() {
  const { mutate } = useOAuthMutation('github');

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID!,
      redirectUri,
      scopes: ['user:email', 'read:user'],
    },
    GITHUB_DISCOVERY,
  );

  useEffect(() => {
    if (response?.type === 'success' && response.params?.code) {
      mutate(response.params.code);
    } else if (response?.type === 'error') {
      Toast.show({ type: 'error', text1: i18n.t('toasts.oauthGithubCancelled') });
    }
  }, [response]);

  return { promptAsync, disabled: !request };
}
