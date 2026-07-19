# 02 — Dashboard (Home)

`screens/dashboard/index.tsx` — primeira tela da aba **Home** (dentro do
`HomeStack`). Mostra saudação, streak, notificações, campanha ativa, busca e o
**feed social** (timeline). Usa a `Navbar` padrão + `WalletButton`.

---

## Navbar / topo

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| **UserMenu** (avatar, direita) | toque | Popover | Menu: trocar senha / sair — ver [09-componentes-globais.md](09-componentes-globais.md) |
| **WalletButton** (carteira) | toque | Popover | Mostra o saldo (diamante) |
| **StreakButton** (chama/fogo) | toque | Popover | Detalhe do streak (dias, bônus, próxima meta). Só aparece se `current_streak > 0` |
| **NotificationsButton** (sino) | toque | Popover | Lista de notificações; ver [08-feed-social.md](08-feed-social.md). Desabilitado se 0 não lidas |

---

## Corpo

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Card **Campanha atual** → "Continuar campanha" | toque | `Navigate → Missions` (aba) | Vai para a tela de Missões |
| **SearchBar** (busca global) | toque | Modal `GlobalSearchModal` | Abre busca de usuários/hashtags/posts |
| **FeedCard** (cada post) | toque/ações | vários | Ver interações em [08-feed-social.md](08-feed-social.md) |
| Pull-to-refresh | gesto | — | Refetch de perfil, carteira, missões, campanhas, feed |
| Scroll até o fim | gesto | — | Paginação incremental do feed (`fetchNextPage`) |

---

## Modais automáticos de onboarding

Disparam em sequência, na primeira vez, conforme o estado do usuário. Cada um
grava um flag persistido ao ser dispensado (`usePersistedFlag`) para não reabrir.

| Ordem | Modal | Condição de abertura | Ação principal → Resultado |
|-------|-------|----------------------|----------------------------|
| 0 | `ChangePasswordModal` | `is_temporary_password` | Trocar senha temporária (obrigatório; `onClose` no-op) |
| 1 | `ProvinceSetupModal` | perfil sem `province` | Confirmar província → `useUpdateProvince` |
| 2 | `TrackSelectModal` | `must_choose_track` | Escolher trilha (Legionários/Patrícios) → `useChooseTrack` |
| 3 | `LegionSelectModal` | sem legião **e** já concluiu ≥1 missão | Confirmar legião → `useJoinLegion` |

> Os modais de seleção seguem o padrão de carrossel do `LegionSelectModal`
> (CLAUDE.md §0.1). Fechar sem escolher marca o flag e não reabre na sessão.

| Modal extra | Origem | Resultado |
|-------------|--------|-----------|
| `CommentsModal` | abrir comentários de um post do feed | Lista/insere comentários |
| `GlobalSearchModal` | SearchBar | Busca global (ver [08](08-feed-social.md)) |
