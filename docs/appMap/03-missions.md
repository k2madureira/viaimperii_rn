# 03 — Missões

`screens/missions/index.tsx` — aba **Missions** (Bottom Tabs). Usa `Navbar`
padrão. Dois grandes modos: **Minhas Missões** e **Revisão**. Quase toda a
interação acontece **na própria tela** (troca de estado), não em navegação de
rota. Modais: escolha de legião e evidência.

---

## Seletor de modo (topo)

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Aba **Minhas Missões** | toque | — | Mostra estatísticas + tipos + listas de missões |
| Aba **Revisão** (badge) | toque | — | Mostra a fila de missões para validar (peer review). Badge = nº pendentes |

---

## Minhas Missões

### Filtros e tipo

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| `StatsFilter` (período) | toque | — | Alterna weekly/monthly/annual → recarrega `PeriodStats` |
| Aba **Diárias** / **Semanais** | toque | — | Troca `missionType`. Semanais ocultas abaixo de Recruta IV |
| Sub-aba **Recomendadas** / **Todas** | toque | — | Ordena por score (feed recomendado) ou catálogo completo |
| `SpecialtyFilter` (chips) | toque | — | Filtra por especialidade |
| `DifficultyFilter` (chips) | toque | — | Filtra por nível (oculto/forçado "fácil" abaixo de Recruta IV) |
| **Assistir vídeo** (cota zerada) | toque | Anúncio premiado | `useRewardedVideo` → +2 slots diários ao concluir |
| Tabs de status (`available`/`inprogress`/`history`) | toque | — | Troca a lista exibida |
| **Buscar mais** | toque | — | Aumenta a paginação local (+5) |

### Card de missão (`components/missionItem`) — ciclo de vida

O botão do card muda conforme o `status`:

| Status | Botão | Ação → Resultado |
|--------|-------|------------------|
| `available` | **Iniciar missão** | `onStart` → `POST /start` → vira `in_progress` |
| `in_progress` | **Concluir missão** | Se `proof_type ≠ none` → abre **`EvidenceModal`**; senão conclui direto (`submitComplete`) |
| `in_progress` | **Desistir** | `Alert` de confirmação → `onAbandon` (sem perder XP) |
| `pending_review` | `ReviewPanel` (contador + aprovações) | Polla `GET /missions/{slug}`; ao finalizar → toast e sai de "Ativas" |
| `pending_review` | **Desistir** | Confirmação → abandona |
| `completed` | — | Só exibe data/recompensa (aba Histórico) |

**Resultado de concluir**:
- `submitComplete` → `useCompleteMission`. Sucesso pode retornar
  `requires_legion_selection` → abre **`LegionSelectModal`**.
- Se o backend exigir evidência (proof desatualizado) → reabre o `EvidenceModal`.

### EvidenceModal (`components/evidenceModal`)

Modal para provar a conclusão (proof_type link/text/image/any).

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Campo **Link** | digitar | — | Valida formato de URL + blocklist (feedback inline) |
| Campo **Descrição** | digitar | — | Mínimo 20 caracteres + blocklist |
| **Escolher imagem** | toque | Galeria | `expo-image-picker` → comprime → preview |
| **Enviar** | toque | — | Sobe imagem (presigned), envia evidência → `pending_review`. Backend modera NSFW (422 → toast) |
| **Cancelar** | toque | Fecha modal | — |

---

## Revisão (peer review)

Fila `GET /missions/to-review` — missões de outros que o usuário logado pode
validar. Card = `components/reviewItem`.

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Evidência tipo **link** | toque | Navegador externo | `Linking.openURL` abre o link |
| Evidência tipo **imagem** | — | — | Exibe a imagem (presigned GET) |
| **Aprovar** | toque | — | `useApproveMission` → 1 aprovação (corta janela); 2 finalizam; revisor ganha 10% XP |
| **Rejeitar** | toque | — | `useRejectMission` → volta a missão para `in_progress` (reenviar) |

> Nenhuma ação aqui muda de tela — tudo atualiza a fila via React Query + SSE
> (`useMissionEvents`).
