# Análise de Usabilidade & UX — Tela de Missões

Auditoria criteriosa da tela de Missões (`src/screens/missions/`), o loop central do
app. Cada ponto tem **severidade**, **evidência no código**, **impacto no usuário** e
**recomendação**. Complementa `docs/engajamento-missoes.md` (foco em engajamento);
aqui o foco é **usabilidade, clareza e fricção**.

Legenda de severidade:
- 🔴 **Crítico** — quebra o loop principal (iniciar → executar → recompensar → evoluir) ou confunde a maioria dos usuários.
- 🟠 **Médio** — atrito relevante, mas com contorno; afeta parte dos usuários.
- 🟡 **Baixo** — polimento, consistência, casos de borda.

---

## Mapa da tela (o que o usuário enfrenta)

Pilha de controles **antes** do primeiro card de missão:

1. Abas de modo: **Missões · Progresso · Revisão** (`index.tsx:435`)
2. Cabeçalho de meta diária + ofensiva (`DailyGoalHeader`)
3. Caixa vinho: seletor **Diárias · Semanais** + saldo (`index.tsx:497`)
4. Barra de cota esgotada + vídeo premiado (condicional)
5. Dois cards: **Missões de profissão** + **Comprar** (`index.tsx:560`)
6. Abas de status: **Disponíveis · Ativas** (`MissionsTabs`)
7. Sub-abas de ordenação: **Recomendadas · Todas** (`index.tsx:634`)
8. Botão **Filtrar** (colapsado) → especialidade + nível
9. Finalmente, a lista de cards

➡️ São **4 conjuntos de segmented controls** + 1 filtro empilhados na mesma tela.

---

## 🔴 Críticos

> **Status:** C1, C2, **C3** e **M1** implementados na branch `feature/missions-ux-c1-c2`
> (backend já removeu a espera das fáceis, reduziu pela metade a de médias/difíceis e
> passou a exigir `reason` ≥ 20 caracteres na rejeição).

### C1 — Recompensa da conclusão é sempre adiada e silenciosa
- **Evidência:** `complete` nunca credita XP na hora; vira `pending_review`
  (`missionItem.tsx:57` `ReviewPanel`). Fácil = timer de 30min (`pointsCreditIn`);
  médio/difícil = aprovação de pares. O card mostra `+X XP` em destaque
  (`missionItem.tsx:327`) mas o toque em **"Concluir missão"** não entrega nada imediato.
- **Impacto:** o momento de maior dopamina do loop (concluir) não tem retorno. Para
  missão **diária fácil**, o usuário espera 30min por pontos que ele "sente" que já ganhou.
  Mismatch de expectativa → sensação de bug / esforço sem prêmio.
- **Recomendação:**
  - Deixar o **adiamento explícito ANTES** de concluir (ex.: no botão ou num aviso):
    "Conclusão passa por validação de X min/pares".
  - Micro-recompensa imediata no envio (moeda simbólica, XP parcial, ou animação de
    "enviado + reservado") para não deixar o toque "vazio".
  - Reavaliar a janela de 30min para **fáceis** — é o tipo que mais precisa de retorno rápido.

### C2 — Missão não diz o que precisa ser feito
- **Evidência:** `MissionItem` exibe só nome + pílulas + recompensa. O
  **`acceptance_criteria`** (o "como cumprir") só aparece **dentro do EvidenceModal**
  (`evidenceModal.tsx:146`), ou seja, **depois** de Iniciar e clicar em Concluir — e
  **apenas** quando `proof_type != none`. Missão sem prova **nunca** mostra critério nem descrição.
- **Impacto:** usuário inicia sem saber a tarefa. Em missões sem prova, conclui "no
  escуро". Prejudica diretamente a **evolução real** (a missão deveria ensinar/orientar).
- **Recomendação:**
  - Card expansível ("ver detalhes") com **descrição/objetivo + critério de aceite**
    visível **antes** de Iniciar.
  - Garantir que toda missão tenha um texto de objetivo (não só `acceptance_criteria`).

### C3 — Rejeição de missão sem motivo (loop de aprendizado quebrado) — ✅ implementado
- **Evidência:** `ReviewItem` chama `onReject(slug, executorId)` **sem coletar razão**
  (`reviewItem.tsx:152`), embora o backend aceite `reason?` (CLAUDE.md §7). O executor
  rejeitado recebe só um toast genérico `toastRejectedBody` (`missionItem.tsx:117`).
- **Impacto:** quem fez a missão volta para `in_progress` **sem saber por que** foi
  reprovado. Refaz às cegas, frustra e pode reincidir no mesmo erro. Contradiz o objetivo
  de "evolução dos usuários".
- **Recomendação:**
  - Modal de rejeição com **motivo obrigatório** (ou presets: "evidência ilegível",
    "não cumpre o critério", "link quebrado").
  - Exibir o motivo ao executor no card e/ou notificação.

### C4 — Sobrecarga cognitiva: 4 níveis de abas na mesma tela
- **Evidência:** Modo (`index.tsx:435`) → Tipo (`:497`) → Status (`MissionsTabs`) →
  Ordenação (`:634`), + Filtros. Termos sobrepostos e ambíguos:
  - "Missões" (modo) vs "Ativas" (status) vs "Disponíveis";
  - "Recomendadas/Todas" logo abaixo de "Disponíveis/Ativas".
- **Impacto:** o usuário não constrói um modelo mental claro de "onde estou / onde acho X".
  Numa tela que deveria ser a mais fluida do app, o caminho até o primeiro card é longo.
- **Recomendação:**
  - Fundir camadas: "Recomendadas/Todas" pode virar um **ordenador discreto** (ícone),
    não uma aba. Considerar mover **Diárias/Semanais** para um toggle único no topo.
  - Levar a **ação-first**: abrir já com 2–3 recomendadas e Iniciar em 1 toque (alinha
    com F1 do doc de engajamento).

---

## 🟠 Médios

### M1 — `Alert.alert` nativo viola o padrão de UI do projeto — ✅ implementado
- **Evidência:** confirmação de "desistir" usa `Alert.alert` (`missionItem.tsx:207`).
- **Regra violada:** CLAUDE.md §0.1 — confirmações devem usar **overlay padrão**
  (estilo `LegionSelectModal`), **"nunca Alert nativo"**.
- **Impacto:** inconsistência visual + quebra de identidade romana num momento destrutivo.
- **Recomendação:** trocar por modal de confirmação no padrão do app (já há um pronto no
  `shareConfirm`, `index.tsx:784`, reutilizável).

### M2 — Estados de rejeição/expiração dependem de polling e não são imediatos
- **Evidência:** cada card `pending_review` tem um `useMissionStatus` com polling
  adaptativo (até 60s longe do prazo — `useMissionStatus.ts:22`). Rejeição por par só
  aparece no próximo poll.
- **Impacto:** feedback de aprovação/rejeição pode demorar ~1min; com várias missões ativas,
  vários timers/polls simultâneos (custo de bateria/rede).
- **Recomendação:** já existe SSE (`useMissionEvents`) — garantir que rejeição/aprovação
  cheguem por evento e reduzir a dependência de polling por card.

### M3 — Arquitetura de informação: atalhos de loja no meio do fluxo
- **Evidência:** cards **"Missões de profissão"** + **"Comprar"** ficam entre o seletor de
  tipo e a lista (`index.tsx:560`), interrompendo o caminho até as missões.
- **Impacto:** desvia atenção do loop principal; card de compra dourado compete visualmente
  com a ação primária (Iniciar).
- **Recomendação:** mover para o fim da lista ou para um ponto de entrada secundário; manter
  o topo focado na ação de missão.

### M4 — Acessibilidade: cor como único código + rótulos ausentes
- **Evidência:** dificuldade transmitida só por cor (verde/dourado/vermelho —
  `missionItem.tsx:31`); setas/indicadores por emoji `▲▼ ‹ › ✨`; maioria dos
  `TouchableOpacity` sem `accessibilityLabel`/`accessibilityRole` (só 2 no arquivo têm).
- **Impacto:** daltônicos não distinguem nível; leitores de tela leem pouco/nada dos botões.
- **Recomendação:** adicionar rótulo textual de nível (já há), `accessibilityRole="button"`
  + `accessibilityLabel` nas ações; não depender só de cor.

### M5 — Diferença "Recomendadas × Todas" não é explicada
- **Evidência:** duas sub-abas (`index.tsx:635`) sem tooltip/legenda; "Recomendadas" traz
  chips de motivo (`reasons`) só em alguns cards.
- **Impacto:** usuário não entende por que a lista muda; pode achar que "sumiram" missões.
- **Recomendação:** microcopy curta ("Sugeridas pra você" vs "Catálogo completo") e manter
  os chips de motivo consistentes.

### M6 — Feedback tátil e celebração inconsistentes entre caminhos
- **Evidência:** `Vibration.vibrate` e `MissionCelebration` disparam em alguns fluxos
  (`index.tsx:253`, `:397`), mas a finalização por tempo/aprovação cai em toast
  (`missionItem.tsx:110`) quando não há callback.
- **Impacto:** a mesma conquista (ganhar XP) tem retornos diferentes conforme o caminho.
- **Recomendação:** unificar a celebração de "XP creditado" independente da origem.

### M7 — Meta diária ≠ cota diária pode confundir
- **Evidência:** `DailyGoalHeader` usa `DAILY_MISSION_GOAL` (meta) enquanto a caixa de
  tipo mostra saldo da **cota** `DAILY_MISSION_LIMIT` (10) (`dailyGoalHeader.tsx:27`).
- **Impacto:** dois números de "diárias" (ex.: meta 5 vs restam 8) sem relação explícita.
- **Recomendação:** relacionar visualmente (ex.: "3/5 da meta · 7 de 10 slots restantes")
  ou unificar o conceito.

---

## 🟡 Baixos — ✅ todos endereçados na branch `feature/missions-ux-b-polish`

### B1 — Sem skeletons; só spinners — ✅ implementado
- Novo `MissionSkeleton` (cards fantasma com shimmer) substitui os spinners nas
  listas de disponíveis, ativas e histórico.

### B2 — Onboarding só uma vez, sem reabrir — ✅ implementado
- Botão "?" ao lado do título "Missões" reabre o mini-tour (`setOnboardingSeen(false)`).

### B3 — Peso visual do vinho repetido — ✅ resolvido pelo C4
- A caixa de tipo pesada virou um toggle claro (C4). Hoje o único bloco vinho da view
  principal é o card hero de profissão (destaque intencional) — sem repetição.

### B4 — "Buscar mais" é client-side — ✅ implementado
- Copy ajustado para **"Ver mais"** (pt) / "Show more" (en); não sugere mais rede.

### B5 — Bônus de streak exibido pode divergir do creditado — ✅ endereçado
- O `+X%` exibido é o bônus vigente (mesmo `bonus_pct` que o backend aplica no
  finalize); dentro da sessão o streak não muda. Adicionado rótulo de acessibilidade
  ("Bônus de ofensiva de +X% XP") para clareza.

### B6 — `"Finalizando..."` hardcoded (fora do i18n) — ✅ implementado
- `formatRemaining` passou a receber o rótulo traduzido (`t('missionItem.finalizing')`).

### B7 — Emoji como ícone em UI definitiva — ✅ parcial
- Criados `ShieldIcon` (selo de trilha) e `PaperclipIcon` (selo de prova) em SVG,
  substituindo `🛡️`/`📎` nos chips do card. Emojis **decorativos** (empty states,
  onboarding, brilho ✨) mantidos como ilustração amistosa.

---

## Priorização recomendada

| Ordem | Item | Severidade | Esforço | Retorno |
|-------|------|-----------|---------|---------|
| 1 | C2 — descrição/critério antes de iniciar | 🔴 | Médio | Alto |
| 2 | C1 — recompensa imediata / adiamento explícito | 🔴 | Médio | Alto |
| 3 | C3 — motivo de rejeição | 🔴 | Baixo | Alto |
| 4 | C4 — reduzir camadas de abas | 🔴 | Alto | Alto |
| 5 | M1 — remover Alert nativo | 🟠 | Baixo | Médio |
| 6 | M3 — reordenar atalhos de loja | 🟠 | Baixo | Médio |
| 7 | M4 — acessibilidade | 🟠 | Médio | Médio |
| 8 | M2/M6 — feedback por evento unificado | 🟠 | Médio | Médio |

> **Resumo executivo:** os três maiores riscos do loop de missões são (1) **não saber o
> que fazer** (C2), (2) **concluir sem prêmio imediato** (C1) e (3) **ser rejeitado sem
> saber o porquê** (C3). Resolvê-los ataca diretamente a proposta central do app —
> missões que fazem o usuário evoluir.
