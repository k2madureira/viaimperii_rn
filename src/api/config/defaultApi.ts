import * as SecureStore from 'expo-secure-store';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;
const TIMEOUT_MS = 10000;

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const accessToken = await SecureStore.getItemAsync('access_token');

  try {
    const response = await fetch(`${API_HOST}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
      signal: controller.signal,
    });

    return response;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Tempo limite da requisição esgotado. Verifique sua conexão.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
