@AGENTS.md

# Via Imperii — Guia do Projeto

App mobile (Expo / React Native) gamificado com identidade romana. Plataforma de
produtividade onde o usuário evolui de patente, escolhe trilha e legião, conclui
missões/campanhas e ganha maestrias, medalhas e conquistas.

> Backend (FastAPI): `E:\projetos\python\viaimperii`. Sempre confira contratos lá antes
> de assumir formato de resposta.

---

## STACK

- **Expo SDK 54** · React Native 0.81 · React 19 · Hermes
- **NativeWind v4** (Tailwind) para estilo — cores custom em `tailwind.config.js`
- **React Navigation**: Bottom Tabs (raiz logada) + Native Stack (`HomeStack`)
- **@tanstack/react-query** (queries/mutations, invalidação por `queryKey`)
- **@tanstack/react-form** + **zod** (formulários/validação)
- **expo-secure-store** (tokens) · **expo-location** (província) · **react-native-svg** (ícones)
- **expo-dev-client** + `eas.json` (perfil `development`)

---

## STYLE

- **Cor primária (Imperial Red):** `#9E1B32` → classe `primary` / `bg-primary`
- **Ouro (Imperial Gold):** `#D4AF37` → `gold` (destaques, recompensas, XP)
- **Verde-louro (Laurel):** `#2F7A52` → `laurel` (sucesso/conclusão)
- **Charcoal:** `#121212` → `charcoal` (texto principal)
- **Light Gray:** `#EAEAEA` → `lightgray` (bordas/divisores da tab bar)
- **Branco:** `#FFFFFF` (cards/superfícies)
- **Fundo de tela padrão:** `#fafafa`
- **Bordas de card:** `#f0eded`; divisores finos: `#f0f0f0` / `#f4f1f1`
- **Texto secundário:** `#888` / `#999`; placeholder: `#aaa`

### Tipografia
- **Títulos / nomes próprios** (patente, legião, saudação): fonte serifada —
  `fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif'`, peso `extrabold`.
- **Corpo / rótulos:** fonte de sistema. Tamanhos comuns: 11–13 (labels), 14 (corpo),
  20–28 (títulos).
- **Labels uppercase** com `tracking-[2px/3px]` para overlines (ex.: "SUA PATENTE").

### Componentes / layout
- **Cards:** `bg-white border border-[#f0eded]`, raios `14`/`16`/`18`/`20`.
- **Card de destaque (patente):** `bg-primary`, texto branco, barra de progresso `bg-gold`.
- **Espaçamento:** padding de tela `20`; `gap` entre seções `16`–`22`.
- **Ícones:** **monoline estilo Lucide**, `viewBox 0 0 24 24`, `strokeWidth 2`
  (`2.2` quando ativo), cantos arredondados, cor única via prop `color`.
  Ícones de navegação em `src/navigation/icons/`; de maestria em `src/components/masteryIcons/`.
- **Bottom Tab Bar:** elevada com `useSafeAreaInsets` (não conflita com gestos do SO);
  ativo em `primary`, inativo `#9aa0a6`.
- **UserMenu:** dropdown no ícone do usuário, com indicador (caret); opções
  Editar / Alterar senha / Sair. Alinhado a 20px do topo em todas as telas.

### Identidade visual (regras de marca)
- Estética **Modern SaaS** (inspiração: Linear, Notion, Duolingo, Strava, Revolut).
- Referências romanas **apenas** em: nomes de patente/legião/conquista, ícones, paleta.
- **Evitar:** colunas, pergaminho, visual medieval, construções antigas, estética RPG.

---

## NAVEGAÇÃO

- **Raiz logada:** `BottomTabs` (4 abas) — `Home` · `Missions` · `Legion` · `Achievements`.
  - `Home` é um `HomeStack`: `Dashboard` → `Ranks`, `Legions`, `Profile`.
  - **Perfil não é aba** — acessado pelo dropdown do usuário (opção "Editar").
- **Não logado:** `AuthStack`.
- Ícones das abas são SVG (`HomeIcon`, `MissionsIcon`, `LegionIcon`, `AchievementsIcon`).

---

## CONVENÇÕES DE CÓDIGO

- **Toda screen** é uma pasta com `index.tsx` (`src/screens/<nome>/index.tsx`).
- **Componentes** são pastas com `index.tsx` + barrel `index.ts` na pasta-mãe.
  Globais em `src/components/`; específicos em `src/screens/<screen>/components/`.
- **Model por screen:** `model/queries/` (hooks de query) e `model/mutations/`.
- **APIs** em `src/api/<dominio>/<dominio>Api.ts`.
- Importar componentes pelos barrels (`from '../../components'`).

---

## API / AUTENTICAÇÃO

- **Envelope:** TODA resposta JSON (sucesso E erro) vem como `{ time, content }`.
  Use `readContent<T>(res)` e `readError(res, fallback)` de `api/config/defaultApi`.
  Nunca leia `res.json().detail` direto — o detalhe fica em `content.detail`.
- **JWT:** access token (60 min) + refresh token (7 dias, rotacionado).
- **Refresh:** `apiFetch` faz refresh **proativo** (token expirado) e **reativo** no 401
  **apenas quando o token está de fato expirado** (`isTokenExpired`), para não deslogar
  em 401 de negócio (ex.: senha errada). Falha no refresh → `expireSession` (logout).
- **Mutations** invalidam as `queryKey` afetadas (ex.: concluir missão invalida
  `missions`, `missions-available`, `user-profile`, `ranking`).

---

## REGRAS DE NEGÓCIO

### Patentes (Ranks)
- **36 patentes**, de Recruta I a Imperador; cada nível exige **500 XP** (`XP_PER_RANK`).
- Patente derivada do `total_xp` e da **trilha** do usuário.
- `GET /ranks?trackId=<id>` retorna as patentes da trilha **+ as compartilhadas**
  (Recruta I–IV e Governador/Senador/Imperador têm `track_id = NULL`).

### Trilhas (Tracks)
- Duas trilhas: **Legionários** (`legionarios`) e **Patrícios** (`patricios`).
- **Escolha no Recruta IV** (nível 4 = `CHOICE_RANK_INDEX`, ~1500 XP): primeira escolha é
  **grátis**; trocar depois custa **25% do XP atual**.
- Abaixo de Recruta IV o usuário ainda não tem trilha (fica vazio no card).

### Missões
- Tipos: `daily` / `monthly`. Dificuldade: `easy` / `medium` / `hard`.
- **Abaixo de Recruta IV (< 1500 XP): só missões `easy`** (`?difficulty=easy`).
- `GET /missions/available` = não iniciadas e não concluídas (sem repetição).
- Status: `available` / `in_progress` / `completed`.
- Listagens ordenadas por dificuldade (easy → medium → hard).
- Concluir (`POST /missions/{slug}/complete`) concede XP + maestria, atualiza patente e
  pode desbloquear medalha.

### Legiões
- **Abertas/mistas** — qualquer especialidade entra em qualquer legião.
- 5 legiões temáticas + **Legio X Equestris** (somente admin → **ocultar** de usuários comuns).
- **Escolha após a 1ª missão concluída** sem legião: o `complete` retorna
  `requires_legion_selection: true` + `recommended_legions` (tema da missão + correlata).
  No login, se já houver missão concluída e nenhuma legião, abrir o modal de escolha.
- Ingresso via `POST /users/{id}/legion` → retorna `balance_status`
  (`shortage`/`balanced`/`excess`, **apenas informativo**).
- A escolha **não altera XP nem patente** e fica **travada por 60 dias** (confirmar antes).
- **Cor da legião** = posição na listagem (`legionColorById`), consistente entre telas.

### Maestrias
- Especialidades (tabela `strategies`, em inglês): **Engineering, Strategy, Commerce,
  Diplomacy, Exploration**. Nomes latinos exibidos: Fabrorum, Strategica, Mercatorum,
  Diplomatica, Exploratorum.
- **Progresso:** teto (100%) = `pontos_atuais + (nível_da_patente × 10)`.
- Medalha desbloqueada quando uma especialidade atinge `MASTERY_FOR_MEDAL` (100) pontos.
- ⚠️ Há duas taxonomias no backend: `strategies` (inglês, marca as missões) vs
  `specialties` (português, usada no filtro `/specialties`) — por isso pode aparecer
  "Commerce" em missão de comunicação.

### Campanhas
- `GET /campaigns`: `required_missions[]`, `reward_xp`, `reward_medal`.
- Progresso = missões requeridas presentes em `completed_missions` ÷ total requerido.

### Conquistas (Achievements)
- Desbloqueada quando `achieved_at != null`.
- Na **home**: só desbloqueadas, **máx. 3**. Na tela de Conquistas: todas (bloqueadas
  separadas/esmaecidas). Nunca mostrar bloqueadas como destaque.

### Província
- Provinces = 27 estados BR + 51 estados/DC dos EUA.
- **Ao abrir o app sem província:** modal temático → permissão de localização →
  `reverseGeocode` → `GET /provinces?name=<estado>` → confirmar → `PATCH /users/{id}/province`.
  Permissão negada ou sem correspondência → **seleção manual** (busca em `/provinces`).
- Ordem de modais automáticos na home: **senha temporária → província → legião**.

### Senha temporária
- Login com `is_temporary_password: true` abre o `ChangePasswordModal` imediatamente,
  só fecha após atualizar (`PATCH /auth/password`).
</content>
