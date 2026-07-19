# Via Imperii — Mapa de Navegação do App

Documentação da **navegação de telas** do app (Expo / React Native). Cada
arquivo mapeia uma tela (ou grupo) descrevendo **clique → destino → resultado**,
para ter uma visão clara de para onde cada interação leva.

> Fonte: leitura do código em `src/navigation/` e `src/screens/`. Atualize ao
> alterar rotas, botões de navegação ou fluxos.

---

## Índice

| Arquivo | Cobre |
|---------|-------|
| [00-arquitetura-navegacao.md](00-arquitetura-navegacao.md) | Árvore de navegadores, gating por auth, param lists |
| [01-auth.md](01-auth.md) | Splash, Login, Signup (3 passos), Esqueci a senha, Quiz de especialidade |
| [02-dashboard.md](02-dashboard.md) | Home (feed social, botões do topo, modais de onboarding) |
| [03-missions.md](03-missions.md) | Missões (Minhas Missões / Revisão), ciclo de vida do card, evidência |
| [04-legions.md](04-legions.md) | Legiões + Quartel-General (WarRoom) |
| [05-profile.md](05-profile.md) | Perfil (próprio e de terceiros), avatar |
| [06-ranks.md](06-ranks.md) | Patentes (ladder) |
| [07-achievements.md](07-achievements.md) | Conquistas |
| [08-feed-social.md](08-feed-social.md) | FeedCard, PostDetail, comentários, notificações, busca, criar post |
| [09-componentes-globais.md](09-componentes-globais.md) | Navbar, UserMenu, Bottom Tabs, modais compartilhados |

---

## Como ler as tabelas

Cada interação é descrita como:

- **Elemento** — o que o usuário toca (botão, card, ícone, item de lista).
- **Ação** — o gesto (toque, toque longo, submit).
- **Destino** — para onde vai: uma **tela** (`Navigate → X`), um **modal**, um
  **popover**, ou permanece na tela (`—`).
- **Resultado** — o efeito (o que abre/muda/dispara).

### Convenções

- `Navigate → Tela` = empurra/vai para outra rota do stack.
- `goBack()` = volta para a tela anterior.
- **Modal** = overlay em tela cheia ou central (não é rota de navegação).
- **Popover** = balão ancorado a um elemento.
- **Tab** = troca de aba na barra inferior (Bottom Tabs).

---

## Visão geral (árvore de navegação)

```
App
└─ SplashScreen (2s)  →  NavigationContainer
   └─ RootNavigator  (gate: accessToken?)
      ├─ [SEM login]  AuthStack (native-stack)
      │   ├─ Login
      │   ├─ Signup            (passos 1→2→3 internos)
      │   ├─ ForgotPassword
      │   └─ SpecialtyQuiz
      │
      └─ [COM login]  BottomTabs (5 abas)
          ├─ Home  →  HomeStack (native-stack)
          │            ├─ Dashboard
          │            ├─ Ranks
          │            ├─ Legions
          │            ├─ WarRoom      { legionId }
          │            ├─ Profile      { userId? }
          │            └─ PostDetail   { post }
          ├─ Missions
          ├─ CreatePost   (não navega — abre modal de criar post)
          ├─ Achievements
          └─ Profile
```

- **Splash** é controlada por estado em `App.tsx` (não é rota) — some após ~2s.
- **RootNavigator** decide `AuthStack` vs `BottomTabs` pelo `accessToken` do
  `AuthContext`. Login/logout **troca a árvore inteira** (não é `navigate`).
- O **UserMenu** e a **Navbar** aparecem em quase todas as telas internas
  (ver [09-componentes-globais.md](09-componentes-globais.md)).
