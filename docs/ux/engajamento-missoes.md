# Engajamento de Missões — Plano de Melhorias

Documento de trabalho para atacar os problemas relatados:

1. Melhorar a experiência do usuário em relação às **missões**.
2. As missões **não chamam atenção**.
3. Objetivo: **engajamento alto no dia-a-dia** (hábito diário).

> Base: mapeamento em [`docs/architecture`](../architecture/README.md) + leitura do código
> (`src/screens/missions`, `src/screens/dashboard`). Marca-se **[Front]**,
> **[Back]** ou **[Front+Back]** por item, além de esforço e impacto estimados.

---

## 1. Diagnóstico (por que não engaja hoje)

| # | Problema | Evidência no código |
|---|----------|---------------------|
| D1 | **Home é feed-first, não ação-first** | `dashboard/index.tsx` abre no feed social; missão só aparece como "Continuar campanha" que navega para outra aba |
| D2 | **Tela de Missões densa** | `missions/index.tsx`: modo → período → stats → tipo → status → sort → chips especialidade → chips nível **antes** do 1º card |
| D3 | **Recompensa sempre adiada** | `complete` → `pending_review`; fácil = timer 30min silencioso; médio/difícil = aprovação de pares. Sem dopamina imediata |
| D4 | **Sem gatilho de retorno** | Push/FCM ainda é "melhoria futura" (`docs/Melhorias.txt`) |
| D5 | **Streak subutilizado** | `StreakButton` é só um ícone pequeno na Home; sem aversão à perda |
| D6 | **Cards apagados** | `missionItem`: muito texto, monocromático, badge de dificuldade minúsculo, tema romano invisível |
| D7 | **Sem loop competitivo** | Feed mostra conclusões, mas não há placar/meta de legião/ranking |
| D8 | **Meta diária invisível** | Existe cota (10 diárias/2 semanais) mas não há "progresso do dia" visual |

---

## 2. Melhorias de Frontend

### 2.1 Prioridade ALTA (quick wins, alto impacto)

#### F1 — Hero "Missões do Dia" na Home  · [Front] · impacto ★★★ · esforço ★★
- Bloco no topo da `Dashboard`, **acima do feed**, com:
  - anel de progresso `2/5 hoje` (cota diária consumida);
  - 2–3 missões **recomendadas** (`useRecommendedMissions`) com **Iniciar em 1 toque**;
  - atalho "Ver todas" → aba Missions.
- Ataca **D1, D2, D8**. Traz a ação para onde o olho cai primeiro.

#### F2 — Meta diária + Streak em risco nas Missões · [Front] · ★★★ · ★
- Anel/barra "3/5 missões hoje" no header da tela de Missões.
- Banner de aversão à perda: *"Conclua 1 missão para manter sua ofensiva de 12 dias 🔥"* (usa `user.streak`).
- Ataca **D5, D8**.

#### F3 — Celebração ao concluir · [Front] · ★★★ · ★★
- Animação de XP/moeda "voando" + confete + haptics ao concluir (`useCompleteMission` onSuccess).
- Reduz o vazio do `pending_review` (mostra "pontos reservados" com animação em vez de toast seco).
- Ataca **D3**.

#### F4 — Missões abrindo em "Recomendadas" com filtros colapsados · [Front] · ★★ · ★
- Default `availableMode = 'recommended'` já existe; **colapsar** especialidade/nível atrás de um botão "Filtrar".
- Mover PeriodStats/StatsFilter para uma aba secundária ("Progresso").
- Ataca **D2**.

#### F5 — Redesign do card de missão · [Front] · ★★ · ★★
- Hierarquia visual: recompensa em destaque, chip de **urgência** ("expira em Xh"), arte/ícone por especialidade, cor por dificuldade mais forte.
- Ataca **D6**.

### 2.2 Prioridade MÉDIA

#### F6 — Widget de streak expandido · [Front] · ★★ · ★
- Calendário/linha dos últimos 7 dias, próximo marco, "não perca hoje".

#### F7 — "Por que recomendada" mais visível · [Front] · ★ · ★
- `RecommendedMission.reasons` já vem do backend; exibir chips de motivo no card.

#### F8 — Empty states motivacionais · [Front] · ★ · ★
- Trocar textos neutros por CTA ("Você zerou o dia! Volta amanhã" / "Assista um vídeo para +2 missões").

#### F9 — Onboarding de missões (primeira vez) · [Front] · ★★ · ★★
- Mini-tour: iniciar → provar → ganhar XP → subir de patente.

---

## 3. Ideias de Features de Backend

### 3.1 Gatilhos de retorno (maior alavanca de hábito)

#### B1 — Push notifications (FCM) · [Back] · ★★★ · ★★★
- Eventos: missões novas do dia, **streak em risco** (fim do dia SP), evidência aprovada/rejeitada, **há missão para revisar**, subiu de patente, marco de streak.
- Requer tabela de device tokens, preferências de notificação e um scheduler (apscheduler já existe para `mission_finalizer`).
- Endpoints: `POST /users/{id}/devices`, `DELETE .../devices/{token}`, `PATCH .../notification-prefs`.

#### B2 — Resumo diário / "briefing do dia" · [Back] · ★★ · ★★
- Endpoint `GET /missions/daily-briefing`: missões sugeridas do dia + meta + streak + bônus ativo, numa só chamada (alimenta o hero F1).

### 3.2 Recompensa e gratificação

#### B3 — Crédito imediato para missões fáceis · [Back] · ★★★ · ★★
- Opção de finalizar **na hora** missões `easy` (sem janela de 30min), ou creditar XP otimista com rollback se reprovada. Resolve **D3**.

#### B4 — Baú/recompensa diária + marcos de streak · [Back] · ★★★ · ★★
- Recompensa por login/meta diária cumprida; baús em 3/7/14/30 dias de streak (moedas/avatar).
- Tabelas: `daily_rewards`, `streak_milestones`; endpoint `POST /rewards/claim`.

#### B5 — Recompensa variável (surpresa) · [Back] · ★★ · ★★
- "Missão XP em dobro" do dia, drop-rate de baú-mistério ao concluir. Ativa a dopamina de reforço variável.

#### B6 — Moeda/loja mais presente no loop · [Back] · ★★ · ★★
- Já existe carteira/assets; amarrar recompensas de missão a cosméticos desejáveis (avatares/frames) aumenta o "porquê" de completar.

### 3.3 Social / competição

#### B7 — Placar semanal (usuário e legião) · [Back] · ★★★ · ★★★
- `GET /leaderboards?scope=global|legion|province&period=weekly`: XP/missões no período.
- Cria o loop competitivo ausente (**D7**) e dá sentido às legiões/províncias.

#### B8 — Meta semanal de legião · [Back] · ★★ · ★★
- Objetivo coletivo ("legião conclui 500 missões") com recompensa a todos os membros — responsabilidade social.

#### B9 — Desafios de amigos / rivais · [Back] · ★★ · ★★★
- Seguir usuários e comparar progresso; "seu rival te passou".

### 3.4 Conteúdo e personalização

#### B10 — Missões com prazo/eventos sazonais · [Back] · ★★ · ★★
- Missões-relâmpago (janela curta) e eventos temáticos (ex.: "Semana de Engineering") criam urgência e novidade.

#### B11 — Recomendação evolutiva · [Back] · ★★ · ★★
- O feed recomendado já existe; incorporar horário/histórico de conclusão e dificuldade ideal (nível de desafio adaptativo).

#### B12 — Campanhas como arcos narrativos · [Back] · ★★ · ★★
- Progresso multi-dia visível, com "próximo capítulo" — investimento de longo prazo.

---

## 4. Roadmap sugerido (por fases)

| Fase | Foco | Itens |
|------|------|-------|
| **1 — Quick wins (front)** | Trazer a ação para a frente | F1, F2, F3, F4 |
| **2 — Gatilho de retorno** | Fazer voltar todo dia | B1 (push), B2 (briefing), F6 |
| **3 — Gratificação** | Recompensa imediata + variável | B3, B4, B5, F5 |
| **4 — Social/competição** | Loop de longo prazo | B7, B8, F7 |
| **5 — Conteúdo** | Novidade e retenção | B10, B11, B12 |

---

## 5. Métricas para validar

- **DAU/MAU** e **D1/D7/D30 retention**.
- **Missões concluídas por usuário/dia** e **taxa de conclusão** (iniciadas → concluídas).
- **Streak médio** e % de usuários com streak ativo.
- **Tempo até a 1ª missão** na sessão (deve cair com F1/F4).
- **CTR do push** (B1) e **abertura do briefing** (B2).
- **Taxa de reclamação/abandono** (`abandon`) por dificuldade.

---

## 6. Mapa problema → solução

| Problema | Resolvido por |
|----------|---------------|
| D1 Home feed-first | F1 |
| D2 Tela densa | F1, F4 |
| D3 Recompensa adiada | F3, B3 |
| D4 Sem gatilho de retorno | B1, B2 |
| D5 Streak subutilizado | F2, F6, B4 |
| D6 Cards apagados | F5 |
| D7 Sem competição | B7, B8, B9 |
| D8 Meta diária invisível | F1, F2 |
