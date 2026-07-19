# 09 — Componentes Globais de Navegação

Elementos compartilhados que aparecem em várias telas.

---

## Bottom Tabs (`navigation/BottomTabs.tsx`)

Barra inferior, sempre visível na área logada.

| Aba | Ação | Destino | Resultado |
|-----|------|---------|-----------|
| **Home** | toque | Aba Home (`HomeStack` → Dashboard) | — |
| **Missions** (badge) | toque | Aba Missions | Badge = missões disponíveis |
| **CreatePost** (`+` central) | toque | — | **Não navega**: `tabPress` interceptado → abre `CreatePostModal` |
| **Achievements** | toque | Aba Achievements | — |
| **Profile** | toque | Aba Profile (perfil próprio) | — |

---

## Navbar (`components/navbar`)

Cabeçalho padrão das telas internas: logo + nome do app à esquerda, `UserMenu`
à direita (e `rightExtra` opcional, ex.: `WalletButton`).

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| **UserMenu** | toque | Popover | Menu do usuário (abaixo) |
| `rightExtra` (WalletButton) | toque | Popover | Saldo da carteira |

> Telas com header próprio (exceções à Navbar): **Ranks**, **Perfil de terceiro**
> e o cabeçalho de "voltar" do **PostDetail**.

---

## UserMenu (`components/userMenu`)

Popover ancorado ao avatar do topo.

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| **Trocar senha** | toque | Modal `ChangePasswordModal` | Abre o fluxo de troca |
| **Sair** | toque | — (troca de árvore) | `signOut()` → volta ao `AuthStack` |

---

## Modais compartilhados

Todos seguem o padrão de UI de seleção (CLAUDE.md §0.1) quando aplicável.

| Modal | Onde abre | Confirmar → Resultado |
|-------|-----------|-----------------------|
| `ChangePasswordModal` | UserMenu, Perfil, onboarding (senha temp.) | Troca a senha |
| `ProvinceSetupModal` | Dashboard (onboarding) | Define a província |
| `TrackSelectModal` | Dashboard (onboarding) | Escolhe a trilha |
| `LegionSelectModal` | Dashboard (onboarding) e Missões (pós 1ª missão) | Ingressa/troca legião |
| `AvatarPickerModal` | Perfil (lápis) | Equipa avatar |
| `EvidenceModal` | Missões (concluir com prova) | Envia evidência → `pending_review` |
| `GlobalSearchModal` | Dashboard (SearchBar) | Navega para perfil/post |
| `CreatePostModal` | Aba CreatePost | Publica post |
| `CommentsModal` | Feed (Dashboard) | Comenta post |

---

## Tempo real (SSE)

Não são cliques, mas afetam o que aparece:

- `useMissionEvents` — atualiza status de missões/aprovações/fila de revisão.
- `useFeedEvents` / `useNotificationEvents` — novos posts e notificações em tempo
  real (badge do sino, timeline).
