# Legion Treasury + Estandartes — Frontend

> Backend **já shipou** (PR #42). Esta spec é **frontend-only**: consumir o contrato existente.
> Sem seção de front, o cofre e os estandartes ficam invisíveis no app.

- **Slug:** `legion-treasury-frontend`
- **Backlog #:** F1 · **ROI:** 4.0 · **Esforço:** M
- **Status:** Ready for build
- **Autor (PO):** product-owner · **Data:** 2026-07-17

---

## 1. Problema / Oportunidade
O backend tem cofre de legião, doações de membros e compra de estandarte (buff de XP para toda
a legião), mas **nada disso aparece no app**. É um loop de retenção coletiva pronto e desligado:
membros não têm como doar nem ver o tesouro; líderes não têm como içar estandarte.

## 2. Hipótese
Se expusermos o cofre + doação + estandarte na tela de Legiões, membros doarão moedas
(sink de economia) e líderes ativarão buffs, medido por doações/semana e estandartes içados.

## 3. Regras de negócio (do backend, resumo)
- Cofre é uma conta no ledger double-entry; doação move moedas do usuário → cofre (`transfer`).
- **Estandarte** = buff temporário de XP para toda a legião; **só o líder** pode içar; custa do
  cofre; tem `multiplier_pct` e `duration_hours`. Um ativo por vez (`active_standard`).
- Moeda sempre com campos `*_display` (não fazer aritmética no front).
- Detalhes em `CLAUDE.md` §14 (Legion Treasury + Estandartes).

## 4. Modelo de dados
Nenhuma mudança. Consome o que existe.

## 5. Contrato de API (já existente)
```
GET  /api/v1/legions/{legion_id}/treasury            (auth)
  content: TreasuryResponse { legion_id, balance, balance_display,
           active_standard: ActiveStandard|null, standards: StandardOption[],
           transactions: TreasuryTransaction[] }

POST /api/v1/legions/{legion_id}/treasury/donate     (auth)
  body: DonateRequest { amount:int, unit:string }   # unit = denominação da moeda
  content: DonateResponse { message, legion_id, donated, donated_display,
           balance, balance_display, your_balance, your_balance_display }

POST /api/v1/legions/{legion_id}/standard/{slug}     (auth, LÍDER only)
  content: BuyStandardResponse { message, standard: ActiveStandard,
           cost, cost_display, balance, balance_display }
```
Sub-schemas:
- `ActiveStandard { slug, name, multiplier_pct, starts_at, ends_at, remaining_seconds }`
- `StandardOption { slug, name, multiplier_pct, duration_hours, price, price_display, affordable }`
- `TreasuryTransaction { tx_type, reference_type, amount, amount_display, memo, created_at }`
- `DonateResponse.your_balance*` = saldo pessoal do doador após a doação.

**Erros esperados** (mapear no front): `401` sessão, `403` içar estandarte sem ser líder,
`409` saldo insuficiente / estandarte já ativo, `422` amount/unit inválidos.

---

## 6. Frontend (contrato para a ft)

### 6.1 Telas / entradas
- Tela **`legions`** (`src/screens/legions/`). Hoje só tem a section `legionBadges`
  (brasões + card expandido). **Adicionar nova section** `sections/legionTreasury/` renderizada
  no card expandido da **legião do próprio usuário** (a legião ativa do viewer).
  - Nova pasta de model: `legions/model/queries/useLegionTreasury.ts` (React Query, key
    `['legion-treasury', legionId]`), `model/mutations/useDonateToTreasury.ts`,
    `model/mutations/useHoistStandard.ts`.
- **Componentes** (contexto do CLAUDE.md §0.2):
  - `components/cards/treasuryCard/` — cabeçalho do cofre: saldo (`CoinAmount` a partir de
    `balance`), estandarte ativo (nome + `multiplier_pct` + countdown de `remaining_seconds`).
  - `components/cards/treasuryTxRow/` — linha do histórico (`transactions[]`).
  - `components/buttons/donateButton/` — abre o modal de doação.
  - `components/modals/donateModal/` — **reusa o padrão `LegionSelectModal`** (card central
    `bg-black/60` + `bg-white rounded-[20px] p-6`, botão primário full-width, overlay de
    confirmação `absolute inset-0`). Input de valor + seletor de denominação (`unit`), com
    saldo pessoal do viewer visível. **Nada de Alert nativo.**
  - `components/modals/standardModal/` — **só para o líder**: carrossel (padrão
    `LegionSelectModal`, setas `‹ ›`, dots) percorrendo `standards[]` (StandardOption); cada card
    mostra `name`, `multiplier_pct`, `duration_hours`, `price_display`; botão primário
    desabilitado quando `affordable === false`; overlay de confirmação antes de içar.
- Sabor romano na microcopy ("Cofre da Legião", "Içar Estandarte", "Tributo ao Cofre").

### 6.2 Estados de UI
| Estado | Origem | UI |
|---|---|---|
| loading | query pendente | `skeletons/treasurySkeleton/` (padrão `legionSkeleton`) |
| sucesso | 200 | card do cofre + lista de transações |
| vazio | `transactions: []` | `feedback/emptyBox` "Nenhum tributo ainda" |
| erro geral | rede/500 | `feedback/errorState` (reusar o da tela) + retry |
| 401 | sessão | encaminhar ao fluxo de re-login (padrão do app) |
| 403 (estandarte) | não é líder | botão "Içar Estandarte" **não renderiza** para não-líder |
| 409 doação | saldo insuficiente | Toast erro "Saldo insuficiente" + manter modal aberto |
| 409 estandarte | já ativo / cofre insuficiente | Toast erro + card mostra o ativo |
| 422 | amount/unit inválidos | erro inline no input do `donateModal` |
| botão desabilitado | `StandardOption.affordable === false` | botão primário opaco 35% |

### 6.3 Dados a exibir
- Cofre: `content.balance_display` (via `CoinAmount` sobre `content.balance`).
- Estandarte ativo: `content.active_standard.name`, `.multiplier_pct` (ex.: "+15% XP"),
  countdown a partir de `.remaining_seconds`.
- Loja de estandartes (líder): iterar `content.standards[i]` →
  `name`, `multiplier_pct`, `duration_hours`, `price_display`, `affordable`.
- Histórico: `content.transactions[i]` → `amount_display`, `memo`, `created_at`
  (formatar com `formatRelativeTime`), sinal por `tx_type`.
- Pós-doação: usar `your_balance_display` para atualizar o saldo pessoal exibido (invalidar
  também a query de wallet).

### 6.4 Ação → API
| Ação | Método + endpoint | Body |
|---|---|---|
| Abrir cofre (viewer na sua legião) | `GET /api/v1/legions/{legionId}/treasury` | — |
| Confirmar doação | `POST /api/v1/legions/{legionId}/treasury/donate` | `{ amount, unit }` |
| Içar estandarte (líder) | `POST /api/v1/legions/{legionId}/standard/{slug}` | — |
- Após doar/içar: invalidar `['legion-treasury', legionId]` **e** a query de wallet do header.

### 6.5 Microcopy (pt-BR + en) — chaves i18n novas em `legions.treasury.*`
| Chave | pt-BR | en |
|---|---|---|
| `title` | Cofre da Legião | Legion Treasury |
| `balance` | Saldo do cofre | Treasury balance |
| `donate` | Doar ao cofre | Donate to treasury |
| `donateCta` | Enviar tributo | Send tribute |
| `activeStandard` | Estandarte ativo | Active standard |
| `hoist` | Içar Estandarte | Hoist Standard |
| `hoistConfirm` | Içar este estandarte? | Hoist this standard? |
| `insufficient` | Saldo insuficiente | Insufficient balance |
| `standardActive` | Já há um estandarte içado | A standard is already flying |
| `empty` | Nenhum tributo ainda | No tributes yet |
| `donateSuccess` | Tributo enviado ao cofre! | Tribute sent to the treasury! |
| `hoistSuccess` | Estandarte içado para a legião! | Standard hoisted for the legion! |

### 6.6 Tempo real (SSE)
- Nenhum stream dedicado no contrato atual. Countdown do estandarte é **client-side** a partir
  de `remaining_seconds`; refetch do treasury on-focus. (Se o backend expuser
  `GET /legions/events` no futuro, escutar `standard_hoisted`/`donation` — fora de escopo agora.)

### Assets
- Ícone SVG de cofre/estandarte em `src/components/icons/` (novo). Moedas: reusar
  `AureusCoin/DenariusCoin/AsCoin` + `CoinAmount` (`src/utils/coins.ts`).

## 7. Critérios de aceite
- Membro vê saldo + histórico do cofre da sua legião; consegue doar (modal padrão) e o saldo
  pessoal atualiza.
- Líder vê a loja de estandartes e iça um (buff aparece como `active_standard` com countdown).
- Não-líder não vê o botão de içar. Todos os erros (401/403/409/422) mapeados.
- `npx tsc --noEmit` exit 0. Strings em pt-BR **e** en.

## 8. Fora de escopo
- Criação/edição de legião; troca de líder; SSE de tesouro; painel admin de promoções.

## 9. Riscos / conflitos
- Determinar "é líder?" — confirmar com o backend qual campo do detalhe da legião/usuário
  identifica o líder antes de condicionar o botão (se não houver, tratar 403 como fallback).
