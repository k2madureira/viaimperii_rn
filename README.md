# Via Imperii — App

> *"Ad gloriam."*

Aplicativo mobile de **gamificação de produtividade** inspirado na hierarquia do
Império Romano. O usuário evolui de **patente** completando **missões** e **campanhas**,
escolhe uma **trilha** de carreira, ingressa em uma **legião**, e acumula **XP**,
**maestria**, **medalhas** e **conquistas**.

> **Backend (FastAPI):** repositório separado. O app consome a API sob `/api/v1` e
> espera respostas no envelope `{ time, content }` — os dados ficam em `response.content`.

---

## Stack

- **Expo SDK 54** · React Native 0.81 · React 19 · Hermes
- **NativeWind v4** (Tailwind) — tokens de cor custom em `tailwind.config.js`
- **React Navigation** — Bottom Tabs (raiz logada) + Native Stack (`HomeStack`)
- **@tanstack/react-query** — queries/mutations com invalidação por `queryKey`
- **@tanstack/react-form** + **zod** — formulários e validação
- **i18next / react-i18next** — internacionalização (PT/EN)
- **expo-secure-store** — tokens JWT · **expo-location** — província
- **expo-image-picker** + **expo-image-manipulator** — evidência de conclusão (foto)
- **react-native-google-mobile-ads** — rewarded video (slots extras de missão)
- **react-native-svg** — ícones · **react-native-toast-message** — toasts
- **expo-dev-client** + `eas.json` (perfil `development`)

---

## Funcionalidades

- **Autenticação** JWT (access + refresh com rotação) e **OAuth2** (Google/GitHub);
  tokens em `expo-secure-store`, refresh proativo/reativo.
- **Patentes e trilhas** — 36 patentes derivadas do XP; escolha de trilha
  (Legionários/Patrícios) no Recrutamento IV; barra de progresso ciente da trilha.
- **Missões** diárias/semanais com filtros (status, especialidade, dificuldade), cota
  por janela (fuso SP) e **rewarded video** para liberar slots extras.
- **Conclusão com evidência** — missões com `proof_type` (`link`/`image`/`text`/`any`)
  abrem o modal de comprovação; imagem é comprimida e enviada ao S3 via presigned PUT.
- **Revisão de pares** — fila de validação (mesma legião, patente acima); aprovar/rejeitar
  com janela de revisão e countdown.
- **Tempo real (SSE)** — `GET /missions/events` empurra `mission_updated`/etc.; a sessão
  é encerrada no logout (`DELETE /missions/events`).
- **Legiões, províncias, maestrias, medalhas e conquistas**; estatísticas por período.
- **i18n** — Português e Inglês (detecção via `expo-localization`).

---

## Estrutura

```
src/
├── api/            # camada de acesso à API (fetch + envelope { time, content })
│   ├── config/     # apiFetch, JWT, refresh de token, bridge de auth
│   ├── missions/   # missões, revisão, eventos SSE
│   └── ...         # users, ranks, specialties, auth, ...
├── components/     # componentes compartilhados (navbar, modais, ícones SVG)
├── constants/      # game (XP por patente), admob, evidence, ...
├── contexts/       # AuthContext (sessão, signIn/signOut)
├── i18n/           # configuração + locales (pt.ts / en.ts)
├── navigation/     # RootNavigator, BottomTabs, HomeStack, ícones de navegação
├── screens/        # dashboard, missions, ranks, legions, achievements, profile, auth
└── utils/          # helpers (datas em UTC, cores de legião, ...)
```

Convenção de componente: pasta com `index.tsx` + barrel `index.ts` no diretório pai.

---

## Pré-requisitos

- Node.js LTS + npm
- **Dev client** (não Expo Go): o app usa módulos nativos
  (`react-native-google-mobile-ads`, `expo-image-picker`, `expo-image-manipulator`),
  então é preciso build com `expo-dev-client` / EAS.
- Android Studio (SDK) ou Xcode para build local, **ou** EAS Build na nuvem.

---

## Configuração

Crie um `.env` na raiz (não versionado) a partir do `.env.example`:

```bash
EXPO_PUBLIC_API_HOST=http://<ip-do-backend>:8000/api/v1
EXPO_PUBLIC_GOOGLE_CLIENT_ID=...
EXPO_PUBLIC_GITHUB_CLIENT_ID=...
```

> Use o **IP da máquina** (não `localhost`) para o dispositivo físico alcançar o backend.

---

## Rodando

```bash
npm install

# Build do dev client (necessário pelos módulos nativos)
npx expo run:android        # ou: npx expo run:ios
# alternativa na nuvem:
# eas build --profile development --platform android

# Metro (após o dev client instalado)
npm start       # limpe o cache com: npx expo start --dev-client --clear
```

Scripts disponíveis: `npm start`, `npm run android`, `npm run ios`, `npm run web`.

---

## Verificação

```bash
npx tsc --noEmit            # checagem de tipos
```

---

## Fluxo Git

`main` (produção) e `develop` (integração). Toda alteração em branch de feature
(`feat/<nome>`) → **PR para `develop`**. A cada **3 features** integradas, corta-se
**release**: merge `develop` → `main`, **tag** semver (`vX.Y.Z`) e release no GitHub.
Detalhes e regras de negócio em [`CLAUDE.md`](CLAUDE.md).
