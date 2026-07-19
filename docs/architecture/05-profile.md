# 05 — Perfil

`screens/profile/index.tsx`. Existe em **dois contextos**:

- **Aba Profile** (Bottom Tabs) → perfil **próprio** (sem params).
- **HomeStack `Profile { userId }`** → perfil de **outro usuário** (com seta de
  voltar; sem seções privadas).

`isOwnProfile = !routeUserId || routeUserId === user.user_id`.

---

## Cabeçalho

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Seta ‹ (só perfil de terceiro) | toque | `goBack()` | Volta à tela anterior |
| **UserMenu / WalletButton** (só próprio) | toque | Popover | Menu do usuário / saldo |
| **Avatar** | toque | Modal | Amplia o avatar em tela cheia |
| Lápis ✏️ (só próprio) | toque | Modal `AvatarPickerModal` | Abre seletor de avatares (possuídos + loja) |

---

## Corpo

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| **RankCard** (patente) | toque | `Navigate → Home/Ranks` | Abre o ladder de patentes |
| **LegionCard** (legião) | toque | `Navigate → Home/Legions` | Abre a tela de legiões |
| **LocalCard** (país/província/trilha) | — | — | Somente leitura |
| Grid de estatísticas | — | — | Contadores (missões, conquistas, medalhas…) |
| Maestria por especialidade | — | — | Barras de progresso |
| Pull-to-refresh | gesto | — | Recarrega perfil + stats |

> `navigate('Home', { screen: 'Ranks' | 'Legions' })` salta da aba Profile para
> a stack da Home naquelas rotas.

---

## Seção privada (só perfil próprio)

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| **Trocar senha** | toque | Modal `ChangePasswordModal` | Fluxo de troca de senha |
| **Sair** | toque | — (troca de árvore) | `signOut()` → RootNavigator volta ao `AuthStack` |

---

## AvatarPickerModal (`profile/components/avatarPickerModal`)

Segue o padrão de carrossel (CLAUDE.md §0.1) com abas (habilitados/loja), filtro
de raridade e grid. Selecionar/equipar um avatar atualiza o `active_avatar` do
usuário e fecha o modal.
