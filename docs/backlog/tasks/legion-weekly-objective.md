# Legion Weekly Objective (Objetivo Semanal da Legião) — Frontend

> Backend **já shipou** (PR #49; CLAUDE.md §24, `docs/legions/legion-weekly-objective.md`).
> Esta spec é **frontend-only**: consumir o contrato existente. Depende conceitualmente do
> **Cofre da Legião** (F1) — é o payoff que faz o loop `cofre → estandarte → mais XP` girar.

- **Slug:** `legion-weekly-objective-frontend`
- **Backlog #:** F5 · **ROI:** 4.2 · **Esforço:** M
- **Status:** Ready for build (recomendado shipar **depois de F1** — Legion Treasury)
- **Autor (PO):** product-owner · **Data:** 2026-07-18

---

## 1. Problema / Oportunidade
Cada legião tem agora uma **meta compartilhada automática** por semana: os membros completam
**N missões**; ao bater a meta, o **cofre da legião** é creditado e **cada contribuidor** ganha
um bônus pessoal em denarii. É pressão social positiva ("carregue seu peso") pronta no backend,
mas **invisível** no app — membros não veem a meta, o progresso coletivo, nem quem está puxando.

## 2. Hipótese
Se mostrarmos a barra de progresso da meta + o mini-placar de contribuição + a recompensa
(cofre + bônus pessoal), membros completarão mais missões perto do fim da semana para fechar a
meta, medido por missões/legião na semana e por % de legiões que batem o objetivo.

## 3. Regras de negócio (backend, resumo)
- **Janela = semana SP** (segunda 00:00 America/Sao_Paulo). Mesma do placar e do bucket mensal.
- **Meta escalada**: `target = membros_ativos × 15`. Ativo = ganhou XP nos últimos 7 dias.
  Legião com < 3 ativos → sem meta (endpoint volta placar ao vivo com `target = 0`).
- **Progresso** = missões `COMPLETED` por membros atuais na janela (ao vivo, `COUNT`).
- **Recompensa** (paga por job de segunda, não é ação do front): cofre += `membros × 50` denarii;
  cada contribuidor (≥1 missão) += `30` denarii; notifica todos os membros.
- **Free-riding (v1)**: contribuição por membro é **exposta** (mini-placar) mas o cofre não é
  gated — todos se beneficiam; o bônus recompensa quem puxa.
- Detalhes em `CLAUDE.md` §24.

## 4. Modelo de dados
Nenhuma mudança. Consome o que existe.

## 5. Contrato de API (real — validado em `objective_read.py`)
> **Response-wrapped**: ler de `content.*`. Chaves em **snake_case**.
```
GET /api/v1/legions/{legion_id}/objective                           (auth)
  # abre o objetivo da semana na 1ª visita (lazy); volta o progresso ao vivo
  content: {
    legion_id, iso_year, iso_week,
    week_start, week_end,                    # ISO com offset SP (countdown)
    status,                                  # 'active' | 'completed' | 'expired'
    target, progress, progress_pct,          # progress_pct 0–100
    completed,                               # bool (meta batida)
    active_members,
    cofre_reward, cofre_reward_display,      # denarii que o cofre recebe se fechar
    contributor_bonus, contributor_bonus_display,  # bônus pessoal por contribuidor
    contributors: [ { user: { id, name, image, active_avatar, rank, legion_id },
                      missions, is_contributor } ],
    viewer: { missions, is_contributor },
    completed_at | null
  }

GET /api/v1/legions/{legion_id}/objective/history?limit=            (auth)
  # objetivos FECHADOS (completed/expired), mais recente primeiro. limit 1–52 (default 12)
  content: { items: [ { iso_year, iso_week, week_start, week_end, status,
                        target, final_progress, cofre_reward, cofre_reward_display,
                        completed_at } ] }
```
**Erros esperados**: `401` sessão, `404` legião/usuário inexistente. Legião inelegível
(< 3 ativos) → 200 com `target: 0`, `status: 'active'` — tratar como "sem meta esta semana".

---

## 6. Frontend (contrato para a ft)

### 6.1 Telas / entradas
- Tela **`legions`** (`src/screens/legions/`). **Adicionar nova section**
  `sections/legionObjective/` renderizada no card expandido da **legião do viewer**, acima ou
  ao lado da section de tesouro (F1). Não é screen nova.
- **Model** (`legions/model/queries/`):
  - `useLegionObjective.ts` — key `['legion-objective', legionId]`.
  - `useLegionObjectiveHistory.ts` — key `['legion-objective-history', legionId]`.
- **Componentes** (contexto §0.2):
  - `components/cards/objectiveCard/` — cabeçalho da meta: barra de progresso (`progress_pct`),
    `progress`/`target` ("142 / 195 missões"), countdown da semana (de `week_end`), estado
    (`active`/`completed`/`expired`), recompensa prevista (`cofre_reward_display` +
    `contributor_bonus_display`).
  - `components/cards/contributorRow/` — linha do mini-placar: avatar (`active_avatar`+`image`),
    `name`, `rank` (mini), `missions`, marca de contribuidor (`is_contributor`). Ordenado como
    vem do backend (mais missões primeiro).
  - `components/cards/viewerContribution/` — destaque da própria contribuição do viewer
    (`viewer.missions` + "você já contribuiu / carregue seu peso" conforme `is_contributor`).
  - `components/buttons/objectiveHistoryToggle/` — abre o histórico (`/history`).
  - `components/cards/objectiveHistoryRow/` — linha do histórico: semana, `final_progress`/`target`,
    `status` (batida/expirada), `cofre_reward_display`.
- Sabor romano na microcopy ("Objetivo da Legião", "Missões da semana", "Carregue seu peso").

### 6.2 Estados de UI
| Estado | Origem | UI |
|---|---|---|
| loading | query pendente | `skeletons/objectiveSkeleton/` (barra + linhas placeholder) |
| meta ativa | `status: 'active'`, `target > 0` | card com barra + mini-placar + countdown |
| sem meta | `target: 0` (legião < 3 ativos) | `feedback/emptyBox` "Sua legião precisa de mais membros ativos para ter uma meta" |
| meta batida | `completed: true` / `status: 'completed'` | card em destaque "Meta cumprida!" + recompensa |
| expirada (histórico) | `status: 'expired'` | linha do histórico em tom neutro |
| viewer não contribuiu | `viewer.is_contributor === false` | CTA sutil "Complete uma missão para contribuir" |
| erro geral | rede/500 | `feedback/errorState` (reusar o da tela) + retry |
| 401 | sessão | fluxo de re-login (padrão do app) |
| 404 | legião/usuário | esconder a section (fallback) |

### 6.3 Dados a exibir
- Progresso: `content.progress` / `content.target`, barra por `content.progress_pct`.
- Countdown: de `content.week_end` (client-side, tick por minuto).
- Recompensa: `content.cofre_reward_display` (cofre) + `content.contributor_bonus_display` (pessoal).
- Mini-placar: `content.contributors[i]` → avatar, `name`, `rank`, `missions`, `is_contributor`.
- Viewer: `content.viewer.missions` / `.is_contributor`.
- Histórico: `items[i]` → semana, `final_progress`/`target`, `status`, `cofre_reward_display`.

### 6.4 Ação → API
| Ação | Método + endpoint |
|---|---|
| Abrir objetivo (card da legião do viewer) | `GET /api/v1/legions/{legionId}/objective` |
| Ver histórico | `GET /api/v1/legions/{legionId}/objective/history?limit=12` |
- Sem mutations (read-only). Refetch on-focus + pull-to-refresh. A abertura do objetivo é
  **lazy no backend** — o simples GET abre a semana; o front não dispara nada extra.
- Invalidar `['legion-objective', legionId]` quando uma missão é concluída na tela de missões
  (o progresso é do próprio viewer + legião) — hook fino no sucesso de `complete`.

### 6.5 Notificação de conclusão (`legion_objective_completed`)
- Novo tipo `legion_objective_completed` (histórico + SSE `GET /notifications/events`, sem `from_user_id`).
- **Adicionar case** em `dashboard/components/buttons/notificationsButton/notificationMessage.ts`:
  ```
  case 'legion_objective_completed':
    return t('notifications.types.legion_objective_completed', {
      bonus: p.contributor_bonus_display, cofre: p.cofre_reward_display });
  ```
  - Ao tocar → abrir a tela `legions` no card da legião do viewer (section do objetivo).
  - Confirmar as chaves exatas do payload ao integrar (bônus/cofre/semana).

### 6.6 Microcopy (pt-BR + en) — chaves i18n novas em `legions.objective.*`
| Chave | pt-BR | en |
|---|---|---|
| `title` | Objetivo da Legião | Legion Objective |
| `progress` | {{done}} / {{target}} missões | {{done}} / {{target}} missions |
| `resetIn` | Reseta em {{time}} | Resets in {{time}} |
| `reward` | Recompensa | Reward |
| `cofreReward` | +{{amount}} ao cofre | +{{amount}} to the treasury |
| `yourBonus` | Seu bônus: {{amount}} | Your bonus: {{amount}} |
| `contributors` | Quem está puxando | Who's pulling weight |
| `youContributed` | Você já contribuiu ({{count}}) | You've contributed ({{count}}) |
| `carryWeight` | Complete uma missão para contribuir | Complete a mission to contribute |
| `completed` | Meta cumprida! | Objective complete! |
| `noObjective` | Sua legião precisa de mais membros ativos para ter uma meta | Your legion needs more active members to get an objective |
| `history` | Semanas anteriores | Previous weeks |
| `notifications.types.legion_objective_completed` | Sua legião bateu a meta! +{{bonus}} pra você, {{cofre}} ao cofre | Your legion hit its goal! +{{bonus}} for you, {{cofre}} to the treasury |

### 6.7 Tempo real (SSE)
- **Objetivo sem SSE dedicado** (v1): progresso recarrega on-focus + após concluir missão +
  pull-to-refresh. Countdown é client-side de `week_end`.
- **Notificação de conclusão** entra pelo SSE de notificações existente — só somar o novo `type`.

### Assets
- Ícone de estandarte/meta (SVG) em `src/components/icons/`. Moedas: `DenariusCoin` +
  `CoinAmount` (`src/utils/coins.ts`) para bônus/cofre.

## 7. Critérios de aceite
- Membro vê, no card da sua legião, a barra de progresso da meta (progress/target), countdown
  da semana, recompensa prevista e o mini-placar de contribuição com sua própria linha.
- Legião inelegível mostra o estado "sem meta"; meta batida aparece em destaque.
- Notificação `legion_objective_completed` renderiza texto correto e abre a section certa.
- Progresso atualiza após concluir uma missão. `npx tsc --noEmit` exit 0. Strings pt-BR **e** en.

## 8. Fora de escopo
- Gating duro de min-contribution; SSE ao vivo do progresso; ranking histórico de contribuição
  por membro; expor o objetivo no `GET /legions/{id}` (o backend lista como follow-up).

## 9. Riscos / conflitos
- **Ordem de build**: shipar **depois de F1 (Legion Treasury)** — a recompensa aponta para o
  cofre; sem a section de tesouro o payoff fica meio abstrato. Coordenar as duas sections no
  mesmo card expandido da legião.
- **Payload da notificação**: confirmar as chaves exatas de `legion_objective_completed` ao
  integrar (bônus/cofre/semana) — o backend não documentou o shape do payload por extenso.
- **Invalidar ao concluir missão**: garantir que o hook de invalidação não acople demais a tela
  de missões à de legiões (usar a query key, sem import cruzado de screen).
