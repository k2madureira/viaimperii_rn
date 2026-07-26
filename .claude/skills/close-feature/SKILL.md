---
name: close-feature
description: Fecha uma feature branch seguindo o fluxo de git obrigatório deste projeto (CLAUDE.md § Fluxo de Git): valida a branch e o typecheck, commita pendências, abre PR para `develop` (nunca para `main`) e, só com confirmação explícita do usuário, faz o merge, limpa as branches e avisa quando for hora de cortar release. Use sempre que o usuário pedir para "fechar a feature", "finalizar/concluir a branch", "abrir PR dessa feature", "integrar em develop", "fazer o merge da feature" ou qualquer variação de terminar o trabalho numa branch `feature/*` deste repositório.
---

# Fechar feature

Fluxo de git deste projeto (CLAUDE.md § "Fluxo de Git"): toda feature nasce de
`develop`, fecha via PR para `develop` (nunca direto pra `main`), e a cada 3
features integradas corta-se uma release. Este skill automatiza esse
fechamento de ponta a ponta, mas **para para confirmação nos passos que
afetam histórico compartilhado** (merge e release) — commit/push/PR não
precisam de confirmação porque são reversíveis e já são o que o usuário pediu
ao pedir para "fechar a feature".

## 1. Checagem inicial

- `git branch --show-current` — se não começar com `feature/`, pare e avise:
  este skill só fecha feature branches, não `develop`/`main`/outras.
- `git status --short` e `git diff` (ou `git diff --stat` se o diff for
  grande) — mostre ao usuário o que vai ser commitado antes de seguir. Se
  houver arquivos que parecem não relacionados à feature (config, temporários,
  `.env`), aponte antes de continuar em vez de incluir cegamente.

## 2. Typecheck

Rode `node_modules/.bin/tsc --noEmit -p tsconfig.json`. Se falhar, **pare
aqui** e mostre os erros — não commite/dê push em código que não compila.
Corrigir os erros é decisão de quem pediu o fechamento; só corrija você mesmo
se o usuário pedir isso explicitamente.

## 3. Fechar a task no backlog do PO

**Antes de commitar**, feche a spec da feature em `docs/backlog/` — este passo
já foi esquecido três vezes (F1, F8 e F6 ficaram em `tasks/` mesmo depois de
mergeadas), e o backlog é o que o front lê para saber o que implementar: uma
task fantasma em `tasks/` faz alguém reimplementar o que já shipou.

Descubra qual task o trabalho fecha (`ls docs/backlog/tasks/` e case com o
escopo da branch/commits). Se a feature **não** corresponde a nenhuma spec
(hotfix, refactor, tooling), pule este passo — mas diga ao usuário que pulou
e por quê.

Quando houver task correspondente:

1. `git mv docs/backlog/tasks/<slug>.md docs/backlog/completed/<slug>.md` —
   `git mv` preserva o histórico.
2. No header da spec, troque `- **Status:** Ready for build` por
   `- **Status:** ✅ Shipado no front (PR #N, merge \`<sha>\`)` + a data. O nº
   do PR só existe depois do passo 6 — tudo bem preencher com o que já se
   sabe e completar depois, ou deixar para o commit final.
3. Em `docs/backlog/backlog.md`:
   - tire a linha da task da tabela **🔜 tasks/** e acrescente na tabela
     **✅ completed/**, com os caminhos de código e o PR;
   - adicione a feature na seção **✅ Feitas — do NOT re-propose**;
   - atualize o **build order**, o `_Last updated:_` e as notas/contagens que
     citam a task (ex.: "backend à frente do front em N features");
   - se a implementação **divergiu da spec**, registre a divergência e o
     motivo na coluna de notas — é o que impede a próxima pessoa de "corrigir"
     de volta para algo que não funciona.

Essas mudanças de docs entram **no mesmo commit/PR da feature** (passo 4) —
não vire um PR separado de docs. Se a feature já foi mergeada sem esse
fechamento, corrija numa branch `chore/` própria em vez de deixar passar.

**Atualize também o índice de telas** se a feature criou/moveu tela, section,
query/mutation, hook ou domínio de API: `docs/architecture/screen-index.md` é o
lookup que o `ft` usa para localizar código sem fan-out — uma linha desatualizada
manda o front para o arquivo errado. Entra no mesmo commit da feature.

## 4. Commit (se houver pendências)

Se o passo 1 (ou o passo 3) deixou mudanças não commitadas:

- `git add` só os arquivos relevantes à feature (nunca `-A` às cegas se
  houver arquivo suspeito — confira a lista do passo 1 primeiro).
- Commit com mensagem em **inglês, imperativo**, formato `tipo(escopo):
  descrição` (ex.: `feat(notifications): add ...`). Rode `git log --oneline
  -10` se quiser conferir o padrão usado nos commits recentes.
- Não use `--no-verify`. Se um hook falhar, resolva a causa e crie um **novo**
  commit — nunca `--amend` depois de um hook falho (o commit anterior não
  chegou a acontecer).

Sem mudanças pendentes, pule este passo.

## 5. Push

`git push -u origin <branch>` (a branch atual). Sem `--force`.

## 6. Abrir PR para `develop`

`gh pr create --base develop --head <branch> --title "<título>" --body
"..."`.

- **Título em inglês**, curto, no padrão dos commits (`feat(scope): ...`).
- **Corpo pode ser em PT-BR** (CLAUDE.md permite) — em bullets, não parágrafo
  corrido. Inclua:
  - Resumo do que a feature faz (2–5 bullets)
  - Arquivos/áreas principais tocadas
  - Test plan: o que foi validado e o que ficou pendente (ex.: "sem preview
    mobile disponível neste projeto")
- **Nunca aponte pra `main`** — só `develop`.

Depois de criar, mostre o link do PR ao usuário.

## 7. Perguntar sobre o merge — sempre, mesmo que já tenha perguntado antes

Merge em `develop` altera histórico compartilhado, então **pare e pergunte**
antes de mergear — mesmo que numa conversa anterior o usuário já tenha pedido
pra mergear sem revisão. Cada invocação deste skill é independente; a
autorização de uma vez não vale para a próxima. Algo como: "PR aberto. Quer
que eu já faça o merge, ou prefere aguardar revisão/aprovação primeiro?"

- Usuário disse pra aguardar → pare aqui. O fechamento via PR está feito; o
  merge fica pendente para depois.
- Usuário confirmou o merge agora → siga para o passo 8.

## 8. Merge e limpeza (só depois de confirmação)

1. `gh pr merge <numero> --merge --delete-branch` — **merge commit normal**
   (não squash, não rebase — é o padrão que este repo já usa; `git log
   --oneline -5 origin/develop` confirma se tiver dúvida). Isso já apaga a
   branch remota.
2. `git checkout develop`
3. `git branch -d <branch-da-feature>` (branch local já mergeada — `-d`
   normal basta, sem precisar de `-D`)
4. `git remote prune origin` — limpa refs remotas obsoletas (não só da que
   você acabou de apagar; aproveita e limpa outras já removidas no GitHub
   também, é seguro)
5. `git pull origin develop`

## 9. Checar se é hora de cortar release

CLAUDE.md: a cada 3 features integradas em `develop`, corta-se uma release
(merge `develop` → `main`, tag semver, GitHub Release — minor para features,
patch para hotfix).

Depois do merge do passo 8, conte quantos merges entraram em `develop` desde
a última tag:

```
LAST_TAG=$(git describe --tags --abbrev=0 origin/main)
git log $LAST_TAG..origin/develop --merges --oneline
```

Conte as linhas do resultado e informe o número ao usuário — **não corte a
release sozinho**, só avise e pergunte se ele quer prosseguir agora. Exemplo:
"N features integradas em develop desde a última tag (vX.Y.Z) — pelo fluxo do
projeto, já é hora de cortar release. Quer que eu faça isso agora (merge
develop→main, tag, GitHub Release)?"

Se confirmado, o corte de release é um fluxo à parte (não coberto por este
skill) — siga o mesmo princípio de perguntar antes de qualquer ação que
afete `main`/tags/releases.

## Checklist rápido

- [ ] Branch atual é `feature/*`?
- [ ] `git status`/`git diff` mostrados ao usuário antes de commitar?
- [ ] Typecheck passou?
- [ ] Task do backlog movida de `tasks/` para `completed/`, com
      `backlog.md` atualizado (ou justifiquei ao usuário por que não havia
      task a fechar)?
- [ ] `screen-index.md` atualizado se a estrutura de telas/API mudou?
- [ ] Commit em inglês/imperativo, só se havia pendência?
- [ ] Push feito sem `--force`?
- [ ] PR aberto pra `develop` (nunca `main`), corpo em bullets com test plan?
- [ ] Perguntei antes de mergear — mesmo que já tenha perguntado numa
      conversa anterior?
- [ ] Se mergeou: merge commit (não squash/rebase), branch remota e local
      apagadas, `develop` local atualizada com `git pull`?
- [ ] Contei os merges desde a última tag e avisei sobre release sem cortar
      sozinho?
