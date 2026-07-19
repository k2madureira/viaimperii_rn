# Documentação — Via Imperii (app)

Documentos organizados **por contexto**, uma pasta por tema. Regras de negócio do
produto vivem no `CLAUDE.md` da raiz (backend) e neste app; aqui ficam roadmap,
mapa do app e análises.

## Estrutura

| Pasta | Contexto | Conteúdo |
|---|---|---|
| [`backlog/`](backlog/backlog.md) | **Produto / PO** | Roadmap e specs. Fonte de verdade do Product Owner: `tasks/` (a fazer), `completed/` (feitas), `requests/` (pedidos a outra área). Índice em `backlog.md`. |
| [`architecture/`](architecture/README.md) | **Arquitetura / navegação** | Mapa de telas do app (clique → destino → resultado), uma página por tela + visão de navegação. |
| [`ux/`](ux/) | **UX / engajamento** | Auditorias de usabilidade e plano de engajamento (missões, navegação). |

## Convenções

- Um arquivo por assunto, **kebab-case**, extensão **`.md`**.
- Ao criar um doc novo, coloque-o na pasta do contexto certo (crie uma nova só se
  nenhuma servir).
- `backlog/` segue seu próprio fluxo (ver `backlog/backlog.md`).
