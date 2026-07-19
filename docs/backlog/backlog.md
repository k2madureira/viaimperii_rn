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

_Last updated: 2026-07-17 (estrutura simplificada para `tasks/` + `completed/`; front lê de `tasks/`)._

---

## ✅ Feitas — do NOT re-propose

Loops e sistemas já vivos (regras no `CLAUDE.md` do backend). **Front já cobre:**

- **Auth** (login, refresh, OAuth Google/GitHub, forgot-password, quiz de especialidade).
- **Ranks & XP** — curva de 36 patentes derivada do XP; trilhas (Legionários/Patrícios).
- **Missions** — daily/monthly, gate de engajamento, recomendação, peer review, SSE,
  campanhas, maestria/medalhas, 500 conquistas. + **Rewarded videos** (AdMob SSV).
- **Legions & provinces** — legiões abertas, dominante por província.
- **Economy** — ledger double-entry; `/rewards`; **daily-rewards** (tela `rewards`);
  loja rank-gated; professions.
- **Feed** social (timeline, follows, reações, comentários, hashtags/menções, SSE) +
  **hashtagFeed** + **postDetail**.
- **Notifications** — histórico + SSE (dropdown de sino na Home).
- **Login streak** — bônus linear, decay 3× (`StreakButton` tooltip).
- **Streak Shield** (F2) — **shipado no front** → `completed/streak-shield.md`.
- **Ranking all-time** (`/ranking`, consumido no dashboard).
- **AI Chronicler** (posts de crônica no feed).

> Backend já shipou **leaderboards semanais escopados** (§23) e **Legion Weekly Objective**
> (§24) — front ainda **não consome** (tasks F4/F5 abaixo). O `/ranking` all-time do dashboard
> continua existindo e coexiste com o placar semanal.

---

## 🔜 tasks/ — a fazer (frontend)

> Sistemas com contrato de API vivo, sem tela consumindo. Tasks **frontend-only** (salvo
> bloqueador de F3). Cada spec tem **§6 Frontend concreta**. Hand-off: `ft`.

| # | Task | Effort | ROI | Endpoints prontos | Spec | Status |
|--:|------|:------:|:---:|---|---|---|
| F1 | **Legion Treasury + Estandartes (UI)** — section no card da legião do viewer: saldo do cofre + histórico, modal de doação (padrão `LegionSelectModal`), loja de estandartes só p/ líder (carrossel) + countdown do buff ativo. | M | 4.0 | `GET /legions/{id}/treasury`, `POST .../treasury/donate`, `POST .../standard/{slug}` | `tasks/legion-treasury.md` | Ready for build |
| F3 | **Store Promotions (UI)** — faixa "Promoções da semana" no `market` + badge de desconto nos itens em promoção; countdown até `ends_at`. | M | 3.2 | `GET /promotions?active=true`, `GET /promotions/{id}` | `tasks/store-promotions.md` | Ready for build (bloqueador de backend a confirmar) |
| F4 | **Weekly Leaderboards (UI)** — nova screen `leaderboards`: placar semanal por escopo (global/legião/província/ofício), pin da linha do viewer, countdown de reset, badges de prêmio + notificação `leaderboard_prize`. | M | 4.5 | `GET /leaderboards`, `/leaderboards/history`, `/leaderboards/scopes` | `tasks/weekly-leaderboards.md` | Ready for build |
| F5 | **Legion Weekly Objective (UI)** — section no card da legião: barra de progresso da meta semanal + mini-placar de contribuição + recompensa (cofre + bônus) + notificação `legion_objective_completed`. | M | 4.2 | `GET /legions/{id}/objective`, `/objective/history` | `tasks/legion-weekly-objective.md` | Ready for build (após F1) |

**Build order (front):** **F1 → F5 → F4 → F3**. F5 sai logo após **F1 (Legion Treasury)** — dividem
o card expandido da legião e a recompensa do objetivo aponta pro cofre. **F3 tem dependência de
backend**: confirmar se os itens da loja já retornam preço **com desconto** + preço original (§9 da
spec) — se não, abrir task de backend; a faixa informativa pode shipar antes.

---

## ✅ completed/ — feitas (histórico de specs)

| # | Feature | Spec | Notas |
|--:|---------|---|---|
| F2 | **Streak Shield (UI)** | `completed/streak-shield.md` | Shipado no front (contador + compra no tooltip). Spec alinhada ao contrato real. **Pendência de backend BR-1** documentada na §9 da spec: expor o preço do escudo no `GET /users/{id}/streak` (hoje só vem pós-compra) para o confirm mostrar `{{price}}` na 1ª compra. |

---

## 🧭 Backlog priorizado (ROI = Reach×Impact ÷ Effort)

Próximo a construir no backend: **#1 Scoped Weekly Leaderboards**.

| # | Idea | Effort | ROI | Status |
|--:|------|:------:|:---:|--------|
| 1 | **Scoped Weekly Leaderboards** — global/legion/province/profession boards, reset segunda-SP, top-N pago do ledger; retorna a linha do próprio viewer. | M | 4.5 | Spec full-stack pronta; não construída. Próxima migration = **0066** |
| 2 | **Coin Tributes (peer tipping)** — enviar moedas a outro usuário num post/missão revisada; sink player-to-player via `transfer`. | S/M | 4.0 | Open |
| 3 | **Trophy Case + Rare-Unlock Broadcasts** — fixar medalhas/conquistas no perfil; unlocks raros auto-postam no feed. | S/M | 4.0 | Open |
| 4 | **Weekly Recap by a Chronista** — dispatch semanal personalizado em voz de persona via notificação + email; win-back. | S/M | 4.0 | Open |
| 5 | **Legion Weekly Objective** — meta compartilhada automática que deposita no cofre ao concluir (alimenta o loop de tesouro/estandarte). | M | 3.0 | Open — dependência (treasury) shipada; UI = F1 |
| 6 | **Cosmetic Drops on Mission Finalize** — drop cosmético de razão variável ao finalizar (recompensa surpresa). | M | 3.0 | Open |
| 7 | **Mission Combo Multiplier** — conclusões consecutivas no mesmo dia acumulam multiplicador de XP que reseta meia-noite SP. | M | 3.0 | Open |
| 8 | **Referral Rewards** — convide um amigo; ambos ganham moedas na 1ª missão concluída do amigo (reusa `invite_code` + ledger). | S/M | 2.7 | Open |
| 9 | **Profession Mastery Tiers** — leveling dentro de uma profissão (Aprendiz→Mestre) a partir das missões concluídas nela. | M | 2.0 | Open |
| 10 | **Province Conquest Season** — províncias como território sazonal disputado; legião vencedora ganha payout do cofre + cosmético sazonal. | L | 2.0 | Open — compõe sobre leaderboards + treasury; por último |

**Notas p/ o próximo run do PO:** **F1 & F3 têm precedência** (F2 já shipou) — é backend já pago
sem retorno de UX. Ordem de backend = **#1 → #2 → #5**; #10 por último.

---

## ❌ Rejected / Parked

_(nenhum ainda — adicionar aqui com motivo de uma linha ao descartar, para não re-propor.)_
