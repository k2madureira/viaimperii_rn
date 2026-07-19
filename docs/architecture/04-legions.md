# 04 — Legiões e Quartel-General (WarRoom)

Fonte: `screens/legions/index.tsx` e `screens/legions/WarRoom.tsx`. Ambas no
`HomeStack` com `Navbar` padrão.

---

## Legiões (`screens/legions`)

Carrossel horizontal de brasões + card expandido da legião selecionada.

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| **Brasão** (linha superior) | toque | — | Seleciona a legião → atualiza o card expandido |
| Pull-to-refresh | gesto | — | Recarrega legiões + perfil |
| **Entrar no Quartel-General** (se é a sua legião) | toque | `Navigate → WarRoom { legionId }` | Abre o QG da legião |
| **Trocar de legião** (se tem outra) | toque | Modal de confirmação | Abre aviso de **penalidade** de XP |
| Modal → **Confirmar** | toque | — | `useJoinLegion` troca a legião (aplica penalidade) e fecha |
| Modal → **Cancelar** | toque | Fecha modal | — |
| Aviso "entre numa legião" (sem legião) | — | — | Texto informativo; ingresso ocorre pós 1ª missão (ver [03-missions.md](03-missions.md)) |

> A entrada na sua legião é o **único** ponto que navega para outra rota
> (`WarRoom`). Selecionar brasão e trocar de legião ficam na própria tela.

---

## Quartel-General / WarRoom (`screens/legions/WarRoom`)

Recebe `{ legionId }`. Detalhe da legião: brasão, nº de membros, atributos e
**territórios** (países → províncias com contagem de usuários).

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Pull-to-refresh | gesto | — | Recarrega o detalhe da legião |
| **Tentar novamente** (erro) | toque | — | `refetch` do detalhe |
| Voltar (gesto/seta do stack) | gesto | `goBack()` → Legions | Volta à lista de legiões |

- Sem cliques que naveguem para fora: é uma tela de leitura (territórios,
  membros por província).
