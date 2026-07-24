# 00 — Arquitetura de Navegação

Referência da estrutura de navegadores, param lists e regras de gating.
Arquivos-fonte: `src/navigation/`, `App.tsx`, `src/contexts/AuthContext.tsx`.

---

## Camadas

1. **`App.tsx`**
   - Renderiza `SplashScreen` por ~2s (estado `splashDone`), depois monta o
     `NavigationContainer` com o `RootNavigator`.
   - Provê `QueryClientProvider`, `AuthProvider`, `SafeAreaProvider`, `Toast`.

2. **`RootNavigator`** (`src/navigation/RootNavigator.tsx`)
   - Lê `accessToken` + `isLoading` do `useAuth()`.
   - `isLoading` → spinner central.
   - `accessToken` presente → **`BottomTabs`** (área logada).
   - `accessToken` ausente → **`AuthStack`** (área pública).
   - **Login/logout não usa `navigate`**: muda `accessToken`, o RootNavigator
     re-renderiza e troca a árvore inteira.

3. **`AuthStack`** (native-stack, `headerShown: false`)

4. **`BottomTabs`** (bottom-tab) → aba Home embrulha o **`HomeStack`** (native-stack).

---

## AuthStack — rotas e params

| Rota | Params | Componente |
|------|--------|-----------|
| `Login` | — | `screens/auth/login` |
| `Signup` | `{ step?: 1\|2\|3, email?: string }` | `screens/auth/signup` |
| `ForgotPassword` | — | `screens/auth/forgotPassword` |
| `SpecialtyQuiz` | `{ testCode: string, userId: string }` | `screens/defaults/specialtyQuiz` |

> `Signup` recebe `step`/`email` para "pular" direto ao passo 3 (ex.: usuário
> que já tem o código, vindo do Login).

---

## BottomTabs — abas

| Aba | Rota/Componente | Observação |
|-----|-----------------|-----------|
| Home | `HomeStack` | Badge nenhum; contém a stack interna |
| Missions | `MissionsScreen` | **Badge** = nº de missões disponíveis agora |
| CreatePost | `EmptyScreen` | **Não navega** — `tabPress` é interceptado e abre o `CreatePostModal` (botão `+` vermelho central) |
| Achievements | `AchievementsScreen` | — |
| Profile | `ProfileScreen` | Perfil próprio (sem params) |

- `tabBarActiveTintColor` `#9E1B32`; ícone de Missões usa o emblema Primus Pilus.

---

## HomeStack — rotas e params

| Rota | Params | Componente |
|------|--------|-----------|
| `Dashboard` | — | `screens/dashboard` |
| `Ranks` | — | `screens/ranks` |
| `Legions` | — | `screens/legions` |
| `WarRoom` | `{ legionId: number }` | `screens/legions/WarRoom` |
| `Profile` | `{ userId?: string }` | `screens/profile` |
| `PostDetail` | `{ post: FeedItem }` | `screens/postDetail` |

> **Detalhe de nesting**: `Profile` existe **duas vezes** — como aba (perfil
> próprio) e dentro do `HomeStack` (perfil de terceiros, com seta de voltar).
> Telas que abrem `Ranks`/`Legions` a partir de outra aba usam
> `navigate('Home', { screen: 'Ranks' })` para saltar de aba + rota.

---

## Regras de gating / redirecionamento

- **Sem login** → só AuthStack.
- **Cadastro incompleto** (senha temporária + sem especialidade): o backend
  bloqueia o login (403); o fluxo empurra o usuário ao **Quiz** via Signup passo 3.
- **Onboarding pós-login** (na Dashboard, em ordem, como modais automáticos):
  senha temporária → província → trilha → legião. Ver [02-dashboard.md](02-dashboard.md).
