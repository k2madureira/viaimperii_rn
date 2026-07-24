# 06 — Patentes (Ranks)

`screens/ranks/index.tsx`. No `HomeStack`. **Header próprio** com seta de voltar
(exceção à Navbar padrão). Lista o ladder completo de patentes da trilha.

Acessos: pela **RankCard** do Perfil ou da própria tela de Ranks.

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Seta ‹ | toque | `goBack()` | Volta à tela anterior |
| **RankCard** (topo) | — | — | Patente atual + progresso de XP |
| Abas de **trilha** (Legionários/Patrícios) | toque | — | Troca `trackId` → recarrega o ladder daquela trilha |
| Lista de patentes | scroll | — | Auto-scroll até a patente atual ao abrir |
| Item bloqueado (cadeado) | — | — | Patente de outra trilha / trilha não escolhida (só leitura) |
| Banner "escolha de trilha" (Recruta IV) | — | — | Informativo; a escolha real é feita no modal da Dashboard |
| **Tentar novamente** (erro) | toque | — | `refetch` do ladder |
| Pull-to-refresh | gesto | — | Recarrega ladder + perfil |

> Tela essencialmente de **leitura** — nenhuma ação navega para fora além do
> voltar. Os 3 últimos ranks têm XP oculto ("secreto").
