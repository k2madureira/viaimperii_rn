const API_HOST = process.env.EXPO_PUBLIC_API_HOST;
const TIMEOUT_MS = 10000;

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    return await fetch(`${API_HOST}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error('Tempo limite da requisição esgotado. Verifique sua conexão.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
