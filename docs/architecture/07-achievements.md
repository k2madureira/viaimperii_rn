# 07 — Conquistas (Achievements)

`screens/achievements/index.tsx`. Aba **Achievements** (Bottom Tabs) com `Navbar`
padrão. Lista conquistas desbloqueadas + a desbloquear, com filtro por
especialidade.

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| **FilterChip "Todas"** | toque | — | Remove o filtro de especialidade |
| **FilterChip** (especialidade) | toque | — | Filtra a lista; tocar de novo limpa o filtro |
| Linha de conquista | — | — | Só leitura (ícone, nome, XP, "Obtido" se desbloqueada) |
| **Tentar novamente** (erro) | toque | — | `refetch` do perfil |
| Pull-to-refresh | gesto | — | Recarrega o perfil (conquistas) |

> Tela de **leitura + filtro** — nenhuma interação navega para outra rota.
