# Profession Mastery Tiers (Maestria de Profissão) — Frontend

> Backend **já shipou** (migration **0069**; CLAUDE.md §25,
> `docs/business-rules/missions/profession-mastery-tiers.md`). Esta spec é
> **frontend-only**. Hoje o app **ignora** o objeto `mastery`: `UserProfessionItem`
> (`src/api/professions/dto.ts`) não o declara e nenhuma tela o renderiza.

- **Slug:** `profession-mastery-tiers`
- **Backlog #:** F7 · **ROI:** 3.4 · **Esforço:** S/M
- **Status:** Ready for build
- **Autor (PO):** product-owner · **Data:** 2026-07-20

---

## 1. Problema / Oportunidade
Escolher uma profissão hoje, no app, só **filtra missões**. O backend já dá à profissão uma
progressão própria (Aprendiz → Mestre), com bônus de moeda a cada tier e notificação de
tier-up — tudo invisível. É progressão de longo prazo **já paga** e sem retorno de UX.

## 2. Hipótese
Mostrar tier + barra "faltam N missões para Journeyman" dá uma meta de longo horizonte ao
lado das patentes, aumentando missões/dia **dentro** da profissão ativa e a retenção de quem
tem profissão. Métrica: missões/dia por profession-holder, % que cruza o tier 1 em 30 dias.

## 3. Regras de negócio (backend, resumo)
- **Tier derivado do contador de conclusões** (nunca armazenado como verdade) — mesma
  filosofia de "patente vem do XP".
- Curva `TIER_THRESHOLDS = (0, 10, 30, 70, 150)` →
  **Apprentice (0) · Journeyman (10) · Adept (30) · Expert (70) · Master (150)**.
  Gaps crescem (10 → 20 → 40 → 80).
- Só conta missão finalizada **vinculada à profissão** e com a profissão **ativa**
  (`user_professions.is_active`) do usuário.
- **Bônus one-time por tier** (denarii): Journeyman 50 · Adept 100 · Expert 200 · Master 400.
  Idempotente, já incluso no `coins_earned`/`coin_balance` da resposta de finalize.
- **Não** compõe com o multiplicador 1,5× da profissão (eixos ortogonais).
- Postgres-only; não existe em modo in-memory.

## 4. Modelo de dados
Nenhuma mudança de backend. Consome o que existe.

## 5. Contrato de API (real — `docs/business-rules/missions/profession-mastery-tiers.md`)
> **Response-wrapped**: ler de `content.*`. Chaves em **snake_case**.

```
GET /api/v1/users/{id}/professions                       (já consumido: professions.owned)
  content.items[i] (UserProfessionItem) ganha:
    mastery: {
      completions,          # conclusões nesta profissão
      tier,                 # 0..4
      tier_name,            # 'Apprentice' | 'Journeyman' | 'Adept' | 'Expert' | 'Master'
      next_tier,            # 1..4 | null (no topo)
      next_tier_name,       # string | null
      completions_to_next,  # quantas faltam | 0 no topo
      progress_pct,         # 0–100 dentro da faixa atual
      is_max                # bool
    }

POST /api/v1/missions/{slug}/complete   (easy, finaliza na hora)   (já consumido)
POST /api/v1/missions/{slug}/approve                               (já consumido)
  content.profession_tier_ups: [
    { profession_id, profession_name, tier, tier_name, completions, coins_earned }
  ]      # vazio quando não houve tier-up; as moedas já estão em coins_earned/coin_balance
```
**Erros**: nada novo. `mastery` pode vir **ausente/null** (modo in-memory, profissão sem
conclusões) → tratar como Apprentice / 0 conclusões.

---

## 6. Frontend (contrato para a `ft`)

### 6.1 Telas / entradas
Nenhuma screen nova. Quatro pontos:

1. **`market`** (seção Profissões) — `components/cards/professionCard/`: nas profissões
   **já possuídas**, badge de tier + micro-barra de progresso.
2. **`missions` → `professionHero`** (`src/screens/missions/components/sections/professionHero/`,
   já consome `useUserProfessions`) — faixa de maestria da profissão **ativa**: tier atual,
   barra e "faltam {{n}} missões para {{next}}".
3. **`missions/professionMissions`** (sub-tela) — cabeçalho da profissão com a mesma faixa
   (`components/cards/masteryBar/` próprio da sub-tela, reusando o átomo compartilhado).
4. **Modal de tier-up** — após concluir/aprovar uma missão que retorne
   `profession_tier_ups[]` não vazio.

**API:** só **estender tipos** — nenhum endpoint/arquivo novo.
- `src/api/professions/dto.ts`: adicionar `interface ProfessionMastery` e
  `mastery?: ProfessionMastery | null` em `UserProfessionItem`.
- `src/api/missions/dto.ts`: adicionar `profession_tier_ups?: ProfessionTierUp[]` nas
  responses de `complete` e `approve`.

**Componentes** (contexto §0.2):
- `src/components/masteryTierBadge/` (**global**, usado por 3 telas) — pílula com
  `tier_name` + cor por tier (Apprentice cinza → Master dourado).
- `market/components/cards/masteryBar/` — barra fina + `progress_pct` +
  "{{completions_to_next}} para {{next_tier_name}}"; no topo mostra "Mestre".
- `missions/components/cards/professionMasteryRow/` — faixa completa do `professionHero`
  (badge + barra + contador de conclusões).
- `missions/components/modals/professionTierUpModal/` — celebração do tier-up. **Padrão
  `LegionSelectModal`**: overlay `bg-black/60 items-center justify-center`, card
  `bg-white rounded-[20px] p-6`, ícone da profissão ao centro, `tier_name` novo,
  `coins_earned` (via `CoinAmount`), botão primário full-width. **Nunca** `Alert` nativo.
  Múltiplos tier-ups na mesma resposta → exibir em fila (um por vez).
- Constantes da curva/cores em `src/constants/professions.ts` (criar se não existir) —
  **não** hardcodar thresholds em componente; o backend já manda `progress_pct`, então o
  front **não recalcula a curva**, só usa a cor/ordem por `tier`.

**Hooks:** reusar `useUserProfessions` (`src/screens/market/model/queries/useProfessions.ts`)
— já consumido por `market`, `professionHero` e `professionMissions`. Invalidar
`['user-professions', userId]` no sucesso de `complete`/`approve`.

### 6.2 Estados de UI
| Estado | Origem | UI |
|---|---|---|
| loading | query pendente | skeleton da barra (reusar `skeletons/` da tela) |
| sem profissão | `items` vazio | estado atual da tela (CTA "compre uma profissão") — inalterado |
| Apprentice / 0 | `mastery.completions === 0` | badge "Aprendiz" + barra vazia + "Complete missões desta profissão" |
| em progresso | `mastery.is_max === false` | badge + barra `progress_pct` + "{{n}} para {{next_tier_name}}" |
| no topo | `mastery.is_max === true` | badge dourado "Mestre" + barra cheia, sem contador |
| `mastery` ausente/null | in-memory / campo não veio | fallback Apprentice/0 — **não quebrar a tela** |
| tier-up | `profession_tier_ups.length > 0` | `professionTierUpModal` (fila) |
| erro geral | rede/500 | `feedback/errorBox` da tela + retry |
| 401 | sessão | fluxo de re-login padrão |

### 6.3 Dados a exibir
- `content.items[i].mastery.tier_name` (badge), `.progress_pct` (barra),
  `.completions_to_next` + `.next_tier_name` (contador), `.completions` (total), `.is_max`.
- Tier-up: `content.profession_tier_ups[i].tier_name`, `.profession_name`,
  `.coins_earned` (renderizar com `CoinAmount`, **sem** aritmética no front),
  `.completions`.

### 6.4 Ação do usuário → chamada de API
| Ação | Método + endpoint |
|---|---|
| Abrir `market`/`missions`/`professionMissions` | `GET /api/v1/users/{id}/professions` (já existe) |
| Concluir missão easy | `POST /api/v1/missions/{slug}/complete` → ler `profession_tier_ups` |
| Aprovar missão (revisor) | `POST /api/v1/missions/{slug}/approve` → ler `profession_tier_ups` |
| Pós-tier-up | invalidar `['user-professions', userId]` e `['wallet']` |
- Nenhuma mutation nova.

### 6.5 Microcopy (pt-BR + en) — chaves em `professions.mastery.*`
| Chave | pt-BR | en |
|---|---|---|
| `title` | Maestria | Mastery |
| `tiers.0` | Aprendiz | Apprentice |
| `tiers.1` | Oficial | Journeyman |
| `tiers.2` | Adepto | Adept |
| `tiers.3` | Perito | Expert |
| `tiers.4` | Mestre | Master |
| `progress` | {{count}} missões concluídas | {{count}} missions completed |
| `toNext` | Faltam {{count}} para {{tier}} | {{count}} more to {{tier}} |
| `maxed` | Maestria plena | Full mastery |
| `startHint` | Complete missões desta profissão para evoluir | Complete missions in this profession to advance |
| `tierUp.title` | Nova maestria! | New mastery! |
| `tierUp.subtitle` | Você agora é {{tier}} em {{profession}} | You are now {{tier}} in {{profession}} |
| `tierUp.reward` | Recompensa: {{amount}} | Reward: {{amount}} |
| `tierUp.cta` | Continuar | Continue |
| `notifications.types.profession_tier_up` | Você alcançou {{tier}} em {{profession}} (+{{amount}}) | You reached {{tier}} in {{profession}} (+{{amount}}) |

> **Nota de tradução**: os `tier_name` chegam do backend em **inglês**
> (`Apprentice`…`Master`). Renderizar **sempre** pela chave i18n indexada por
> `mastery.tier` — **não** exibir a string crua do backend.

### 6.6 Tempo real (SSE) + notificação
- **Notificação `profession_tier_up`** (§20): chega pelo SSE de notificações existente
  (`GET /notifications/events?token=<jwt>`) e pelo histórico. **Adicionar o case** em
  `src/screens/dashboard/components/buttons/notificationsButton/notificationMessage.ts`:
  ```ts
  case 'profession_tier_up':
    return t('professions.mastery.notifications.types.profession_tier_up', {
      tier: p.tier_name, profession: p.profession_name, amount: p.coins_earned });
  ```
  - Sem `actor` (auto-conquista). Ao tocar → tela `missions/professionMissions` da profissão.
- Sem SSE dedicado de maestria.

### Assets
- Nenhum asset novo obrigatório. Ícone da profissão vem de `profession.icon_url`;
  moedas via `DenariusCoin` + `CoinAmount`. Opcional: 5 ícones SVG de tier
  (martelo → coroa de louros) em `src/components/icons/` — se não houver, usar a pílula
  colorida do `masteryTierBadge`.

## 7. Critérios de aceite
- Toda profissão possuída mostra tier + progresso no `market`, no `professionHero` e no
  cabeçalho de `professionMissions`.
- Concluir/aprovar uma missão que cruza um tier abre o `professionTierUpModal` com o tier
  novo e as moedas ganhas; múltiplos tier-ups aparecem em fila.
- `mastery` ausente/null não quebra nenhuma tela (fallback Apprentice/0).
- Nomes de tier renderizados via i18n (pt-BR **e** en), nunca a string crua do backend.
- `npx tsc --noEmit` exit 0.

## 8. Fora de escopo
- Feed event ao chegar a Mestre (backend lista como follow-up).
- Cosmético/título desbloqueável por tier; tie-in de paywall (Fase 2).
- Ranking de maestria entre usuários (cabe no leaderboard de profissão, já shipado).

## 9. Riscos / dependências
- **In-memory**: maestria é Postgres-only — o fallback (§6.2) é obrigatório, não opcional.
- **Confirmar ao integrar** se `mastery` vem em `GET /users/{id}/professions` também para
  profissões **inativas** (o incremento só ocorre nas ativas) — se vier zerado, ainda assim
  renderizar o badge.
- **Payload da notificação**: confirmar as chaves exatas de `profession_tier_up`
  (`tier_name`, `profession_name`, `coins_earned`) na integração.
