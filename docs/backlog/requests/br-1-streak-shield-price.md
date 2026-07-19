# BR-1 (Backend) — Expor o preço do Streak Shield na leitura do streak

> **Para:** backend (`E:\projetos\python\viaimperii`).
> **Origem:** frontend — modal de compra do Streak Shield (feature F2, já shipada no app).
> **Tipo:** ajuste de contrato **aditivo** (não quebra nada existente).
> **Prioridade:** média — sem isso, o app não consegue mostrar o preço **antes** da compra.

---

## Problema

O app precisa mostrar o preço do escudo **antes** de o usuário confirmar a compra. Hoje o preço
(`STREAK_SHIELD_PRICE` = 50 denários) só é retornado em `BuyShieldResponse` — ou seja, **depois**
da compra. A leitura pré-compra `GET /api/v1/users/{user_id}/streak` (`StreakResponse`) **não
expõe preço nenhum**.

O front **não hardcoda moeda** (regra do projeto: só exibe os campos `*_display` que o backend
formata). Sem o preço no contrato de leitura, o modal degrada para "explicação + saldo" e o
usuário não vê quanto vai pagar na primeira compra.

## O que fazer

Adicionar **dois campos** à resposta de leitura do streak, reaproveitando a MESMA lógica de
preço/formatação que a compra já usa:

```
shield_price:         int      # valor ATÔMICO (mesma unidade de price em BuyShieldResponse)
shield_price_display: string   # ex.: "50 denários" — string já formatada p/ exibir
```

- Fonte do valor: a constante `STREAK_SHIELD_PRICE` já usada no fluxo de compra (não duplicar
  regra de preço — extrair/reusar o mesmo helper que gera `price` / `price_display` no
  `BuyShieldResponse`).
- Aplicar em **`StreakResponse`** (retorno do `GET /users/{id}/streak`). Se o mesmo schema de
  streak também é usado no retorno do login (`StreakSchema`), incluir lá também — o app usa as
  duas leituras.

## Endpoint afetado

```
GET /api/v1/users/{user_id}/streak   (auth)
  StreakResponse {
    ...campos atuais...,
    shield_price,          # NOVO
    shield_price_display   # NOVO
  }
```

Nenhum outro endpoint muda. **Não** alterar `POST /users/{id}/streak/shield` nem os códigos de
erro atuais (`401` sessão · `403` não-dono · `409` teto de escudos · `422` saldo insuficiente).

## Definition of Done (backend)

- `shield_price` + `shield_price_display` presentes no `GET /users/{id}/streak` (e no
  `StreakSchema` do login, se compartilhado).
- Valor vem de `STREAK_SHIELD_PRICE` via o mesmo helper de formatação da compra (sem número mágico
  novo, sem duplicar a regra).
- Mudança **aditiva** — clientes antigos seguem funcionando.
- Coleção Postman (`docs/postman_collection.json`) e `README.md` atualizados (convenção do repo).

## Depois de pronto (lado do front — já mapeado, ~2 linhas)

1. Incluir `shield_price_display` no tipo `StreakResponse` (`src/api/streak/streakApi.ts`).
2. Passar `priceDisplay={streakQuery.data?.shield_price_display}` ao `BuyShieldModal`
   (`src/screens/dashboard/components/buttons/streakButton/index.tsx`).
- A microcopy com `{{price}}` (`dashboard.streakShield.buyConfirm` / `priceLabel`) já existe.
