# Store Promotions (Descontos) — Frontend

> Backend **já shipou** (economy; endpoints `/promotions` live). Esta spec é **frontend-only**.
> A loja (`market`) não mostra nenhuma promoção/desconto ativo hoje.

- **Slug:** `store-promotions-frontend`
- **Backlog #:** F3 · **ROI:** 3.2 · **Esforço:** M
- **Status:** Ready for build
- **Autor (PO):** product-owner · **Data:** 2026-07-17

---

## 1. Problema / Oportunidade
Existe um sistema de promoções (descontos % por categoria/alvo, com janela de ativação) que
nunca aparece na loja. Descontos com prazo são um gatilho clássico de conversão e urgência —
está pronto no backend e desligado no app.

## 2. Hipótese
Se destacarmos promoções ativas na loja (badge de desconto + preço riscado + faixa de
"promoções da semana"), a conversão de compras sobe, medido por compras de itens em promoção.

## 3. Regras de negócio (backend, resumo)
- Promoção tem `category` + `target_id` (alvo), `discount_pct`, janela `starts_at`/`ends_at`,
  `is_active` e `active_now` (se está valendo agora, no fuso SP).
- Preço final é responsabilidade do backend (front **não** calcula desconto sobre atômico —
  exibe o que o contrato manda; se preciso, o item da loja deve trazer preço com desconto).

## 4. Modelo de dados
Nenhuma mudança de front. **Dependência a confirmar** (§9): os itens da loja
(`GET /rewards`, loja rank-gated, professions) já refletem o preço com desconto ou é preciso
o front cruzar `promotions` × item pelo `category`+`target_id`?

## 5. Contrato de API (já existente)
```
GET /api/v1/promotions?category=<opt>&active=<opt>      (auth)
  content: PromotionSchema[]
    { id, name, category, target_id, discount_pct,
      starts_at, ends_at, is_active, active_now }
GET /api/v1/promotions/{promotion_id}                   (auth)
```
(POST/PATCH/DELETE são **admin** — fora de escopo do app de usuário.)
**Erros:** `401` sessão, `404` promoção inexistente.

---

## 6. Frontend (contrato para a ft)

### 6.1 Telas / entradas
- Tela **`market`** (`src/screens/market/`).
  - Nova query `model/queries/usePromotions.ts` (`GET /promotions?active=true`), key
    `['promotions','active']`.
  - Nova section `components/sections/promotionsStrip/` — faixa horizontal no topo da loja
    listando promoções com `active_now === true` (nome + `discount_pct` + countdown até `ends_at`).
  - `components/cards/promoBadge/` — selo "-{{pct}}%" reaproveitável, sobreposto nos cards de
    item da loja que estejam em promoção.
- Cruzar por `category` + `target_id` com o item exibido para decidir onde estampar o badge.

### 6.2 Estados de UI
| Estado | Origem | UI |
|---|---|---|
| loading | query pendente | `skeletons/` da faixa (padrão do market) |
| sucesso | 200 c/ itens | faixa de promoções + badges nos cards |
| vazio | `[]` ou nenhum `active_now` | **não renderiza** a faixa (sem espaço morto) |
| erro | rede/500 | falha silenciosa da faixa (loja continua funcional) + retry opcional |
| 401 | sessão | fluxo de re-login padrão |
| expirando | `ends_at` próximo | countdown em vermelho quando < 24h |

### 6.3 Dados a exibir
- Faixa: iterar promoções com `active_now === true` →
  `name`, `discount_pct` ("-{{discount_pct}}%"), countdown de `ends_at`.
- Badge no card: `discount_pct` do match `category`+`target_id`.
- Preço: exibir o **preço com desconto** vindo do item da loja (via `*_display`);
  se o item trouxer preço original, mostrar riscado. **Não** recalcular no front.

### 6.4 Ação → API
| Ação | Método + endpoint |
|---|---|
| Carregar promoções ativas | `GET /api/v1/promotions?active=true` |
| (opcional) detalhe | `GET /api/v1/promotions/{id}` |
- Compra reusa o fluxo de compra existente da loja (`buyConfirmModal`) — sem mudança de contrato.

### 6.5 Microcopy (pt-BR + en) — chaves `market.promotions.*`
| Chave | pt-BR | en |
|---|---|---|
| `title` | Promoções da semana | This week's deals |
| `off` | -{{pct}}% | -{{pct}}% |
| `endsIn` | Termina em {{time}} | Ends in {{time}} |
| `endsSoon` | Últimas horas! | Last hours! |

### 6.6 Tempo real (SSE)
- Não aplicável. Countdown client-side a partir de `ends_at`; refetch on-focus.

### Assets
- Selo de desconto (SVG) em `src/components/icons/` ou estilizado via NativeWind (sem novo asset).

## 7. Critérios de aceite
- Loja mostra promoções `active_now` numa faixa e badges de desconto nos itens alvo.
- Faixa some quando não há promoção ativa (sem espaço morto).
- Preço exibido vem do contrato (sem aritmética de moeda no front).
- `npx tsc --noEmit` exit 0. Strings pt-BR **e** en.

## 8. Fora de escopo
- Admin de promoções (POST/PATCH/DELETE). Notificação push de promoção nova.

## 9. Riscos / conflitos
- **Bloqueador a resolver com o backend:** confirmar se os endpoints de item da loja
  (`/rewards`, loja rank-gated, professions) já devolvem preço **com desconto** e o preço
  original. Se **não**, abrir task de backend antes (o front não deve calcular desconto sobre
  valor atômico). Enquanto isso, a faixa informativa (§6.1) pode shipar sem os badges de preço.
