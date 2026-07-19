# Weekly Leaderboards (Placares Semanais por Escopo) — Frontend

> Backend **já shipou** (PRs #46/#47/#48; CLAUDE.md §23, `docs/leaderboards/README.md`).
> Esta spec é **frontend-only**: consumir o contrato existente. Hoje só existe o
> `/ranking` all-time (consumido no dashboard) — **não há** placar semanal no app.

- **Slug:** `weekly-leaderboards-frontend`
- **Backlog #:** F4 · **ROI:** 4.5 · **Esforço:** M
- **Status:** Ready for build
- **Autor (PO):** product-owner · **Data:** 2026-07-18

---

## 1. Problema / Oportunidade
O `/ranking` all-time ordena `total_xp` de todos — **inatingível para 99%** dos jogadores
(o topo nunca muda) e caro sob carga. O backend agora expõe **placares semanais escopados**
(`global`/`legion`/`province`/`profession`) que resetam **toda segunda 00:00 (SP)**, onde quase
todo usuário ativo ranqueia em *algum* lugar, com prêmio em denarii pago do ledger. Sem tela,
esse loop de retenção de curto horizonte fica invisível.

## 2. Hipótese
Se expusermos placares semanais escopados + a linha do próprio viewer ("você está em #14") +
countdown de reset + prêmios, o engajamento semanal sobe (usuários voltam para subir no placar
antes de segunda), medido por sessões perto do reset e por XP ganho na semana.

## 3. Regras de negócio (backend, resumo)
- **Janela = semana SP** (segunda 00:00 America/Sao_Paulo). Reseta toda segunda.
- **Score = Σ XP** de todas as fontes na semana (já reflete streak/profissão/estandarte).
- **Escopos**: `global`, `legion`, `province`, `profession` (id do viewer por padrão, ou `scopeId`).
- **Linha do viewer sempre volta** (`viewer.position`/`viewer.xp`), mesmo fora do top-N —
  gancho "você está em #N"; `position = null` se o viewer não ganhou XP no escopo na semana.
- **Prêmios** top-3: `{1:300, 2:150, 3:75}` denarii, pagos por job de segunda (não é ação do front).
- **Guard anti-farm**: escopo com < 3 ranqueados não paga (não impacta a UI de leitura).
- Detalhes em `CLAUDE.md` §23.

## 4. Modelo de dados
Nenhuma mudança. Consome o que existe.

## 5. Contrato de API (real — validado nos read-services)
> **Response-wrapped**: ler tudo de `content.*`. Chaves em **camelCase**.
```
GET /api/v1/leaderboards?scope=&scopeId=&professionId=&perPage=      (auth)
  content: {
    scope, scopeKey,                       # scopeKey = id da instância (null no global)
    weekStart, weekEnd,                    # ISO com offset SP (para o countdown)
    items: [ { position, xp,
               user: { id, name, image, active_avatar, rank, legion_id } } ],
    viewer: { position: int|null, xp: int },
    prizes: { "1": 300, "2": 150, "3": 75 } # denarii por posição
  }

GET /api/v1/leaderboards/history?scope=&scopeId=&professionId=&isoYear=&isoWeek=  (auth)
  content: { ...igual ao live, semana FECHADA; cada item traz
             prize_amount, prize_amount_display }   # default: última semana fechada

GET /api/v1/leaderboards/scopes                                      (auth)
  content: { global_available: true,
             legion:   { id, name } | null,
             province: { id, name } | null,
             professions: [ { id, name } ] }
```
**Erros esperados**: `401` sessão. Escopo sem instância resolvível (ex.: viewer sem legião) →
200 com `items: []`, `viewer` vazio (não é erro — tratar como estado vazio).

---

## 6. Frontend (contrato para a ft)

### 6.1 Telas / entradas
- **Nova screen** `src/screens/leaderboards/` (padrão §0.2: `index.tsx` orquestra + sections +
  átomos por contexto). Usa a `Navbar` padrão e `ScreenContainer`.
  - **Entrada**: um card/botão "Placar da semana" no **dashboard** (perto do bloco de ranking
    all-time atual, `dashboard/model/queries/useRanking.ts`) que navega para a nova screen.
- **Model** (`leaderboards/model/`):
  - `queries/useLeaderboard.ts` — key `['leaderboard', scope, scopeKey, professionId]`.
  - `queries/useLeaderboardScopes.ts` — key `['leaderboard-scopes']` (monta o seletor).
  - `queries/useLeaderboardHistory.ts` — key `['leaderboard-history', scope, scopeKey, isoYear, isoWeek]`.
- **Componentes** (contexto §0.2):
  - `components/buttons/scopeTab/` — abas/segmented de escopo (Global / Legião / Província /
    Profissão), montadas a partir de `GET /leaderboards/scopes` (esconder abas cujo id é null;
    profissão pode virar sub-select se houver >1). Reusar padrão de `typeTab`/`sectionTab`.
  - `components/cards/leaderboardRow/` — linha do placar: `position`, avatar (`active_avatar` +
    `image`), `name`, `rank` (mini), `xp` (formatado). Destaque visual do pódio (1/2/3) + badge
    de prêmio em denarii a partir de `prizes[position]` (`CoinAmount`/`DenariusCoin`).
  - `components/cards/viewerPin/` — linha **fixada** do viewer ("Você — #14") quando o viewer
    está fora do top-N visível (`content.viewer`); some quando `viewer.position` já está na lista.
  - `components/cards/resetCountdown/` — countdown "Reseta em Xd Xh" a partir de `weekEnd`
    (client-side, tick por minuto).
  - `components/buttons/historyToggle/` — alterna live ↔ semana fechada (usa `/history`).
- Sabor romano na microcopy ("Placar da Semana", "Legião", "Província", "Ofício").

### 6.2 Estados de UI
| Estado | Origem | UI |
|---|---|---|
| loading | query pendente | `skeletons/leaderboardSkeleton/` (linhas placeholder) |
| sucesso | 200 com items | lista + pin do viewer + countdown |
| vazio | `items: []` (escopo sem ranqueados / viewer sem legião) | `feedback/emptyBox` "Ninguém pontuou ainda nesta semana" |
| viewer fora do top-N | `viewer.position > perPage` | `viewerPin` fixado no rodapé |
| viewer sem XP | `viewer.position === null` | pin mostra "Você ainda não pontuou" |
| escopo indisponível | `scopes.legion === null` etc. | aba não renderiza |
| erro geral | rede/500 | `feedback/errorState` + retry |
| 401 | sessão | fluxo de re-login (padrão do app) |

### 6.3 Dados a exibir
- Cabeçalho: nome do escopo ativo + `resetCountdown` (de `weekEnd`).
- Linhas: `items[i].position`, `.user.name`, avatar (`active_avatar`+`image`), `.user.rank`, `.xp`.
- Pódio: destacar `position` 1–3 + badge de prêmio de `prizes[String(position)]` (denarii).
- Viewer pin: `content.viewer.position` / `.xp`.
- Histórico: mesmos campos + `prize_amount_display` por linha.

### 6.4 Ação → API
| Ação | Método + endpoint |
|---|---|
| Abrir placar (escopo default do viewer) | `GET /api/v1/leaderboards?scope=global` |
| Trocar de escopo | `GET /api/v1/leaderboards?scope=<escopo>&scopeId=<id>` (profissão: `professionId`) |
| Ver semana passada | `GET /api/v1/leaderboards/history?scope=&scopeId=` |
| Montar seletor de escopo | `GET /api/v1/leaderboards/scopes` |
- Sem mutations (read-only). Refetch on-focus + pull-to-refresh.

### 6.5 Notificação de prêmio (`leaderboard_prize`)
- Novo tipo de notificação `leaderboard_prize` (histórico persistido + SSE `GET /notifications/events`).
- **Adicionar case** em `dashboard/components/buttons/notificationsButton/notificationMessage.ts`:
  ```
  case 'leaderboard_prize':
    return t('notifications.types.leaderboard_prize', {
      position: p.position, amount: p.prize_amount_display, scope: p.scope });
  ```
  - payload: `{ scope, scope_key, position, prize_amount, prize_amount_display, iso_year, iso_week }`
    (sem `from_user_id` — é conquista do próprio usuário).
  - Ao tocar na notificação → abrir a screen `leaderboards` no escopo/semana do payload (`/history`).

### 6.6 Microcopy (pt-BR + en) — chaves i18n novas em `leaderboards.*`
| Chave | pt-BR | en |
|---|---|---|
| `title` | Placar da Semana | Weekly Leaderboard |
| `scope.global` | Global | Global |
| `scope.legion` | Legião | Legion |
| `scope.province` | Província | Province |
| `scope.profession` | Ofício | Profession |
| `resetIn` | Reseta em {{time}} | Resets in {{time}} |
| `youRow` | Você | You |
| `notScored` | Você ainda não pontuou | You haven't scored yet |
| `empty` | Ninguém pontuou ainda nesta semana | No one has scored yet this week |
| `prize` | Prêmio | Prize |
| `history` | Semana passada | Last week |
| `notifications.types.leaderboard_prize` | Você ficou em #{{position}} e ganhou {{amount}}! | You placed #{{position}} and won {{amount}}! |

### 6.7 Tempo real (SSE)
- **Board sem SSE dedicado** (v1): recarrega no open/on-focus + pull-to-refresh (aceito no backend).
- **Notificação de prêmio** entra pelo SSE de notificações existente (`GET /notifications/events`) —
  reusar o pipeline já vivo, só somando o novo `type`.

### Assets
- Ícones de pódio (medalha 1/2/3) em `src/components/icons/` (novos, SVG). Moedas de prêmio:
  reusar `DenariusCoin` + `CoinAmount` (`src/utils/coins.ts`).

## 7. Critérios de aceite
- Viewer abre "Placar da Semana", troca entre Global/Legião/Província/Ofício (só abas com id),
  vê top-N + sua própria linha fixada quando fora do topo, com countdown de reset.
- Badges de prêmio nos 3 primeiros; histórico da semana fechada acessível.
- Notificação `leaderboard_prize` renderiza texto correto e abre a screen no escopo certo.
- `npx tsc --noEmit` exit 0. Strings pt-BR **e** en.

## 8. Fora de escopo
- Reordenar/ substituir o `/ranking` all-time do dashboard (coexistem).
- SSE ao vivo do board; boards diários/sazonais; prêmios cosméticos.

## 9. Riscos / conflitos
- **Seletor de profissão**: se o viewer tem >1 profissão ativa, decidir se vira aba única
  (primeira) ou sub-select — confirmar UX com o PO antes; `scopes.professions[]` traz todas.
- **Prêmios sem `_display` no live**: `prizes` vem em denarii cru (int). Usar `CoinAmount` com a
  denominação denarii; no `/history` preferir `prize_amount_display` já formatado.
- Reconfirmar shape de `item.user.rank` (objeto mini `{id,name,image}`) ao integrar.
