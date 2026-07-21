# Legion Leaderboard (Ranking de Legiões) — Frontend

> Backend **já shipou** (commit `3a6f736`, sem migration; `docs/business-rules/legions/legion-leaderboard.md`).
> Esta spec é **frontend-only**: consumir o contrato existente.
> Preenche a tela **War Room**, que hoje é o conteúdo pago e não entrega números.

- **Slug:** `legion-leaderboard-frontend`
- **Backlog #:** F8 · **ROI:** 4.4 · **Esforço:** M
- **Status:** Ready for build
- **Autor (PO):** claude · **Data:** 2026-07-20

---

## 1. Problema / Oportunidade

A `WarRoom` (antiga tela de Legiões) virou **conteúdo pago**: a promessa é "espiar os números
das outras legiões". Ela entrega hoje um **catálogo** — carrossel de brasões, descrição e
territórios. Nada ali é um número comparável, e nada responde "somos fortes?".

Do lado do produto o buraco é maior: o app tem identidade coletiva forte (legião, cofre §14,
objetivo semanal §24, Estandarte §14.1) e **nenhum lugar onde uma legião se compara a outra**.
O ciclo `objetivo → cofre → Estandarte` só se media contra a própria meta. Sem placar externo,
não existe motivo para uma legião querer ser melhor que a vizinha.

Vender acesso a uma tela que não tem números é o pior dos dois mundos: cobra e não entrega.

## 2. Hipótese

Se a War Room mostrar o ranking de legiões por esforço da semana, com o escopo territorial e a
posição da legião do viewer, então o acesso pago passa a ter valor percebido e o loop coletivo
ganha um alvo externo — medido por doações ao cofre e propostas de Estandarte abertas após a
primeira visita ao board.

## 3. Regras de negócio (backend, resumo)

- **Ordenação default = `xp_week`, não tamanho.** Rankear por nº de membros produz o efeito
  "grande porque é grande": o topo fica no topo sem fazer nada. `xp_week` mede **esforço atual**
  e reseta com a semana SP, junto do objetivo semanal e dos placares de usuário.
- **Escopo é territorial; a legião é global.** `province`/`country` contam **só os membros
  localizados ali** — uma legião espalhada pode perder o board local sendo grande no total.
  É a leitura desejada de "a legião mais forte **aqui**".
- **`active_members` E `total_members`, sempre os dois.** Um sozinho esconde metade da verdade.
  A Legio X Equestris aparece com **208 totais e 0 ativos** — exatamente o que um número só
  teria enterrado. `active` = XP nos últimos 7 dias (janela **diferente** da semana SP: uma
  legião pode estar ativa e ter ganho o XP antes de segunda).
- **`avg_xp_per_active`** existe para deixar legião pequena e dedicada competir.
- Legião com 0 de XP na semana **aparece com zero**, não some (LEFT JOIN) — é o que torna o
  board legível no começo da semana.

## 4. Modelo de dados

Nenhuma mudança. Consome o que existe.

## 5. Contrato de API (já existente)

```
GET /api/v1/legions/leaderboard          (auth)
  query: scope=global|country|province   (default global)
         countryId | provinceId          (exigido conforme o escopo)
         sortField=xp_week|active_members|total_members|missions_week|
                   avg_xp_per_active|treasury      (default xp_week)
         sortOrder=asc|desc               (default desc)
         limit=1..50                      (default 10)

  content: LegionLeaderboardResponse {
    scope, scope_id, scope_name,
    week: { iso_year, iso_week, starts_at, ends_at },   // offset SP
    sort_field, sort_order,
    viewer_legion: LegionBoardItem | null,
    items: LegionBoardItem[]
  }
```

`LegionBoardItem`:

```jsonc
{
  "position": 1, "legion_id": 11, "name": "Legio II Augusta",
  "symbol": null, "image_url": "...", "thumb_url": "...", "specialty_id": 1,
  "active_members": 12, "total_members": 208,
  "xp_week": 18450, "missions_week": 132,
  "avg_xp_per_active": 1537,
  "treasury_balance": 200000, "treasury_balance_display": "2 aurei",
  "active_standard": { "slug": "aquila", "name": "Aquila",
                       "multiplier_pct": 20, "remaining_seconds": 43200 },
  "top_member": { /* FeedAuthor: rank, active_avatar, is_legion_leader */ }
}
```

**Erros**: `422` escopo inválido ou id obrigatório ausente · `404` país/província inexistente.
`sortField` desconhecido **não** é erro — cai no default.

> ⚠️ **`viewer_legion`** repete a linha da legião do requisitante **quando ela fica fora do
> top-N**. `null` se ele não tem legião, ou se ela não tem membros no escopo.

---

## 6. Frontend (contrato para a ft)

### 6.1 Telas / entradas

- Tela **`WarRoom`** (`src/screens/legions/`) — hoje `LegionBadges` (carrossel) +
  `LegionCenturionSection`. O **board vira o corpo da tela**; o carrossel permanece como
  seletor secundário (identidade/brasão), **abaixo** do board.
- Novo módulo de API `src/api/legionLeaderboard/` (§0.3): `dto.ts` + `board.ts`
  (`getLegionLeaderboard`) + `index.ts`, registrado no facade como
  `viaimperiiApi.legionLeaderboard.board`.
- Nova query: `WarRoom` ganha `model/queries/useLegionLeaderboard.ts`
  (key `['legion-leaderboard', scope, scopeId, sortField]`).

- **Componentes** (contexto do CLAUDE.md §0.2, dentro de `src/screens/legions/components/`):
  - `cards/legionBoardRow/` — linha do board: `position`, brasão (`thumb_url`), nome,
    **`active_members`/`total_members`**, métrica em destaque conforme o `sortField` ativo,
    selo de `active_standard` e `top_member` (avatar + selo de Praefectus).
  - `cards/viewerLegionRow/` — a linha do viewer **fixada no rodapé** quando fora do top-N;
    mesma anatomia da linha normal, com destaque de "sua legião".
  - `buttons/scopeTab/` — abas Global / País / Província.
  - `filters/boardSortChips/` — chips de ordenação.
  - `skeletons/boardSkeleton/` — placeholder de N linhas (padrão `legionSkeleton`).
  - `sections/legionBoard/` — dona da query, compõe abas + chips + linhas + rodapé do viewer.

### 6.2 Estados de UI

| Estado | Origem | UI |
|---|---|---|
| loading | query pendente | `skeletons/boardSkeleton` |
| sucesso | 200 | abas + chips + linhas + `viewer_legion` fixado |
| vazio | `items: []` | `feedback/emptyBox` "Nenhuma legião neste escopo" |
| erro geral | rede/500 | `feedback/errorState` (reusar o da tela) + retry |
| 422 | escopo sem id | não deve acontecer: a aba só habilita país/província quando o viewer tem um; se ocorrer, cair para `global` e avisar por Toast |
| 404 | país/província inexistente | cair para `global` + Toast |
| `viewer_legion: null` | sem legião, ou sem membros no escopo | rodapé não renderiza (não inventar linha zerada) |
| legião com `xp_week: 0` | começo da semana | renderiza normalmente com 0 — **não** filtrar |

### 6.3 Dados a exibir

- **Efetivo**: sempre `active_members` **e** `total_members` juntos, ex.: "12 ativos · 208
  totais". Nunca só um — o contraste é a informação.
- **Métrica em destaque** acompanha o `sortField` ativo (ordenar por cofre e destacar XP faria
  a lista parecer fora de ordem — mesmo erro já cometido no ranking do Praefectus).
- **`active_standard`**: selo com `multiplier_pct` e countdown de `remaining_seconds`
  (reusar `useStandardCountdown` de `legions/model/hooks/`).
- **`top_member`**: avatar + nome; renderizar `is_legion_leader` como selo de Praefectus —
  **primeiro lugar do app a exibir esse campo**, que já vem em todo payload de autor.
- **Semana**: `week.ends_at` como countdown ("reseta em 2d 4h"). Sem prazo visível, "XP da
  semana" não gera urgência.
- **Moedas**: `treasury_balance` via `CoinAmount` (valor atômico), nunca `treasury_balance`
  cru.

### 6.4 Ação → API

| Ação | Método + endpoint | Query |
|---|---|---|
| Abrir a War Room | `GET /legions/leaderboard` | `scope=global&limit=10` |
| Trocar aba de escopo | idem | `scope=province&provinceId={viewer}` |
| Trocar ordenação | idem | `sortField={chip}` |

- O escopo país/província usa a **província do viewer** (já disponível em
  `useUserProfile().data.province`, com `country` aninhado). Aba desabilitada se ele não tiver.

### 6.5 Microcopy (pt-BR + en) — chaves novas em `legions.board.*`

| Chave | pt-BR | en |
|---|---|---|
| `title` | Ranking de Legiões | Legion Ranking |
| `scopeGlobal` | Global | Global |
| `scopeCountry` | País | Country |
| `scopeProvince` | Província | Province |
| `sortXpWeek` | XP da semana | Weekly XP |
| `sortAvgXp` | Média por ativo | Avg per active |
| `sortMissions` | Missões | Missions |
| `sortActive` | Ativos | Active |
| `members` | {{active}} ativos · {{total}} totais | {{active}} active · {{total}} total |
| `yourLegion` | Sua legião | Your legion |
| `weekResets` | Reseta em {{time}} | Resets in {{time}} |
| `empty` | Nenhuma legião neste escopo | No legions in this scope |
| `scopeHint` | A mais forte **aqui** — conta só os membros deste território | The strongest **here** — counts only members in this territory |

### 6.6 Tempo real (SSE)

Nenhum stream. Refetch on-focus; o countdown da semana é client-side a partir de `week.ends_at`.

---

## 7. Critérios de aceite

- War Room abre no board global ordenado por `xp_week`, com abas de escopo e chips de ordenação.
- Cada linha mostra ativos **e** totais; a métrica em destaque acompanha a ordenação ativa.
- Legião do viewer aparece fixada no rodapé quando fora do top-N; some quando `viewer_legion`
  é `null`.
- Legião com `xp_week: 0` aparece no board.
- `npx tsc --noEmit` exit 0. Strings em pt-BR **e** en.

## 8. Fora de escopo

- Histórico de semanas fechadas (o board é sempre da semana corrente; congelar exigiria
  snapshots como §23).
- Board por média num placar separado (evolução registrada no backend).
- As regras de compra do acesso à War Room (ainda não existem no backend — o botão segue
  desabilitado atrás de `WAR_ROOM_UNLOCKED`).

## 9. Riscos / conflitos

- **`sortField=treasury` mente sutilmente.** O saldo é somado do ledger, fora do agregado, e
  ordenado **sobre a página já rankeada por `xp_week`** — o resultado é "as N melhores por XP,
  reordenadas por cofre", **não** o top-N global por cofre. **Decisão: não expor esse chip na
  v1.** Se for exposto depois, o rótulo tem de dizer o que ele realmente é.
- **Legião grande ainda pesa**: `xp_week` é soma. Mitigado pelo chip `avg_xp_per_active`.
- **Duas janelas diferentes na mesma tela**: `active_members` usa 7 dias corridos; `xp_week`
  usa a semana SP. Uma legião pode aparecer com ativos e XP baixo (ganhou antes de segunda).
  Não é bug — mas a microcopy não deve sugerir que os dois medem a mesma coisa.
- **Dívida herdada do backend**: `quantityUsers` de `GET /provinces/{id}` conta **todos** os
  membros enquanto `dominant_legion`, na **mesma resposta**, conta **ativos**. Os territórios
  do QG usam `quantityUsers` hoje. O backend registrou como não corrigido por ser breaking —
  se o board e os territórios mostrarem números diferentes para a mesma província, **é isso**.

## 10. Ordem de build recomendada

1. **Board + abas de escopo + `viewer_legion`** — a tela funcionando; já justifica o acesso pago.
2. **Chips de ordenação** (com `avg_xp_per_active`, sem `treasury`).
3. **Decorações**: selo de Estandarte ativo, `top_member` com selo de Praefectus, countdown
   da semana.
