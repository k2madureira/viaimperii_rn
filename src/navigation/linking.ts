import { LinkingOptions } from '@react-navigation/native';

// Scheme do app (app.json → "scheme": "viaimperii"). Usado no fallback e como
// prefixo de deep-link app-para-app.
export const APP_SCHEME_PREFIX = 'viaimperii://';

// Origem pública que serve as páginas de share (raiz do site, SEM /api/v1) — a
// mesma do backend (`SHARE_BASE_URL`). Prioriza `EXPO_PUBLIC_SHARE_BASE_URL`;
// senão deriva do API host removendo o sufixo `/api/v1`.
//   dev:  EXPO_PUBLIC_API_HOST=http://host:8000/api/v1  → http://host:8000
//   prod: defina EXPO_PUBLIC_SHARE_BASE_URL=https://<dominio> (= SHARE_BASE_URL do back)
const API_HOST = process.env.EXPO_PUBLIC_API_HOST ?? '';
export const SHARE_BASE_URL = (
  process.env.EXPO_PUBLIC_SHARE_BASE_URL ?? API_HOST.replace(/\/api\/v1\/?$/, '')
).replace(/\/$/, '');

// Link de compartilhamento de um post: a página HTML pública (Open Graph) do
// backend. Ela gera o card rico nos apps de chat e, no browser, redireciona pro
// app (viaimperii://post/{id}) ou pro fallback. É o que deve ser compartilhado —
// nunca o scheme cru, que não renderiza card.
export function postShareUrl(postId: number): string {
  return `${SHARE_BASE_URL}/post/${postId}`;
}

// Deep-linking do app (roteia a URL para a tela). PARQUEADO — não está plugado no
// NavigationContainer: com a base https nos `prefixes` causava ANR (React Navigation
// reprocessando URL em toda navegação). Reativar na task #13 com SÓ o scheme
// (`viaimperii://`), sem a origem https, e teste em device. A árvore reflete a
// navegação real: BottomTabs → aba "Home" (HomeStack) → PostDetail.
// Observação: `postId` chega como string na URL — a tela faz Number(...).
export const linking: LinkingOptions<any> = {
  prefixes: [APP_SCHEME_PREFIX, ...(SHARE_BASE_URL ? [SHARE_BASE_URL] : [])],
  config: {
    screens: {
      Home: {
        screens: {
          PostDetail: 'post/:postId',
        },
      },
    },
  },
};
