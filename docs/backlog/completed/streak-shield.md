# Streak Shield — Frontend

> Backend **já shipou** (migration 0065; endpoints live). Esta spec é **frontend-only**.
> Hoje o `StreakButton` mostra o streak mas **ignora** o escudo (contagem e compra).
> **Implementado pelo `ft`** — spec revisada 2026-07-17 para o **contrato real**
> do backend (fonte de verdade): ver "Correções pós-implementação" no fim.

- **Slug:** `streak-shield-frontend`
- **Backlog #:** F2 · **ROI:** 4.2 · **Esforço:** S
- **Status:** **Shipped (front)** — 1 pedido pendente ao backend (preço pré-compra, §9)
- **Autor (PO):** product-owner · **Data:** 2026-07-17

---

## 1. Problema / Oportunidade
O Streak Shield (consumível que absorve 1 dia perdido, amortecendo o decay 3×) existe no backend
mas não tem superfície no app. É retenção anti-churn pronta e invisível: o usuário não sabe que
pode se proteger nem consegue comprar o escudo.

## 2. Hipótese
Se mostrarmos a contagem de escudos e um botão de compra no tooltip de streak, usuários em risco
comprarão escudos (sink de moeda) e retornarão após faltas, medido por escudos comprados e por
recuperação de streak pós-falta.

## 3. Regras de negócio (backend, resumo)
- `streak_shields` = escudos que o usuário possui; `max_streak_shields` = teto.
- Comprar escudo debita moedas do usuário (ledger) e incrementa `streak_shields` até o teto.
- **Preço fixo no backend** = `50 denários` (`STREAK_SHIELD_PRICE`). O front **não hardcoda
  moeda** — só exibe `*_display` vindo do contrato.
- Um escudo absorve um dia perdido, evitando o decay 3× naquele dia (CLAUDE.md §13.1 / Shipped).
- Moeda com `*_display`.

## 4. Modelo de dados
Nenhuma mudança.

## 5. Contrato de API (real — validado em `streak_service.py`)
```
GET  /api/v1/users/{user_id}/streak                  (auth)
  content: StreakResponse { current_streak, longest_streak, last_login_date, timezone,
           bonus_pct, next_milestone, max_streak_days, is_max_bonus,
           streak_shields, max_streak_shields }
  # NÃO expõe o preço do escudo (ver §9 — pedido ao backend).

POST /api/v1/users/{user_id}/streak/shield           (auth, dono only)
  content: BuyShieldResponse { message, streak_shields, max_streak_shields,
           price, price_display, coin_balance, coin_balance_display }
  # price/price_display só existem DEPOIS da compra (na resposta).
```
**Erros (contrato real — backend é a fonte de verdade):**
- `401` — sessão inválida/ausente.
- `403` — o requisitante **não é o dono** do `user_id`.
- `409` — **teto de escudos atingido** (`streak_shields === max_streak_shields`).
- `422` — **saldo insuficiente** de moedas.

> ⚠️ **Atenção:** os semânticos de `409`/`422` são o **inverso** do que uma leitura ingênua
> sugeriria. `409` = teto; `422` = saldo. Não trocar.

---

## 6. Frontend (contrato para a ft)

### 6.1 Telas / entradas
- Estender o **`StreakButton`** (`src/screens/dashboard/components/buttons/streakButton/`) —
  o tooltip (`AnchoredPopover`) já mostra dias/bônus/próxima meta. **Adicionar** ao tooltip:
  - linha "Escudos: `streak_shields` / `max_streak_shields`" com `ShieldIcon`
    (`src/components/icons/shield/` já existe);
  - botão **"Comprar escudo"** que abre `components/modals/buyShieldModal/`.
- `buyShieldModal/` segue o **padrão `LegionSelectModal`** (card central, botão primário
  full-width, overlay de confirmação `absolute inset-0`) — sem Alert nativo. Mostra o saldo
  atual + a **explicação** do escudo. **Preço pré-compra é condicional** (ver §6.3/§9):
  enquanto o backend não expuser o preço no `GET /streak`, o modal **degrada** para
  explicação + saldo (sem `{{price}}` na primeira compra).
- Model: reusar `GET /users/{id}/streak` como fonte da contagem (o login já traz `streak`, mas
  para refletir compra usar a query dedicada `model/queries/useStreak.ts`); mutation
  `model/mutations/useBuyStreakShield.ts`.
- Ampliar o tipo `LoginStreak` (`src/api/auth/authApi.ts`) com `streak_shields` e
  `max_streak_shields` (o backend já os retorna).

### 6.2 Estados de UI (erros = contrato real)
| Estado | Origem | UI |
|---|---|---|
| loading | mutation pendente | spinner no botão do modal |
| sucesso | 200 | Toast "Escudo adquirido"; atualiza contagem no tooltip |
| erro geral | rede/500 | Toast erro + manter modal aberto |
| 401 | sessão | fluxo de re-login padrão |
| 403 | não é o dono do `user_id` | Toast erro genérico (não deveria ocorrer no fluxo próprio) |
| **409 teto** | `streak_shields === max_streak_shields` | esconder botão; texto "Escudos no máximo" |
| **422 saldo** | saldo de moedas insuficiente | Toast "Saldo insuficiente"; manter modal |
| desabilitado | teto atingido (`streak_shields === max_streak_shields`) | botão opaco 35% |

> Nota: como o preço **não** é conhecido antes da compra (§9), o front **não** consegue
> pré-desabilitar por "saldo < preço" — o `422` no submit é o gate de saldo.

### 6.3 Dados a exibir
- `content.streak_shields` / `content.max_streak_shields` (contador no tooltip) — de `GET /streak`.
- **`content.price_display`** — **CONDICIONAL**: hoje só vem em `BuyShieldResponse` (pós-compra).
  Exibir no confirm da **primeira** compra depende do pedido ao backend em §9. Até lá, o modal
  não mostra `{{price}}` no confirm inicial (degrada para explicação + saldo).
- `content.coin_balance_display` (saldo pós-compra) — de `BuyShieldResponse`.
- Após compra: atualizar tooltip com `streak_shields` de `BuyShieldResponse` e invalidar a
  query de wallet do header.

### 6.4 Ação → API
| Ação | Método + endpoint |
|---|---|
| Abrir tooltip de streak | (dado já em memória ou) `GET /api/v1/users/{userId}/streak` |
| Confirmar compra | `POST /api/v1/users/{userId}/streak/shield` |
- Após compra: invalidar `['streak', userId]` e a query de wallet.

### 6.5 Microcopy (pt-BR + en) — chaves `dashboard.streakShield.*`
| Chave | pt-BR | en |
|---|---|---|
| `count` | Escudos: {{have}}/{{max}} | Shields: {{have}}/{{max}} |
| `buy` | Comprar escudo | Buy shield |
| `buyConfirm` | Comprar 1 Escudo de Ofensiva por {{price}}? | Buy 1 Streak Shield for {{price}}? |
| `buyConfirmNoPrice` | Comprar 1 Escudo de Ofensiva? | Buy 1 Streak Shield? |
| `explain` | Absorve 1 dia perdido e protege sua ofensiva | Absorbs 1 missed day and protects your streak |
| `success` | Escudo adquirido! | Shield acquired! |
| `insufficient` | Saldo insuficiente | Insufficient balance |
| `maxed` | Escudos no máximo | Shields maxed out |

> `buyConfirm` (com `{{price}}`) só é usado quando o preço estiver disponível pré-compra (§9);
> senão usar `buyConfirmNoPrice`.

### 6.6 Tempo real (SSE)
- Não aplicável.

### Assets
- `ShieldIcon` já existe (`src/components/icons/shield/`). Moeda: `CoinAmount`.

## 7. Critérios de aceite
- Tooltip de streak mostra contagem de escudos; botão de compra abre modal padrão.
- Compra debita moeda, incrementa a contagem e reflete no header/wallet.
- `409` (teto) esconde/desabilita a compra; `422` (saldo) mostra "Saldo insuficiente".
- `npx tsc --noEmit` exit 0. Strings pt-BR **e** en.

## 8. Fora de escopo
- Lógica de consumo do escudo no decay (é do backend, já shipada).
- Uso manual do escudo (é automático no cálculo do streak).

## 9. Riscos / conflitos + pedido ao backend
- **Pedido ao PO/arquiteto de backend (aberto):** expor o **preço do escudo** no
  `GET /api/v1/users/{user_id}/streak` (ou num endpoint de config), para o modal exibir o
  confirm com `{{price}}`/`price_display` já na **primeira** compra. Hoje o preço (`50 denários`,
  `STREAK_SHIELD_PRICE`) só chega em `BuyShieldResponse`, **depois** da compra — por isso o front
  degrada para explicação + saldo. Enquanto isso não existir, `price_display` no confirm inicial
  fica **condicional/indisponível**.
- `LoginStreak` do login pode não trazer `streak_shields` em respostas antigas — tratar
  `undefined` como 0 até a query dedicada resolver.

---

## Correções pós-implementação (2026-07-17)
> Divergências encontradas pelo `ft` ao implementar; spec alinhada ao backend real.
1. **Códigos de erro invertidos.** Spec original dizia `409 = saldo OU teto` e `422 = payload`.
   Backend real (`streak_service.py:150-188`): **`409 = teto de escudos`**, **`422 = saldo
   insuficiente`**, **`403 = não é o dono`**. §5 e §6.2 corrigidas. Front foi implementado
   conforme o backend real.
2. **Sem preço pré-compra.** Nenhum endpoint expõe o preço antes da compra (`GET /streak` não
   traz; só `BuyShieldResponse` retorna, pós-compra). Front degrada para explicação + saldo.
   Pedido ao backend registrado em §9 e no `backlog.md`.
