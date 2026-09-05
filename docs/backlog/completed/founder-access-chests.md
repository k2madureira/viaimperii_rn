# Founder Access + Baús de Riquezas — Frontend

> Backend **já shipou** (§34 Founder Access, §35 Baús/Códigos). Esta spec é
> **frontend-only**: consumir o contrato existente. Sem front, a pré-inscrição de
> fundador, o resgate e os baús ficam invisíveis no app.

- **Slug:** `founder-access-chests-frontend`
- **Backlog #:** F9 · **ROI:** — · **Esforço:** L
- **Status:** ✅ Shipado no front (branch `feature/founder-chests`, commit `c0d28c9`) — 2026-09-05 · PR pendente
- **Autor:** implementação direta a partir do contrato de API do PO · **Data:** 2026-09-05

---

## 1. Problema / Oportunidade
O backend tem **Founder Access** (§34: pré-inscrição pública → código por e-mail →
resgate autenticado que vira Recruit IV + concede o Baú do Fundador) e **Baús de
Riquezas** (§35: baús com slots de recompensa escolhível + resgate de códigos
promocionais), mas nada disso aparece no app.

## 2. Regras de negócio (do backend, resumo)
- **Founder**: pré-inscrição amarra o e-mail (resgate exige conta com o **mesmo
  e-mail** → 403 se divergir). Resgate → `is_founder`, `founder_number`, Recruit IV,
  `must_choose_track: true`, e Baú do Fundador (fechado) em `GET /chests`.
- **Baús**: abrem **1×**; `options` some depois de aberto (`selections` fixo). Avatar
  → posse (`user_assets`); missão → ativa profissão grátis. `reward_ref` sempre vem
  das `options`.
- **Códigos**: resgate promocional concede um baú fechado (abrir depois).
- Insígnia `is_founder` vem em **todo autor** resolvido (feed, comentários, ranking,
  notificações, menções, busca, fila de revisão).

## 3. Modelo de dados (front)
Nenhuma mudança de persistência. Campos novos consumidos:
- `LoginResponse` / `GetUserResponse`: `is_founder`, `founder_number`.
- `FeedAuthor`, `ToReviewExecutor`, `RankingItem`: `is_founder`, `founder_number` (opcionais, best-effort).

## 4. Camada de API (§0.3)
- `src/api/founder/` — `preRegister`, `availability`, `redeem` (`/users/me/founder`, mantido p/ compat, não usado na UI).
- `src/api/chests/` — `list`, `detail`, `open`.
- `src/api/codes/` — `redeem` **unificado**: `POST /codes/redeem` roteia pelo hash do
  código → `kind:"founder"` (fluxo de fundador + Baú do Fundador) ou `kind:"promo"` (baú);
  404 se não achar em nenhuma tabela. Resposta traz `kind` + `founder{...}` (só fundador).
- `src/api/config/defaultApi.ts` — `ApiError` (carrega `status` HTTP) + `throwApiError`,
  para mapear 404/410/409/403/422 em copy localizada.
- Facade `viaimperiiApi.{founder,chests,codes}`.

## 5. Telas / componentes
- **auth/founderPreRegister** — landing pública (vagas restantes + form), link no Login.
- **redeemCode** — **resgate unificado** (promo + fundador); ramifica pelo `kind` da
  resposta. `kind:founder` → sucesso Recruit IV/founder_number → `Ranks` (trilha); ambos
  → baú em `Chests`. Entrada em **TODOS** os dropdowns do `UserMenu` + botão da tela Baús.
- **chests** — lista + summary; entrada no `UserMenu`.
- **chests/chestDetail** — seletor de abertura por slot em **carrossel (§0.1)**:
  setas ‹ ›, dots, confirmação temática (sem Alert), estado "recompensas concedidas".
  - **Avatar**: filtro de raridade + grid de miniaturas.
  - **Profissão** (slot de missão): **card estilo mercado** (imagem do livro/`icon_url`
    + título + descrição), **1 card por profissão** (missão escolhida aleatoriamente por
    profissão como `reward_ref`; casa com o catálogo `['professions']`) + nota de que abrir
    **ativa a profissão inteira** (todas as missões dela entram no pool, 1.5×).
- **components/founderBadge** (global) + **components/icons/chest** (SVG).

## 6. Wiring da insígnia (`FounderBadge`)
Ligado onde há render estruturado de autor: **feed** (`FeedCard`), **comentários**
(`commentRow` + `CommentsModal`), **fila de revisão** (`reviewItem`).
- **Ranking**: DTO pronto, mas `useRanking` não tem consumidor renderizado hoje → nada a ligar.
- **Notificações/menções**: texto templated (badge não encaixa) → não ligado.

## 7. Fora de escopo
- **§35 C (Admin — CRUD de baús/códigos)**: este app é consumer, **sem UI de admin**
  (`require_admin` é painel/backend). Não implementado.

## Divergências
- Badge não coberto em ranking/notificações/menções (ver §6) — decisão de render, não de contrato.
- Implementação direta (sem spec PO prévia); esta spec documenta o que shipou.
