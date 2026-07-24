# Coin Tributes (Tributos de Moeda) — Frontend

> Backend **já shipou** (migration **0070**; CLAUDE.md §26,
> `docs/business-rules/economy/coin-tributes.md`). Esta spec é **frontend-only**:
> consumir o contrato existente. Hoje o app **não tem nenhuma referência** a tributo
> (`src/api/` sem domínio `tributes`, nenhum botão no `FeedCard`).

- **Slug:** `coin-tributes`
- **Backlog #:** F6 · **ROI:** 4.3 · **Esforço:** M
- **Status:** Ready for build
- **Autor (PO):** product-owner · **Data:** 2026-07-20

---

## 1. Problema / Oportunidade
Moedas só fluem **para** o usuário (missões, campanhas, streak) ou são gastas na loja.
O backend já entrega o **primeiro sink jogador→jogador**: tributar moedas num post do feed
ou numa missão concluída de outro usuário. Hoje reconhecimento no app é uma **reação grátis**
— sem sinal custoso. O contrato está vivo e **100% invisível** no app.

## 2. Hipótese
Se o usuário puder tributar moedas num post/missão, o reconhecimento vira sinal custoso:
esperamos mais posts (autores recebem retorno tangível), mais visitas ao feed e uma via
de saída de moedas do estoque dos jogadores. Métrica: moedas transferidas/dia, % de ativos
que enviam ≥1 tributo/semana, posts/dia.

## 3. Regras de negócio (backend, resumo)
- **Valor livre** entre **5 e 100 denarii** por tributo. Body `{ amount, unit }`
  (`unit` = `aureus|denarius|as`, default `denarius`). Fora do range → **422**.
- **Cap diário**: **10 tributos/dia SP** por remetente → **429** ao esgotar.
  Admin isento (`daily_limit: null`).
- **Auto-tributo proibido** → **400**. Saldo insuficiente → **422**.
- **Sem taxa**: transferência 1:1 (o cap é a trava de abuso).
- **Alvos**: `feed` (autor do post) e `mission` (executor de uma conclusão `COMPLETED`;
  se não estiver concluída → **409**).
- Fundos **restritos** (bônus de cadastro admin) não são tributáveis.

## 4. Modelo de dados
Nenhuma mudança de backend. Consome o que existe.

## 5. Contrato de API (real — `docs/business-rules/economy/coin-tributes.md`)
> **Response-wrapped**: ler de `content.*`. Chaves em **snake_case**.
> **Nunca fazer aritmética de moeda no front** — usar os campos `*_display`.

```
POST /api/v1/feed/{event_id}/tribute                                   (auth)
  body: { amount: number, unit?: 'aureus' | 'denarius' | 'as' }        # default denarius

POST /api/v1/missions/{mission_slug}/tribute                           (auth)
  body: { executor_id: string (uuid), amount: number, unit?: ... }

  content (TributeResponse, igual nos dois): {
    message,
    target_type,                 # 'feed' | 'mission'
    target_id,
    recipient_user_id,
    coins_sent, coins_sent_display,
    sender_balance, sender_balance_display,
    target_total, target_total_display,   # total já tributado NAQUELE alvo
    tributes_today,                       # nº de tributos do remetente hoje (SP)
    daily_limit                           # 10 | null (admin)
  }

GET /api/v1/feed  e  GET /api/v1/feed/hashtag/{tag}                    (já consumidos)
  # cada item ganha (batched, como o resumo de reações):
  content.items[i].tributes: {
    total, total_display,       # total atômico tributado no post
    count,                      # nº de tributos
    mine                        # total atômico que o VIEWER já tributou nesse post
  }                             # zerado quando não há tributos
```
**Erros a mapear**: `400` auto-tributo · `409` missão não concluída · `422` valor fora do
range **ou** saldo insuficiente (distinguir pela mensagem do backend) · `429` cap diário ·
`401` sessão.

---

## 6. Frontend (contrato para a `ft`)

### 6.1 Telas / entradas
Nenhuma screen nova. Três pontos de entrada:

1. **Feed** (`src/screens/dashboard/components/feed/FeedCard/`) — botão **Tributar** na
   barra de ações do card, ao lado de reagir/comentar. Some quando
   `item.author.id === currentUserId`. Reaproveitado automaticamente por `hashtagFeed`
   e `postDetail` (todos renderizam `FeedCard`).
2. **Detalhe do post** (`src/screens/postDetail/`) — mesmo botão via `FeedCard`.
3. **Fila de revisão** (`src/screens/missions/` → `ReviewSection` / `reviewItem`) — ação
   **Tributar** no item, disponível **após** a missão do executor estar concluída
   (alvo `mission`, `executor_id` já disponível no item do `to-review`).

**API (novo domínio, padrão §0.3):**
```
src/api/tributes/
  dto.ts          # TributeRequest, TributeResponse, TributeSummary (o objeto do feed)
  feed.ts         # sendFeedTribute(eventId, body)
  mission.ts      # sendMissionTribute(missionSlug, body)
  index.ts        # barrel
```
Registrar no facade `src/api/index.ts`:
```ts
tributes: {
  feed: tributesService.sendFeedTribute,
  mission: tributesService.sendMissionTribute,
},
```
Adicionar `tributes?: TributeSummary` em `FeedItem` (`src/api/feed/dto.ts`).

**Mutations** (React Query, dentro da section/componente dono — §0.2):
- `src/screens/dashboard/model/mutations/useSendTribute.ts` — usa
  `viaimperiiApi.tributes.feed`; no sucesso, **update otimista** do `tributes` do item na
  query `['feed']`/`['hashtag-feed', tag]`/`['feed-detail', id]` + invalida `['wallet']`.
- `src/screens/missions/model/mutations/useSendMissionTribute.ts` — usa
  `viaimperiiApi.tributes.mission`; invalida `['wallet']` e `['missions-to-review']`.

**Componentes** (contexto §0.2):
- `dashboard/components/feed/TributeModal/` — modal de valor. **Padrão obrigatório do
  `LegionSelectModal`**: overlay `bg-black/60 items-center justify-center`, card
  `bg-white rounded-[20px] p-6`, **carrossel de presets** com setas `‹ ›` e o ícone da
  moeda ao centro (presets **5 / 10 / 25 / 50 / 100 denarii**), **dots** de posição,
  campo opcional de valor livre (5–100), botão primário full-width e **overlay de
  confirmação** `absolute inset-0` — **nunca** `Alert` nativo.
- `dashboard/components/feed/TributeButton/` — botão na barra do `FeedCard`: ícone
  `DenariusCoin` + `tributes.count`; estado "já tributei" (destaque) quando `mine > 0`.
- `dashboard/components/feed/TributeSummaryRow/` — linha discreta no card:
  "🪙 {{total_display}} em tributos ({{count}})".
- `missions/components/buttons/tributeButton/` — variante compacta para o `reviewItem`.
- Ícones: reusar `DenariusCoin`/`AureusCoin`/`AsCoin` + `CoinAmount` (`src/utils/coins.ts`).

### 6.2 Estados de UI
| Estado | Origem | UI |
|---|---|---|
| idle | post sem tributos | botão neutro, sem contador |
| com tributos | `tributes.count > 0` | contador + `total_display` na linha de resumo |
| já tributei | `tributes.mine > 0` | botão em destaque (dourado), copy `alreadyTributed` |
| enviando | mutation `isPending` | botão do modal em loading, disabled |
| sucesso | 200 | overlay de confirmação no modal: `coins_sent_display` + saldo restante `sender_balance_display` + "restam {{n}} tributos hoje" (`daily_limit - tributes_today`; oculto se `daily_limit === null`) |
| valor inválido | **422** (range) | erro inline no campo: `errors.range` |
| saldo insuficiente | **422** (saldo) | erro inline: `errors.balance` + atalho para o `market` |
| cap diário | **429** | modal bloqueia envio, copy `errors.dailyLimit` |
| auto-tributo | **400** | não deve acontecer (botão escondido); fallback `errors.self` |
| missão não concluída | **409** | `errors.notCompleted`, botão desabilitado no `reviewItem` |
| 401 | sessão | fluxo de re-login padrão |

### 6.3 Dados a exibir
- No card: `content.items[i].tributes.total_display`, `.count`, `.mine`.
- No confirm: `content.coins_sent_display`, `content.sender_balance_display`,
  `content.target_total_display`, `content.tributes_today`, `content.daily_limit`.
- **Não** somar/converter moeda no front — sempre os `*_display`.

### 6.4 Ação do usuário → chamada de API
| Ação | Método + endpoint | Body |
|---|---|---|
| Tributar um post | `POST /api/v1/feed/{eventId}/tribute` | `{ amount, unit: 'denarius' }` |
| Tributar uma missão concluída | `POST /api/v1/missions/{slug}/tribute` | `{ executor_id, amount, unit: 'denarius' }` |
| Atualizar saldo pós-envio | invalidar `['wallet']` (`GET /wallet`) | — |

### 6.5 Microcopy (pt-BR + en) — chaves em `tributes.*`
| Chave | pt-BR | en |
|---|---|---|
| `action` | Tributar | Pay tribute |
| `title` | Enviar tributo | Send a tribute |
| `subtitle` | Reconheça {{name}} com moedas do seu tesouro | Honor {{name}} with coins from your treasury |
| `preset` | {{amount}} denarii | {{amount}} denarii |
| `custom` | Outro valor (5–100) | Other amount (5–100) |
| `confirm` | Enviar tributo | Send tribute |
| `sent` | Tributo enviado! | Tribute sent! |
| `sentDetail` | {{amount}} para {{name}} | {{amount}} to {{name}} |
| `remainingToday` | Restam {{count}} tributos hoje | {{count}} tributes left today |
| `balanceAfter` | Seu tesouro: {{amount}} | Your treasury: {{amount}} |
| `summary` | {{amount}} em tributos ({{count}}) | {{amount}} in tributes ({{count}}) |
| `alreadyTributed` | Você já honrou este feito | You've already honored this |
| `errors.range` | O tributo deve ser entre 5 e 100 denarii | Tributes must be between 5 and 100 denarii |
| `errors.balance` | Tesouro insuficiente para este tributo | Not enough coins in your treasury |
| `errors.dailyLimit` | Você já enviou seus 10 tributos de hoje | You've sent all 10 tributes for today |
| `errors.self` | Não se pode tributar a si mesmo | You cannot tribute yourself |
| `errors.notCompleted` | Esta missão ainda não foi concluída | This mission isn't completed yet |
| `notifications.types.coin_tribute` | {{name}} te enviou {{amount}} em tributo | {{name}} sent you {{amount}} as tribute |

### 6.6 Tempo real (SSE) + notificação
- **Notificação `coin_tribute`** (§20 do backend): já chega pelo SSE de notificações
  existente (`GET /notifications/events?token=<jwt>`) e pelo histórico. **Adicionar o case**
  em `src/screens/dashboard/components/buttons/notificationsButton/notificationMessage.ts`:
  ```ts
  case 'coin_tribute':
    return t('tributes.notifications.types.coin_tribute', {
      name: n.actor?.name, amount: p.amount_display });
  ```
  - Payload: `amount`, `amount_display`, `target_type`, `target_id`, `mission_slug?`;
    remetente vem resolvido em `actor`.
  - Ao tocar: `target_type === 'feed'` → `postDetail` com `target_id`;
    `target_type === 'mission'` → tela de missões.
- **Sem SSE dedicado de tributo** no v1 (o backend lista `feed_activity` como follow-up) —
  o total do post atualiza no refetch/optimistic update.

### Assets
- Nenhum asset novo obrigatório. Reusar `DenariusCoin` / `AureusCoin` / `AsCoin` e
  `CoinAmount`. Opcional: ícone SVG de "tributo" (mão com moeda / patera) em
  `src/components/icons/` — se não houver, usar `DenariusCoin`.

## 7. Critérios de aceite
- Botão **Tributar** aparece no `FeedCard` (feed, hashtagFeed, postDetail) exceto em posts
  próprios; modal segue o padrão `LegionSelectModal` (carrossel + dots + overlay de confirm).
- Envio bem-sucedido mostra valor enviado, saldo restante e tributos restantes do dia;
  o contador do post atualiza sem reload manual.
- Todos os erros (400/409/422 range/422 saldo/429) têm mensagem própria, nada de alert cru.
- Notificação `coin_tribute` renderiza e navega para o alvo certo.
- `npx tsc --noEmit` exit 0. Strings em **pt-BR e en**.

## 8. Fora de escopo
- Tributo em **comentários** e no **perfil** (backend não suporta no v1).
- Histórico de tributos enviados/recebidos (dependeria de uma tela de extrato da carteira —
  ver §9).
- Ranking de "mais tributado".

## 9. Riscos / dependências
- **BR-1 (backend, informativo)**: o app ainda **não consome `GET /wallet/transactions`**
  (`src/api/wallet/` só tem `balance`). O filtro `referenceType=tribute` existe, mas sem
  tela de extrato o usuário não vê o histórico. **Não bloqueia** esta task — sugerido como
  task separada (Wallet/Extrato).
- **Confirmar ao integrar** o shape exato de `tributes` nos itens do feed (o backend
  documenta `total/total_display/count/mine`) e as chaves do payload da notificação.
- **Distinção 422**: dois motivos diferentes (range vs. saldo) no mesmo status — mapear
  pela mensagem retornada; se ambíguo, abrir pedido de `error_code` ao backend.
