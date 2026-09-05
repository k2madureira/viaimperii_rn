# Índice de Telas → Arquivos (lookup do `ft`)

Mapa **enxuto** para localizar código sem fan-out de Glob/Grep. Uma linha por tela:
onde fica, quais sections a compõem, qual(is) domínio(s) de API consome, os hooks de
leitura/escrita e o prefixo de i18n.

> **Não descreve comportamento** (isso vive nos `0X-*.md` deste diretório). Aqui é só
> "onde editar". Caminhos mudam pouco; comportamento muda muito — por isso a separação.
>
> **Manutenção**: ao criar/mover tela, section, query/mutation ou domínio de API,
> atualize a linha correspondente. O `close-feature` inclui este passo.

---

## Camada global (compartilhada por várias telas)

| O quê | Onde |
|---|---|
| Navegação (stacks, ParamList) | `src/navigation/` (`RootNavigator`, `AuthStack`, `BottomTabs`, `HomeStack`, `MissionsStack`) |
| Auth / sessão | `src/contexts/AuthContext.tsx`, `src/api/config/` (`defaultApi`, `tokenManager`, `authBridge`) |
| Facade de API (fonte única) | `src/api/index.ts` → `viaimperiiApi.<domínio>.<operação>` |
| Componentes globais | `src/components/` (`navbar`, `screenContainer`, `text`, `textInput`, `userMenu`, `legionSelectModal`, `createMenu`, `icons/`, `praefectusBadge`, `founderBadge`) |
| Menu do botão (+) da tab bar | `src/components/createMenu/` (aberto pelo `BottomTabs`; hoje só "Criar post") |
| Feed social (submódulo, usado por 4 telas) | `src/screens/dashboard/components/feed/` |
| i18n | `src/i18n/locales/pt.ts` + `en.ts` (pt-BR default) |
| Constantes | `src/constants/<contexto>.ts` (`missions`, `chat`, `layout`, …) |
| Utils de moeda | `src/utils/coins.ts` + `src/components/icons` (`CoinAmount`) |

---

## Telas → arquivos

Dir base de cada uma = `src/screens/<Dir>/`. Sections em `components/sections/`,
hooks em `model/{queries,mutations,hooks}/`.

### achievements
- **Dir**: `achievements` · **i18n**: `achievements.*`
- **Sections**: `achievementsHeader`, `achievementsList`
- **API**: dados vêm do detalhe do usuário (`users`) — sem query dedicada
- **Hooks**: —

### chests (+ chestDetail)
- **Dir**: `chests` · **i18n**: `chests.*`
- **Sub-tela**: `chestDetail/` (seletor de abertura; rota `ChestDetail`)
- **Cards**: `chestCard` · **Selectors**: `chestDetail/.../slotSelector` despacha → `avatarSlot` (miniaturas + filtro raridade) ou `professionSlot` (card estilo mercado: livro/`icon_url` + título + descrição, 1 por profissão, missão aleatória; casa com catálogo `['professions']`)
- **API**: `chests`
- **Queries**: `useChests`, `useChestDetail` · **Mutations**: `useOpenChest`
- **Notas**: entrada pelo `UserMenu` (Baús). Baú abre 1×; `options` some depois de aberto (`selections` fixo). Slot de missão = **escolha de PROFISSÃO** (abrir ativa a profissão inteira, todas as missões dela entram no pool).

### redeemCode (resgate unificado)
- **Dir**: `redeemCode` · **i18n**: `codeRedeem.*`, `founder.*` (sucesso de fundador)
- **API**: `codes` · **Mutations**: `useRedeemCode`
- **Notas**: **um único** resgate para promo e fundador — `POST /codes/redeem` roteia pelo hash e devolve `kind` (`founder`|`promo`) + `founder{...}`. Entrada em **TODOS** os dropdowns do `UserMenu` (default + gear) e no botão da tela Baús. `kind:founder` → Recruit IV + `must_choose_track` → leva a `Ranks`; ambos concedem baú → abrir em `Chests`.

### founder — auth/founderPreRegister
- **Dir**: `auth/founderPreRegister` (pré-inscrição pública) · **i18n**: `founder.*`
- **API**: `founder` (preRegister/availability; `redeem` via `/users/me/founder` mantido p/ compat, não usado na UI)
- **Queries**: `useFounderAvailability` · **Mutations**: `usePreRegisterFounder`
- **Notas**: pré-inscrição no `AuthStack` (link no Login). Resgate do código é feito na tela `redeemCode`. Selo `FounderBadge` (global) onde autor é renderizado (feed, comentários, fila de revisão).

### clan
- **Dir**: `clan` · **i18n**: `clan.*`, `clanCard.*`
- **Sections**: `clanHeader`, `clanMembers`, `clanJoinAction`, `clanRequestQueue`
- **API**: `clan`, `upload` (emblema)
- **Queries**: `useUserClan`, `useClanDetail`, `useMyJoinRequests`, `useClanJoinRequests`
- **Mutations**: `useLeaveClan`, `useSetClanEmblem`, `useRequestJoin`, `useCancelJoinRequest`, `useRespondJoinRequest`
- **Notas**: sem `clanId` no param → clã do logado (entrada pelo `ClanCard` do Perfil); com `clanId` → detalhe do diretório. Emblema editável só pelo marechal (pick+crop+WEBP em `src/utils/clanEmblem.ts`). `ClanCard` mora em `dashboard/components/cards/clanCard`.

### clanDirectory
- **Dir**: `clanDirectory` · **i18n**: `clan.directory.*`, `clan.create.*`, `clan.emblem.*`
- **Sections**: — (busca + `FlatList` de `ClanRow`; modal `createClanModal`)
- **API**: `clan`, `upload`, `users` (nível de patente p/ gate)
- **Queries**: `useClans`, `useUserProfile`
- **Mutations**: `useCreateClan`
- **Notas**: modal de fundação é rank-gated (≥ Centurion I / Praetor I = `level 21`); abaixo disso mostra só requisitos/taxa/capacidade. Emblema opcional na fundação (`emblem_key`).

### dashboard (Home)
- **Dir**: `dashboard` · **i18n**: `dashboard.*`, `feed.*`, `search.*`, `notifications.*`, `changePassword.*`, `tributes.*`
- **Sections**: `dashboardHeader`, `homeNavActions`, `homeFeed`, `currentCampaign`, `dashboardModals`
- **Cards**: `favoriteRoutineCard` (rotina diária de missões favoritas; consome `useFavoriteMissions`)
- **API**: `feed`, `notifications`, `users`, `wallet`, `ranking`, `provinces`, `campaigns`, `tributes`, `streak`, `search`, `config`
- **Queries**: `useFeed`, `useFeedComments`, `useFeedEvent`, `useReactors`, `useNotifications`, `useUnreadNotificationsCount`, `useUserProfile`, `useWallet`, `useRanking`, `useProvinces`, `useCampaigns`, `useLegionDetail`, `useGlobalSearch`, `useStreak`
- **Mutations**: `useCreatePost`, `useUpdatePost`, `useDeletePost`, `useReactFeed`, `useCreateComment`, `useMarkNotificationRead`, `useMarkAllNotificationsRead`, `useChooseTrack`, `useUpdateProvince`, `useUpdatePasswordMutation`, `useClaimDailyGoalReward`, `useBuyStreakShield`, `useSendTribute`
- **Hooks (SSE)**: `useFeedEvents`, `useNotificationEvents`

### friends
- **Dir**: `friends` · **i18n**: `friends.*`, `chat.*`, `presence.*`
- **Sections**: `chatInbox` (sub-abas DM/Clã/Legião), `friendsListSection`, `groupChatSection`, `chatThread`, `chatThreadView` (núcleo do histórico: divisor de não-lidas + "ir ao fim"), `requestsListSection`, `addFriendSection`, `amigosSection`
- **API**: `friendship`, `chat` (DM + salas `legion`/`clan`: `openDm`/`openLegion`/`openClan`), `presence`
- **Queries**: `useFriends`, `useFriendRequests`, `useConversations`, `useDmConversation`, `useGroupConversation`, `useMessages`
- **Mutations**: `useSendFriendRequest`, `useRespondFriendRequest`, `useUnfriend`, `useBlockUser`, `useSendMessage`, `useMarkRead`
- **Hooks (SSE)**: `useChatEvents` — conectado **globalmente** em `navigation/BottomTabs` (sessão autenticada inteira, não por tela); fechado no logout via `AuthContext.signOut`

### hashtagFeed
- **Dir**: `hashtagFeed` · **i18n**: `hashtagFeed.*`
- **Sections**: — (tela enxuta, 112 linhas, sem split)
- **API**: `feed` · **Queries**: `useHashtagFeed`

### leaderboards
- **Dir**: `leaderboards` · **i18n**: `leaderboards.*`
- **Sections**: `LeaderboardHeader`, `LeaderboardBody`
- **API**: `leaderboards` · **Queries**: `useLeaderboard`, `useLeaderboardHistory`, `useLeaderboardScopes`

### legions (+ WarRoom)
- **Dir**: `legions` · **i18n**: `legions.*`, `legionCard.*`, `legionSelect.*`, `legionAttributes.*`
- **Sections**: `legionBoard`, `legionTreasury`
- **API**: `legion`, `legionLeaderboard`, `legionTreasury`
- **Queries**: `useLegionLeader`, `useLegionLeaderboard`, `useLegionTreasury`, `useStandardProposals`
- **Mutations**: `useDonateToTreasury`, `useProposeStandard`, `useProposeWarRoom`, `useVoteProposal`
- **Hooks**: `useLegionVoteEvents` (SSE), `useStandardCountdown`
- **Sub-tela**: `donations/` (histórico/fluxo de doações ao tesouro; rota `LegionDonations` no `HomeStack`)

### market
- **Dir**: `market` · **i18n**: `market.*`
- **Sections**: `marketHeader`, `sectionSelector`, `productsSection`, `professionsSection`, `campaignsSection`
- **API**: `physical` (produtos), `professions`, `campaigns`
- **Queries**: `useProducts`, `useProfessions`
- **Mutations**: `useRedeemProduct`, `useBuyProfession`

### missions (+ professionMissions, Revisão)
- **Dir**: `missions` · **i18n**: `missions.*`, `missionsTabs.*`, `missionItem.*`, `reviewItem.*`, `evidenceModal.*`, `missionsSummary.*`, `professionMissions.*`, `statsFilter.*`, `periodStats.*`, `specialtyFilter.*`, `difficultyFilter.*`
- **Sections**: `missionsHeader`, `missionTypeSelector`, `progressSection`, `activeMissionsCard`, `availableMissionsBox`, `favoritesSection`, `reviewSection`, `professionHero`, `missionsModals`
- **API**: `missions`, `legion`, `specialties`, `tributes`
- **Queries**: `useMissions`, `useAvailableMissions`, `useFavoriteMissions`, `useRecommendedMissions`, `useMissionsToReview`, `useMissionStatus`, `useDailyBriefing`, `useUserStats`, `useUserSummary`, `useSpecialties`, `useLegions`
- **Mutations**: `useMissionMutations`, `useToggleFavorite`, `useApproveMission`, `useRejectMission`, `useJoinLegion`, `useRewardedVideo`, `useSendMissionTribute`
- **Hooks (SSE)**: `useMissionEvents`

### postDetail
- **Dir**: `postDetail` · **i18n**: `feed.*`
- **Sections**: `postDetailHeader`, `commentsList`, `commentComposer`
- **API**: `feed` (queries/mutations reusadas do dashboard via barrel)

### profile (próprio e de terceiros)
- **Dir**: `profile` · **i18n**: `profile.*`, `avatarPicker.*`, `masteries.*`
- **Sections**: `profileTopBar`, `profileIdentity`, `profileCards`, `profileStats`, `masterySection`, `privateSection`
- **API**: `users`, `assets`
- **Queries**: `useAssetCatalog` · **Mutations**: `useBuyAsset`, `useEquipAsset`

### ranks
- **Dir**: `ranks` · **i18n**: `ranks.*`, `rankUp.*`, `rankCard.*`, `trackSelect.*`
- **Sections**: `ranksHeader`, `trackSelector`, `ranksList`
- **API**: `ranks` · **Queries**: `useRanks`, `useTracks`

### rewards
- **Dir**: `rewards` · **i18n**: `rewards.*`
- **Sections**: `rewardsHeader`, `rewardsBody`
- **API**: `dailyRewards`, `rewards` · **Queries**: `useDailyRewards` · **Mutations**: `useClaimDailyReward`

### auth (Login, Signup, ForgotPassword, SpecialtyQuiz)
- **Dir**: `auth` · **i18n**: `auth.*`, `quiz.*`, `provinceSetup.*`
- **API**: `auth`, `quiz`, `specialties`, `provinces`

---

## Domínios de API → facade

Todos em `src/api/<domínio>/` (padrão: `dto.ts` + 1 arquivo por operação + `index.ts`),
consumidos **só pelo facade** `viaimperiiApi.<domínio>.<operação>` (`src/api/index.ts`).

`assets` · `auth` · `campaigns` · `chat` · `chests` · `codes` · `config` ·
`dailyRewards` · `feed` · `founder` · `friendship` · `leaderboards` · `legion` ·
`legionLeaderboard` · `legionTreasury` · `missions` · `notifications` · `physical` ·
`presence` · `professions` · `provinces` · `quiz` · `ranking` · `ranks` · `rewards` ·
`search` · `specialties` · `streak` · `tributes` · `upload` · `users` · `wallet`

> SSE/eventos não são operações REST — ficam como `<domínio>Events.ts` no domínio
> (`missionEvents`, `feedEvents`, `notificationEvents`, `chatEvents`).
