# Via Imperii — Product Backlog & State (LOCAL, repo do app)

**Fonte de verdade do PO = LOCAL.** O backlog/estado do Product Owner vive **aqui**, dentro do
repo do app (`E:\projetos\mobile\ViaImperiiExpo\docs\backlog\`).

> 📁 **Estrutura (fonte de verdade):**
> - `docs/backlog/tasks/<slug>.md` → **features que devem ser feitas** (o front lê aqui p/ saber o que implementar).
> - `docs/backlog/completed/<slug>.md` → **features já concluídas** (histórico do que shipou).
> - `docs/backlog/backlog.md` → este índice/estado vivo, com prioridades e ponteiros.
>
> Ao concluir uma feature, **mover** o arquivo de `tasks/` → `completed/` e atualizar a tabela abaixo.

> ℹ️ **Regra de git:** este é o **repo do app** — seguir a regra normal do projeto:
> **só commitar/pushar quando o usuário pedir**.

_Last updated: 2026-07-23 (**F6 Coin Tributes** shipada — PR #33, merge `4b7d417`,
release `v1.3.0` — e movida para `completed/`, junto com o fechamento atrasado de
**F1 Legion Treasury** (PR #31) e **F8 Legion Leaderboard** (PR #32). Build order do
front passa a ser **F5 → F7 → F3**, com **F5 Legion Weekly Objective** como próxima
task. O passo de fechar a task nas docs virou parte do skill `/close-feature`.)_

---

## ✅ Feitas — do NOT re-propose

Loops e sistemas já vivos (regras no `CLAUDE.md` do backend). **Front já cobre:**

- **Auth** (login, refresh, OAuth Google/GitHub, forgot-password, quiz de especialidade).
- **Ranks & XP** — curva de 36 patentes derivada do XP; trilhas (Legionários/Patrícios).
- **Missions** — daily/monthly, gate de engajamento, recomendação, peer review, SSE,
  campanhas, maestria/medalhas, 500 conquistas. + **Rewarded videos** (AdMob SSV).
- **Legions & provinces** — legiões abertas, dominante por província.
- **Legion Treasury + Estandartes** (F1) — **shipado no front** (cofre + doações, votação de
  estandarte com SSE, Praefectus derivado, split QG/War Room) → `completed/legion-treasury.md`.
- **Legion Leaderboard** (F8) — **shipado no front** (ranking de legiões como corpo da War Room,
  escopos Global/País/Província, sorting, top member) → `completed/legion-leaderboard.md`.
- **Coin Tributes** (F6) — **shipado no front** (tributo em moedas no `FeedCard` das 3 telas +
  na aprovação que finaliza a missão, notificação `coin_tribute`) → `completed/coin-tributes.md`.
- **Economy** — ledger double-entry; `/rewards`; **daily-rewards** (tela `rewards`);
  loja rank-gated; professions (compra + filtro de missões).
- **Feed** social (timeline, follows, reações, comentários, hashtags/menções, SSE) +
  **hashtagFeed** + **postDetail**.
- **Notifications** — histórico + SSE (dropdown de sino na Home).
- **Login streak** — bônus linear, decay 3× (`StreakButton` tooltip).
- **Streak Shield** (F2) — **shipado no front** → `completed/streak-shield.md`.
- **Ranking all-time** (`/ranking`, consumido no dashboard).
- **Weekly Leaderboards** (F4) — **shipado no front** (screen `leaderboards` + `src/api/leaderboards/`)
  → `completed/weekly-leaderboards.md`. Coexiste com o `/ranking` all-time do dashboard.
- **AI Chronicler** (posts de crônica no feed).

> Backend já shipou **Legion Weekly Objective** (§24) e **Profession Mastery Tiers**
> (§25, migration 0069) — front ainda **não consome** (tasks F5/F7 abaixo).

---

## 🔜 tasks/ — a fazer (frontend)

> Sistemas com contrato de API vivo, sem tela consumindo. Tasks **frontend-only** (salvo
> bloqueador de F3). Cada spec tem **§6 Frontend concreta**. Hand-off: `ft`.

| # | Task | Effort | ROI | Endpoints prontos | Spec | Status |
|--:|------|:------:|:---:|---|---|---|
| F5 | **Legion Weekly Objective (UI)** — section no card da legião: barra de progresso da meta semanal + mini-placar de contribuição + recompensa (cofre + bônus) + notificação `legion_objective_completed`. | M | 4.2 | `GET /legions/{id}/objective`, `/objective/history` | `tasks/legion-weekly-objective.md` | Ready for build (F1 já shipado — desbloqueada) |
| F7 | **Profession Mastery Tiers (UI)** — badge de tier + barra de progresso da profissão no `market`, `professionHero` e `professionMissions`; modal de tier-up com bônus em moedas; notificação `profession_tier_up`. | S/M | 3.4 | `mastery` em `GET /users/{id}/professions`; `profession_tier_ups[]` em complete/approve | `tasks/profession-mastery-tiers.md` | Ready for build |
| F3 | **Store Promotions (UI)** — faixa "Promoções da semana" no `market` + badge de desconto nos itens em promoção; countdown até `ends_at`. | M | 3.2 | `GET /promotions?active=true`, `GET /promotions/{id}` | `tasks/store-promotions.md` | Ready for build (bloqueador de backend parcialmente resolvido: `Profession` já traz `discount_pct`/`on_sale`/`effective_price_display`; **falta confirmar** os mesmos campos em assets/produtos físicos) |

**Build order (front):** **F5 → F7 → F3**.
- **F5 primeiro**: o cofre (F1) já shipou, então a recompensa do objetivo tem onde aterrissar
  — as duas dividem o card expandido da legião.
- **F7** é a mais barata (só estende tipos + 3 pontos de render) — bom candidato a slot curto.
- **F3** por último: depende de confirmar os campos de desconto fora de professions.

---

## ✅ completed/ — feitas (histórico de specs)

| # | Feature | Spec | Notas |
|--:|---------|---|---|
| F2 | **Streak Shield (UI)** | `completed/streak-shield.md` | Shipado no front (contador + compra no tooltip). **Pendência de backend BR-1** na §9 da spec: expor o preço do escudo no `GET /users/{id}/streak` (hoje só vem pós-compra) para o confirm mostrar `{{price}}` na 1ª compra. |
| F4 | **Weekly Leaderboards (UI)** | `completed/weekly-leaderboards.md` | Shipado no front (`src/screens/leaderboards/` + `src/api/leaderboards/` + facade `viaimperiiApi.leaderboards`). Commit `ce60c7f` / PR #29. |
| F1 | **Legion Treasury + Estandartes (UI)** | `completed/legion-treasury.md` | Shipado no front (`src/api/legionTreasury/` + `src/screens/legions/HQ/` + War Room). Inclui votação de estandarte via SSE (§14.1) e Praefectus derivado. Merge `d4261be` / PR #31. |
| F8 | **Legion Leaderboard (UI)** | `completed/legion-leaderboard.md` | Shipado no front (`src/api/legionLeaderboard/` + `legions/components/sections/legionBoard/`). Ranking como corpo da War Room, com preview grátis e gate. Merge `7574237` / PR #32. |
| F6 | **Coin Tributes (UI)** | `completed/coin-tributes.md` | Shipado no front (`src/api/tributes/` + `feed/TributeButton\|TributeModal\|TributeSummaryRow`). **Duas divergências da spec** (registradas no PR): a ação na fila de revisão dispara na aprovação que finaliza a missão, não num botão do `reviewItem` (que ficaria sempre desabilitado, pois a fila só tem `PENDING_REVIEW`); e o contador reconcilia pela resposta do servidor, sem update otimista (o valor é digitado em denários e o front não faz aritmética de moeda). Merge `4b7d417` / PR #33 / release `v1.3.0`. |

---

## 🧭 Backlog priorizado (ROI = Reach×Impact ÷ Effort)

Backend já shipou #1, #2, #5 e #9 — a fila de valor agora está **no front** (F5/F7).

| # | Idea | Effort | ROI | Status |
|--:|------|:------:|:---:|--------|
| 1 | **Scoped Weekly Leaderboards** | M | 4.5 | ✅ Shipped (backend + front) |
| 2 | **Coin Tributes (peer tipping)** | S/M | 4.0 | ✅ Shipped (backend + front, F6) |
| 3 | **Trophy Case + Rare-Unlock Broadcasts** — fixar medalhas/conquistas no perfil; unlocks raros auto-postam no feed. | S/M | 4.0 | Open (backend) |
| 4 | **Weekly Recap by a Chronista** — dispatch semanal personalizado em voz de persona via notificação + email; win-back. | S/M | 4.0 | Open (backend) |
| 5 | **Legion Weekly Objective** | M | 3.0 | ✅ Backend shipped (0068) — **UI = F5** |
| 6 | **Cosmetic Drops on Mission Finalize** — drop cosmético de razão variável ao finalizar. | M | 3.0 | Open (backend) |
| 7 | **Mission Combo Multiplier** — conclusões consecutivas no mesmo dia acumulam multiplicador de XP que reseta meia-noite SP. | M | 3.0 | Open (backend) |
| 8 | **Referral Rewards** — convide um amigo; ambos ganham moedas na 1ª missão do amigo (reusa `invite_code` + ledger). | S/M | 2.7 | Open (backend) |
| 9 | **Profession Mastery Tiers** | M | 2.0 | ✅ Backend shipped (0069) — **UI = F7** |
| 10 | **Wallet / Extrato (UI)** — consumir `GET /wallet/transactions` (hoje `src/api/wallet/` só tem `balance`): histórico com filtros `referenceType` (tribute, profession_tier_up, legion_objective_bonus, rank_up…). | S | 3.0 | **Novo (2026-07-20)** — gap de front sobre backend já pago; agora que F6 shipou, é o complemento natural: sem extrato o usuário não vê o histórico de tributos enviados/recebidos |
| 11 | **Province Conquest Season** — províncias como território sazonal disputado. | L | 2.0 | Open (backend) — compõe sobre leaderboards + treasury; por último |

**Notas p/ o próximo run do PO:** o backend está **à frente do front em 2 features**
(F5/F7). Não abrir novas ideias de backend antes de fechar essa dívida de UI —
é backend já pago sem retorno de UX. Próxima ideia de backend na fila: **#3 Trophy Case**.

---

## ❌ Rejected / Parked

| Item | Motivo |
|---|---|
| _Discovery do backend_ (`viaimperii/docs/product/backlog/discovery/`: clans, chat, friends, VIP subscription, wearables, avatares passivos…) | Ainda **idea-level, sem contrato de API** — não vira task de front até o backend shipar. |
