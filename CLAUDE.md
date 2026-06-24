# Via Imperii — Regras de Negócio e Guia do Projeto

Plataforma de gamificação inspirada na hierarquia do Império Romano. Usuários
progridem por **patentes** completando **missões** e **campanhas**, ganhando XP,
maestria, medalhas e conquistas, dentro de uma **trilha** de carreira.

Este documento concentra **todas as regras de negócio** aplicadas até agora.
Mantenha-o atualizado ao alterar comportamento.

---

## 1. Arquitetura e Convenções

- **Clean Architecture** em 4 camadas: `domain → application → infrastructure → presentation`.
  Dependências sempre apontam para dentro.
- **Módulos** por caso de uso: `src/application/modules/{entidade}/{ação}/` com `dto/`.
- **Repository Pattern**: ABCs em `application/ports/`, implementações Postgres e in-memory.
- **Dual persistence**: `USE_DATABASE=true` (ou `APP_ENV=production`) usa Postgres; senão in-memory.
- **SQLAlchemy 2.0** (sync, psycopg2), **Alembic** para migrações numeradas (`0001`…).
- **Soft delete**: toda tabela tem `created_at`, `updated_at`, `deleted_at`; leituras filtram `deleted_at IS NULL`.
- **ResponseWrapperMiddleware**: TODA resposta JSON é envelopada em `{ "time", "content" }`.
  > ⚠️ Front deve ler os dados em `response.content` (ex.: `content.access_token`).
- **Versionamento**: todos os endpoints sob `/api/v1`.
- **Seeds idempotentes** em `src/infrastructure/database/seeds/` (rodar após migrações).
- **Fuso horário canônico = `America/Sao_Paulo`**: toda regra de janela/prazo voltada ao
  usuário (reset de missões diárias/semanais, limite de vídeos premiados, prazos de revisão
  de conclusão) é ancorada no fuso SP. O banco grava em **UTC**; a conversão SP→UTC é feita
  na borda da consulta (`_sp_day_start_utc` / `_sp_week_start_utc`). Timestamps de "reset"
  retornados ao front saem com offset SP.

### Fluxo de Git (obrigatório)

- **`develop` é a branch de integração**: todo trabalho é feito a partir dela.
- Cada feature em sua **própria branch** (`feature/<nome>`), criada a partir de `develop`.
- Feature finalizada → abrir **PR da feature para `develop`** (nunca direto para `main`).
- A cada **3 features** integradas em `develop` → cortar **release**: merge `develop` → `main`,
  criar **tag** semver e GitHub Release. `main` só recebe código via release de `develop`.
- **Versionamento**: bump **minor** (`vX.Y.0`) por release de features; **patch** (`vX.Y.Z`)
  para hotfixes pontuais.
- Mensagens de commit em inglês, imperativas; PR/release notes podem ser em PT-BR.

---

## 2. Usuários

> **Proteção de XP**: `PostgresUserRepository.save()` **nunca zera** o `total_xp` de um
> usuário já cadastrado — um `total_xp = 0` recebido para usuário existente com XP é tratado
> como "sem alteração" (operações legítimas de XP sempre persistem valor positivo). Evita
> reset acidental de pontuação por fluxos que recarregam o usuário sem o XP.


- **Criação flexível**: bastam `name` + `email`. `password`, `specialty_id`,
  `province_id` e `invite_code` são opcionais.
- **`username` (name) NÃO é único**; **`email` é único**.
- **Senha opcional → senha temporária**: se `password` não for informada, o sistema
  gera uma temporária e marca `is_temporary_password = true` (coluna em `users`).
  - A senha temporária **respeita as regras de senha** (ver §3).
- **Código de convite (`invite_code`)**: se válido (igual a `INVITE_CODE` do ambiente),
  o usuário entra como **Recruit III** (XP inicial mais alto); senão, começa em **Recruit I**.
- **`specialty_id` opcional**: pode ser definido depois, via quiz de especialidade.
- **Admin** (`POST /users/admin`): exige email + senha; começa em **Tribune I**.

---

## 3. Regras de Senha

Validadas em `_validate_password` e aplicadas a cadastro, troca de senha e geração de temporária:

- Mínimo **7 caracteres**
- Pelo menos **1 letra maiúscula**
- Pelo menos **1 caractere especial** (`!@#$%^&*()_+-=[]{}|;':",./<>?`)
- Máximo **72 bytes** (limite do bcrypt)

A senha nunca é retornada; apenas o hash bcrypt é armazenado.

---

## 4. Especialidades e Quiz

5 especialidades (tabela `specialties`): **Engineering, Strategy, Commerce, Diplomacy, Exploration**.
A tabela é a fonte única — a antiga `strategies` foi renomeada para `specialties` e a tabela
`specialties` legada (CRUD isolado) foi removida (migration 0024). Endpoints: `/specialties`
(o antigo `/strategies` foi removido).

- Ao criar usuário, é gerado um **`specialty_test_code`** (token de **no máximo 7
  caracteres, todos maiúsculos**) e enviado por **e-mail** (Mailtrap).
- **Acesso ao quiz** exige o header **`X-Test-Code`** com esse código.
- Fluxo:
  1. `POST /specialty-quiz/verify` (email + test_code) → retorna o **UUID** do usuário.
  2. `GET /specialty-quiz` (header `X-Test-Code`) → 7 perguntas.
  3. `POST /specialty-quiz/submit` → retorna o `specialty_id` recomendado.
  4. `PATCH /users/{id}/specialty` → grava a especialidade escolhida.
- **Bloqueio de login**: se `is_temporary_password = true` **E** `main_specialty IS NULL`,
  o login retorna **403** ("Cadastro incompleto. Verifique seu e-mail e use o código enviado").

---

## 5. Patentes (Ranks) e Curva de XP

- **36 patentes por trilha**. A patente é **derivada do `total_xp`** (não armazenada como verdade).
- **Curva de XP progressiva e acumulativa** (`RANK_XP_INCREMENTS` → `RANK_THRESHOLDS`):
  - **Fácil até Legionary III** (incrementos de 200–300 XP; ~1.500 XP).
  - A partir daí o custo **acelera** a cada promoção (até Emperor ≈ **370.600 XP**).
  - **Muralha de mid-game Immune → Centurion** (níveis 9–24, ambas as trilhas — Immune→Centurion
    nos Legionários, Scriba→Praetor nos Patrícios): incrementos engrossados, cruzar o trecho
    custa ~101k XP (≈1,5× o original). A curva permanece **monotônica** (nenhuma promoção fica
    mais barata que a anterior). Quanto mais alta a patente, mais difícil subir.
- **Sem migração de dados ao recalibrar**: como a patente vem do XP, mudar a curva
  recalibra todos os usuários automaticamente na leitura.
- Cada patente tem **`image_url`** (arte em S3) e `icon_url`. O `GET /ranks` expõe o
  **`xp_required`** (XP acumulado para atingir a patente) por item.

---

## 6. Trilhas de Carreira (Legionários / Patrícios)

Duas trilhas paralelas com a **mesma profundidade** (36 níveis); diferem apenas nos
**nomes** dos níveis 5–33.

- **Compartilhado (início):** Recruit I–IV (níveis 1–4).
- **Compartilhado (topo):** Governor, Senator, Emperor (níveis 34–36) — **não duplicados**.
- **Legionários (mid 5–33):** Legionary → Immune → Decanus → Optio → Centurion →
  Primus Pilus → Tribune (×4) + **Legate** (29 patentes).
- **Patrícios (mid 5–33):** Discipulus → Scriba → Quaestor → Aedilis → Praetor →
  Consul → Proconsul (×4) + **Censor** (29 patentes).

Regras:

- **Escolha no Recruit IV**: ao atingir Recruit IV o usuário **deve escolher** uma trilha.
  - Enquanto não escolhe, a progressão fica **capada em Recruit IV** mesmo com XP suficiente.
  - O flag **`must_choose_track`** indica essa pendência (exposto no login e no detalhe).
- **Primeira escolha é gratuita**.
- **Troca de trilha após a escolha tem penalidade de 25% do XP atual**
  (`TRACK_CHANGE_PENALTY_PCT = 0.25`); a patente é recalculada após a penalidade.
- Endpoints: `GET /tracks`, `POST /users/{id}/track`.
- Tabela `tracks`; `ranks.track_id` e `users.track_id` (NULL = compartilhado).

---

## 7. Missões

- **Tipos**: `daily` e `monthly`. **Dificuldades**: `easy`, `medium`, `hard`.
- **Recompensas por dificuldade** (diárias): easy 50 XP/5 maestria, medium 100/10,
  hard 180/18. **Mensais**: 600 XP / 60 maestria.
- **FKs**: `specialty_id` (estratégia) e **`track_id`** (NULL = disponível para ambas as trilhas).
  - **Atribuição de trilha por análise do nome** (`scripts.set_mission_tracks`): Engineering e
    Exploration → **Legionários** (militar/engenharia/campo); Strategy, Commerce e Diplomacy →
    **Patrícios** (statecraft civil/político/econômico — Strategy resolvido pela análise do nome,
    pois suas missões são de gestão/negócio). Atualmente 88 Legionários / 132 Patrícios, 0 NULL.
- **Visibilidade para o usuário**: hoje o filtro de especialidade traz **todas** as
  especialidades (principal primeiro); o que de fato restringe é a **trilha**:
  - **Usuário COM trilha**: vê `track_id IS NULL` OU `track_id = trilha do usuário`.
  - **Usuário SEM trilha** (`track_id = NULL`, Recruit I–III antes de escolher): vê o
    **catálogo completo** (ambas as trilhas), para conseguir ganhar XP até o Recruit IV.
    Sem isso, como nenhuma missão tem `track_id = NULL`, o Recruit ficaria com 0 missões.
- **Status por usuário**: `available` | `in_progress` | `pending_review` | `completed`.
- **Reset recorrente por janela (SP)**: missões `daily` voltam a `available` **a cada dia**
  (meia-noite SP) e `monthly` (bucket semanal) **a cada semana ISO** (segunda 00:00 SP).
  - O status NÃO é permanente: `_user_missions_with_status` só considera `completed`/`in_progress`
    se o `completed_at`/`started_at` do registro estiver **dentro da janela atual** do tipo da
    missão (`_window_start_for_type`). Conclusões de janelas passadas reabrem como `available`.
  - **Refazer**: o `start` detecta janela vencida e **reseta o mesmo registro** `user_missions`
    para um novo `IN_PROGRESS` (não cria linha nova — a unicidade `(user_id, mission_id)` se mantém).
    Refazer concede XP/maestria de novo e registra nova entrada em `user_xp_log` (histórico preservado).
- **Ciclo de vida**:
  - `POST /missions/{slug}/start` → cria/reseta registro **IN_PROGRESS** em `user_missions`.
    409 se já iniciada/concluída **na janela atual**; se a janela já virou, reabre para refazer.
  - `POST /missions/{slug}/complete` → **pedido de conclusão** (não conclui na hora):
    exige **IN_PROGRESS**; muda para **PENDING_REVIEW** e abre a **janela de revisão**
    (`completion_requested_at`, `completable_at = now + janela(dificuldade)`). **NÃO** concede
    XP ainda. Retorna `status: pending_review`, `completable_at`, `remaining_seconds`,
    `approvals_required`.
    - **Impõe o limite do bucket** (via `_mission_allowance`, ciente do bônus de rewarded video):
      retorna **409** se o saldo diário/semanal já chegou a 0. Também 409 se já estiver
      `PENDING_REVIEW`/`COMPLETED`.
    - **Gatilho de legião**: no pedido de conclusão da **primeira missão** sem legião definida,
      a resposta traz `requires_legion_selection: true` + `recommended_legions` (tema + correlata) — ver §14.
    - **Evidência**: se `missions.proof_type` ≠ `none` (`link|image|text|any`), o pedido de
      conclusão exige a evidência no body (`{ link?, text?, image_key? }`), gravada em
      `mission_submissions`. Imagem sobe via `POST /uploads/presign` (presigned PUT) como
      **objeto PRIVADO** no S3 (`viaimperii/submissions/...`); a submission guarda a **key** e o
      `to-review` devolve um **presigned GET** temporário. 422 se faltar a evidência.
      **Dedup**: SHA-256 do objeto (`image_hash`) bloqueia o mesmo usuário reusar um print (422).
  - **Janela de revisão por dificuldade** (`COMPLETION_WINDOW_HOURS`, tunável): easy 30min,
    medium 4h, hard 6h. A janela usa relógio absoluto (UTC) mas o conceito de prazo segue
    o fuso SP do projeto.
  - **Rejeição** (`POST /missions/{slug}/reject`, `{ executor_id, reason? }`): revisor elegível
    (mesma legião, 1–2 patentes acima, medium/hard) reprova a evidência → missão volta a
    **IN_PROGRESS** para reenviar; limpa a janela e as aprovações.
  - **Finalização** (→ COMPLETED, concede XP/maestria/medalha, recalcula patente, grava `user_xp_log`)
    acontece por **2 caminhos**:
    1. **Tempo**: job `mission_finalizer` (apscheduler, a cada 5 min) finaliza todo
       `PENDING_REVIEW` com `completable_at <= now`. **Além disso**, a listagem finaliza
       *na leitura* as missões vencidas do próprio usuário (`_finalize_due_for_user`),
       evitando o gap de até 5 min entre execuções do job (importante p/ easy, cuja janela
       de 30min só finaliza por tempo). O job permanece como rede de segurança.
    2. **Aprovação de pares** (só `medium`/`hard`): `POST /missions/{slug}/approve`
       (`{ executor_id }`, aprovador = logado). O aprovador deve (a) pertencer à **mesma legião**
       do executor (independente da trilha; executor sem legião não pode ser aprovado) e (b) estar
       **1 a 2 patentes ACIMA** do executor (`APPROVAL_MAX_RANK_GAP = 2`, índice de patente derivado
       do XP, capado em Recruit IV sem trilha). **1 approve corta a janela pela metade**; **2 approves
       (`APPROVALS_TO_FINALIZE`) finalizam na hora**. Anti-duplicata por `(user_mission_id, approver_user_id)`.
       - **Recompensa do revisor**: cada aprovação concede ao revisor **10% do XP** da missão
         revisada (`REVIEW_XP_PCT`), registrado em `user_xp_log` (`source_type="review"`) e
         recalculando a patente do revisor. Exposto em `reviewer_xp_earned` na resposta do approve.
    - A concessão de XP é centralizada em `finalize_pending_mission()` (usada pelo job e pelo approve).
  - **Fila de revisão (pull)**: `GET /missions/to-review` lista as missões `PENDING_REVIEW`
    que o **usuário logado pode validar** (mesma legião do executor, patente 1–2 acima, janela
    aberta, ainda não aprovadas por ele), ordenadas por "expira primeiro". Computado sob demanda
    (sem fan-out/migração) — fonte de verdade para o badge de notificação. Cada item traz o
    `executor` = `{ id, name, image, rank: { id, name, image }, active_avatar, legion_id }`,
    além de `acceptance_criteria` e `submission` (evidência: kind/content/image_url). Evoluções
    (validação por IA, notificações, push FCM) em `docs/Melhorias.txt`.
- **Limite por usuário**: **10 missões diárias** (tipo `daily`) e **2 semanais**
  (tipo `monthly` = bucket "weekly", semana ISO, segunda-feira).
  Conta apenas **COMPLETED** dentro da janela (`DAILY_MISSION_LIMIT`, `WEEKLY_MISSION_LIMIT`).
  - **Fuso de reset = America/Sao_Paulo** (NÃO UTC): a janela diária reseta à meia-noite SP
    e a semanal na segunda-feira 00:00 SP. O banco grava em UTC, então o cálculo converte o
    início da janela SP → UTC antes de consultar. Helper compartilhado `_sp_day_start_utc()`
    em `routers/missions.py` (usado também pelos rewarded videos).
- **Vídeos premiados (Rewarded Videos)** — bônus de slots diários:
  - Constantes: `REWARDED_VIDEO_BONUS = 2` (slots extras por vídeo), `REWARDED_VIDEO_LIMIT = 3`
    (máx. de vídeos por dia). Cada vídeo concluído soma `bonus_missions` ao limite diário.
  - `POST /missions/rewarded-video` — registro **dev/teste** (sem assinatura); 409 ao exceder o limite.
  - `GET /missions/rewarded-video/callback` — **SSV do Google AdMob**. Verifica assinatura
    **ECDSA-SHA256** sobre a query string (até `&signature=`) com as chaves públicas de
    `gstatic.com/admob/reward/verifier-keys.json` (cache de 1h). `custom_data` = UUID do usuário
    (setado no client via `ServerSideVerificationOptions`). **Idempotente** por `transaction_id`
    único (anti-replay). Sem `custom_data` → responde `"SSV endpoint verified."` (teste de URL do AdMob).
    Sempre retorna 200 (AdMob não re-tenta). Registra em `user_rewarded_videos`.
- **Listagens** (logado, `Authorization: Bearer`):
  - `GET /missions` — paginado, filtros `status`, `difficulty`, `type`, `trackId`, `specialtyId`.
  - `GET /missions/available` — só **não iniciadas/concluídas** (sem repetição), paginado,
    filtros `specialtyId`/`difficulty`. **Capa o resultado pelo saldo restante** de cada bucket
    (ex.: 2 diárias já feitas → retorna no máx. 8 diárias).
  - Ambas retornam **`availableMissions: { date, daily, weekly, daily_reset_at, weekly_reset_at,
    rewarded_video_available }`** = saldo restante e timestamps de reset (em fuso SP).
- **Paginação padrão**: `{ page, perPage, totalItems, availableMissions, items }`.

---

## 8. Maestria e Medalhas

- Cada missão concede **pontos de maestria** na especialidade da missão.
- Ao atingir **100 pontos** de maestria numa especialidade, desbloqueia a **medalha**
  correspondente (1 por especialidade): Imperial Architect (Engineering),
  Master Strategist (Strategy), Imperial Merchant (Commerce), Diplomat of Rome
  (Diplomacy), Conqueror of Gaul (Exploration).

---

## 9. Conquistas (Achievements)

- **100 por especialidade** (500 no total), com **`specialty_id`** FK.
- Cada uma tem `icon_url` (SVG em S3, leitura pública).
- Desbloqueio registrado em `user_achievements` (com `achieved_at`).

---

## 10. Campanhas

- Cadeias de missões com recompensa de XP + medalha.
- `POST /users/{id}/campaigns/{campaign_id}` valida pré-requisitos antes de concluir.
- `GET /campaigns` lista o catálogo.

---

## 11. Autenticação (JWT) e OAuth2

- **Access token** (`JWT_ACCESS_EXPIRE_MINUTES`, padrão 30 min) e
  **refresh token** (`JWT_REFRESH_EXPIRE_DAYS`, padrão 7 dias). Claims: `sub`, `email`, `is_admin`, `type`.
- **`POST /auth/refresh`**: troca um refresh token por **novo par** access + refresh
  (rotação). Valida `type == "refresh"`; erros retornam 401 com motivo
  (expirado / inválido / não é refresh).
- **Header de autorização tolerante**: aceita `Bearer <token>`, `bearer <token>` ou o
  **token cru**. Erros retornam 401 específicos: header ausente, token expirado,
  token inválido, `undefined`/`null`.
- **OAuth2** Google e GitHub via authorization code flow (httpx); requer `USE_DATABASE=true`.

---

## 12. E-mail (Mailtrap)

- Envio via API do Mailtrap (`MAILTRAP_TOKEN`). Com `MAILTRAP_INBOX_ID` usa sandbox; senão produção.
- Sem `MAILTRAP_TOKEN`, o envio é **pulado silenciosamente** (apenas log) — não quebra o fluxo.
- Template `specialty_validation.html`: tema claro alinhado à tela de login do app
  (branco, texto `#111`, acento `#8B1A2B`), logo inline, mostra **apenas o token**
  (e o bloco de senha temporária **somente** quando houver senha temporária).

---

## 13. Estatísticas

- `GET /users/{id}/stats` agrega quantitativos com filtros:
  - **`period`**: `weekly` (7d), `monthly` (30d), `annual` (365d) — janela rolante.
  - **`startDate`/`endDate`**: intervalo customizado (sobrepõe `period`).
  - Sem filtros → all-time.
- Métricas: `total_xp`, `current_rank`, `medals_count`, `missions_in_progress`,
  `missions_completed_total`, e por janela: `xp_in_period`, `missions_completed`,
  `campaigns_completed`, `achievements_unlocked`, `ranks_gained`, `active_days`,
  `xp_by_source`. Cada métrica filtra pela sua coluna de data correta.

---

## 14. Legiões e Províncias

- **Legiões são unidades mistas/abertas**: qualquer especialidade pode entrar em qualquer legião.
  O `legions.specialty_id` é apenas o **tema fundador** (NÃO restringe ingresso); NULL na admin.
- 5 legiões temáticas + **Legio X Equestris** (ingresso **reservado a administradores**;
  bloqueado para usuários comuns no caso de uso `ChooseLegion`).
- **Escolha de legião é pós-progressão, não no quiz inicial**: na **primeira missão concluída**
  (`POST /missions/{slug}/complete`), se o usuário não tem legião, a resposta traz
  `requires_legion_selection: true` + `recommended_legions`:
  - legião do **tema** = `specialty_id` da missão;
  - legião **correlata** = via `CORRELATED_SPECIALTY` (domain service).
- **Ingresso (`POST /users/{id}/legion`)**: caso de uso `user/choose_legion/`. Calcula o
  **balanceamento** da legião (distribuição de especialidades dos membros ativos) e retorna
  `balance_status` (`shortage` | `balanced` | `excess`) — advisory, **não bloqueia**.
  Não altera XP/patente (progressão consistente).
- **Domínio territorial**: a **legião dominante** de uma província é a com mais **membros ativos**
  (`UserRepository.dominant_legion_for_province`, via `func.count`). Exposto como
  `province.dominant_legion` (objeto) no login/detalhe.
- `users.legion_id` e `users.province_id`. Província pertence a um **country**.
- **Províncias (`GET /provinces`, `GET /provinces/{id}`)**: leitura direta (router sem repo).
  - Lista paginada com filtro `countryId` e busca `name` **inteligente** (ignora acento e
    caixa, com fallback fuzzy via `difflib` ≥ 0.6 — "sao paulo" acha "São Paulo", tolera typo).
  - Detalhe traz `country`, `total_users` e `legions[]` com `quantityUsers` = membros ativos
    daquela legião **nesta província** (apenas legiões com membros aqui).
- Login e detalhe retornam os **objetos completos** de `legion`, `province`
  (com `country` e `dominant_legion` aninhados), além dos ids.
- Regras puras (correlatas, status de balanceamento) ficam em `src/domain/services/legions.py`
  (domínio não conhece infraestrutura).
- **Detalhe da legião (`GET /legions/{id}`)** retorna, além dos dados base:
  - `total_users`: total de **membros ativos** da legião;
  - `countries[]`: todos os países que possuem províncias, cada um com `icon_url` e
    `provinces[]`, onde cada província traz `quantityUsers` = **total de usuários ativos
    (de qualquer legião)** naquela província. Vazio em modo in-memory.

---

## 15. Assets em S3 (bucket `viaimperii`, us-east-1)

- **Imagens de patente**: `ranks/<tier>/<n>.png` (legionários e patrícios). Emperor reusa `senator/4.png`.
- **Imagens de legião**: `legions/<slug>.png` (slug = `name.lower().replace(' ', '_')`); coluna `legions.image_url`.
- **Ícones de conquista**: `achievements/<slug>.svg` (gerados por template).
- Todos enviados com **ACL `public-read`** e `Content-Type` adequado.
- `icon_url`/`image_url` apontam para `https://viaimperii.s3.us-east-1.amazonaws.com/...`.
- Prompts de geração por IA documentados em `docs/` (patrícios e legiões).
- **Ícones de países** (bucket **`uhunter`**, não `viaimperii`): `countries/<id>/<slug>.svg`
  (id arbitrário; slug = nome em minúsculas com hífens). Coluna `countries.icon_url`,
  populada por `scripts.set_country_icons` (lista o S3, casa pelo slug do nome; aliases
  cobrem Cabo Verde→cape-verde, Congo→republic-of-the-congo, Congo RD→dr-congo,
  Czech Republic→czechia). URL pública `https://uhunter.s3.us-east-1.amazonaws.com/...`.

---

## 16. Respostas de Login e Detalhe do Usuário

Ambos retornam (em DB mode):

- `current_rank` (patente atual com imagem) e — no detalhe — o **ladder completo** `ranks`.
  - O `current_rank` é **enriquecido com a progressão de XP** (via `rank_progress(track, total_xp)`):
    `total_xp`, `current_rank_xp` (XP acumulado da patente atual), `xp_in_current_rank`,
    `current_rank_span`, `next_rank_name`, `next_rank_xp`, `xp_to_next_rank` e `progress_pct`
    (0–100). Usuário no topo (Emperor) ou **bloqueado sem trilha** (Recruit IV com XP
    suficiente) vem com `next_rank_*` nulos, `span = 0` e `progress_pct` 100/0.
- `track` (objeto), `must_choose_track` (boolean) no nível superior.
- `legion` (objeto, com `image_url` e `specialty_id` do tema).
- `province` (com `country` aninhado **e `dominant_legion`** — a legião que domina a província).
- `achievements` desbloqueadas (com `icon_url`, `achieved_at`).
- `medals` (lista de nomes — **não** foi convertida em objetos; ver histórico).
- **Login NÃO retorna** `completed_missions` nem `completed_campaigns` (removidos);
  permanecem no detalhe (aninhados em `user`).

---

## 17. Assets Cosméticos

- Tabela **`assets`** (`AssetModel`): cosméticos que o usuário pode possuir —
  `{ id, name, slug (único), url, type (avatar | frame | badge | …), rarity, is_free, price }`
  (price = "valor"; 0 quando gratuito). **`rarity`** = `legacy | epic | mythical | legendary`
  (migration 0031; registros antigos = `legacy`). Soft delete padrão.
- **Buckets de avatar**: legacy do `uhunter/avatars/<categoria>` (seed `assets.py`); premium
  (epic/mythical) do `viaimperii/assets/avatars/<raridade>` (seed `assets_avatars_premium.py`,
  upload via `aws s3 cp ... --acl public-read`).
- **N:N `user_assets`** (`UserAssetModel`): assets que o usuário possui — `(user_id, asset_id)`
  único, com `acquired_at`. Relacionamento `users.assets_owned`.
- **`users.profile_image_url`**: imagem **enviada pelo próprio usuário** como foto de perfil
  (distinta do `avatar_url` de OAuth e dos assets de avatar adquiridos).
- **`user_assets.is_active`** (migration 0030): avatar **ativo/equipado** do usuário. Todo
  usuário novo recebe um **avatar free ativo** ao ser criado (`PostgresUserRepository.save`);
  o seed `assets.py` faz o backfill dos usuários existentes (free avatar por `user.id % nFree`).
- **Avatar ativo no retorno**: login/detalhe expõem `active_avatar` (objeto `AssetSchema`);
  o `executor` do `GET /missions/to-review` traz `active_avatar` + `image` (foto enviada).
- Migrations **0029** (tabelas + `profile_image_url`) e **0030** (`is_active`).

---

## Variáveis de Ambiente Relevantes

| Var | Função |
|-----|--------|
| `USE_DATABASE` / `APP_ENV` | Liga Postgres (`true`/`production`) vs in-memory |
| `INVITE_CODE` | Código que inicia o usuário em Recruit III (vazio desabilita) |
| `JWT_SECRET` | Segredo de assinatura JWT (trocar em produção) |
| `JWT_ACCESS_EXPIRE_MINUTES` / `JWT_REFRESH_EXPIRE_DAYS` | Expiração dos tokens (30 / 7) |
| `MAILTRAP_TOKEN` / `MAILTRAP_INBOX_ID` | Envio de e-mail (sandbox vs produção) |
| OAuth (`GOOGLE_*`, `GITHUB_*`, `OAUTH_REDIRECT_BASE_URL`) | Login social |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Seed do admin inicial (`seeds.admin_user`); pula se o e-mail já existe |
| `DATABASE_URL` | URL completa do Postgres (Railway); convertida para `postgresql+psycopg2://` na conexão |
| `PORT` | Porta do servidor (injetada pelo Railway; default 8000) |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` | Credenciais AWS p/ presigned PUT de evidências (`/uploads/presign`). Sem elas, o presign retorna 503 |
| `S3_BUCKET` | Bucket de upload de evidências (default `viaimperii`) |

> `.env` não é versionado.

> **Rewarded videos** usam as chaves públicas do Google AdMob (sem segredo local) —
> não há variável de assinatura. Requer o pacote `cryptography` (em `requirements.txt`).

---

## Ao Fazer Alterações

- Patente vem do XP — não duplique a lógica; use `rank_name_for(track, total_xp)`.
- Datas de atividade: missões usam `completed_at`, conquistas `achieved_at`, XP `user_xp_log.created_at`.
- Novos endpoints/migrações: atualizar a tabela do `README.md` e a coleção Postman (`docs/postman_collection.json`).
- Manter seeds idempotentes e a ordem de execução documentada no README.
