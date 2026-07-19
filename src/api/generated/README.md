# API — Tipos gerados do contrato (OpenAPI)

Tipos TypeScript gerados a partir do **`openapi.json`** do backend Via Imperii.
Fonte de verdade do contrato; o compilador (`tsc`) aponta o que quebra quando o backend muda.

Contrato pinado hoje: **`8f421ca`** (OpenAPI 3.1.0 — 99 endpoints, 186 schemas).

## Arquivos deste diretório

- `openapi.snapshot.json` — snapshot do contrato no SHA pinado (fetch via `gh`). **Commitado**:
  é o contrato legível, o diff dele mostra a mudança de API no PR.
- `schema.d.ts` — tipos gerados a partir do snapshot. **Commitado**. Não editar à mão.

## Gerador escolhido: `openapi-typescript` (types-only)

- A camada de dados deste app **já existe e é feita à mão**: funções finas em
  `src/api/<domínio>/<domínio>Api.ts` sobre `apiFetch` (`src/api/config/defaultApi.ts`) +
  hooks **React Query** escritos por tela em `model/queries` e `model/mutations`, com
  convenções próprias de `queryKey` e invalidação (ver `CLAUDE.md` §0.2).
- Por isso **não** usamos `orval` (geraria um conjunto **paralelo** de hooks com `queryKey`
  próprio, fora dessas convenções, e furaria o unwrap único do envelope) **nem** `openapi-fetch`
  (o `apiFetch` já é o cliente fino: base URL por env, Bearer, refresh 401 e unwrap do `content`).
- `openapi-typescript` gera **só tipos** — zero paradigma novo de data-fetching. As funções à
  mão passam a importar os tipos do contrato em vez de manter `interface`s duplicadas.

## Onde entram no cliente existente (nada é reimplementado)

Tudo que o cliente precisa já vive em `src/api/config/`:

- **Base URL por ambiente** → `EXPO_PUBLIC_API_HOST` (já inclui o prefixo `/api/v1`; por isso as
  chamadas passam `/missions`, não `/api/v1/missions`) — `defaultApi.ts:5`.
- **Injeção do Bearer** → `apiFetch` adiciona `Authorization: Bearer <token>` — `defaultApi.ts:34`.
- **Unwrap do envelope `{ time, content }` num ponto único** → `readContent` / `readError`
  desempacotam `response.content` (sucesso **e** erro) — `defaultApi.ts:68`.
- **401 → refresh** → `apiFetch` renova e repete uma vez; `tokenManager.ts` faz a rotação do par.
- **SSE** (`?token=<jwt>`) fica **como está** — OpenAPI não cobre streams (`missionEvents.ts` etc.).

> ⚠️ **Envelope**: o schema OpenAPI descreve o **conteúdo interno** (o que vem em `content`),
> **não** o envelope. Logo, os tipos gerados casam exatamente com o retorno de `readContent<T>()`.
> O unwrap continua num lugar só — nunca desempacote `content` na chamada.

## Como usar os tipos (adoção incremental)

Nas funções `*Api.ts`, troque as `interface`s à mão pelos tipos do contrato:

```ts
import type { components } from '../generated/schema';
import { apiFetch, readContent, readError } from '../config/defaultApi';

// Ajuste o nome do schema conforme o gerado (ver components['schemas'] em schema.d.ts).
type Mission = components['schemas']['MissionOut'];

export async function getMission(slug: string): Promise<Mission> {
  const res = await apiFetch(`/missions/${slug}`);
  if (!res.ok) throw new Error(await readError(res, 'Erro ao carregar missão'));
  return readContent<Mission>(res); // readContent devolve o `content` já tipado
}
```

Os hooks React Query (`useQuery`/`useMutation`) continuam iguais — só passam a receber o tipo
correto de retorno da função.

**Moeda**: exiba os campos `*_display` do contrato (ex.: `coin_balance_display`); não formate no
front. **i18n**: endpoints que aceitam `?lang=en` continuam sendo montados na própria chamada.

## Regeneração

> O repo backend (`k2madureira/viaimperii`) é **privado**, então o `raw.githubusercontent.com`
> retorna 404 sem auth. O fetch usa o **`gh` CLI** (autenticado), mantendo o SHA pinado.
> Pré-requisito: `gh auth login` com acesso ao repo backend.

1. O backend publicou um `openapi.json` novo → pegue o **commit SHA ou tag** correspondente.
2. Atualize o **SHA pinado** no script `api:fetch` em `package.json` (procure por
   `?ref=<SHA>`). **Não** use uma branch móvel (`main`/`develop`) — o build precisa ser
   reprodutível.
3. Rode:
   ```bash
   npm run api:generate   # api:fetch (gh → openapi.snapshot.json) + openapi-typescript → schema.d.ts
   ```
4. Rode `npx tsc --noEmit`. Os erros mostram **exatamente** o que mudou no contrato — essa é a
   rede de segurança. Ajuste as funções `*Api.ts` afetadas.

## Versionamento

`openapi.snapshot.json` e `schema.d.ts` são **commitados** (não ignorados): assim o diff do
contrato aparece no PR e fica auditável junto com o código que o consome.
