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

## 3. Commit (se houver pendências)

Se o passo 1 mostrou mudanças não commitadas:

- `git add` só os arquivos relevantes à feature (nunca `-A` às cegas se
  houver arquivo suspeito — confira a lista do passo 1 primeiro).
- Commit com mensagem em **inglês, imperativo**, formato `tipo(escopo):
  descrição` (ex.: `feat(notifications): add ...`). Rode `git log --oneline
  -10` se quiser conferir o padrão usado nos commits recentes.
- Não use `--no-verify`. Se um hook falhar, resolva a causa e crie um **novo**
  commit — nunca `--amend` depois de um hook falho (o commit anterior não
  chegou a acontecer).

Sem mudanças pendentes, pule este passo.

## 4. Push

`git push -u origin <branch>` (a branch atual). Sem `--force`.

## 5. Abrir PR para `develop`

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

## 6. Perguntar sobre o merge — sempre, mesmo que já tenha perguntado antes

Merge em `develop` altera histórico compartilhado, então **pare e pergunte**
antes de mergear — mesmo que numa conversa anterior o usuário já tenha pedido
pra mergear sem revisão. Cada invocação deste skill é independente; a
autorização de uma vez não vale para a próxima. Algo como: "PR aberto. Quer
que eu já faça o merge, ou prefere aguardar revisão/aprovação primeiro?"

- Usuário disse pra aguardar → pare aqui. O fechamento via PR está feito; o
  merge fica pendente para depois.
- Usuário confirmou o merge agora → siga para o passo 7.

## 7. Merge e limpeza (só depois de confirmação)

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

## 8. Checar se é hora de cortar release

CLAUDE.md: a cada 3 features integradas em `develop`, corta-se uma release
(merge `develop` → `main`, tag semver, GitHub Release — minor para features,
patch para hotfix).

Depois do merge do passo 7, conte quantos merges entraram em `develop` desde
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
- [ ] Commit em inglês/imperativo, só se havia pendência?
- [ ] Push feito sem `--force`?
- [ ] PR aberto pra `develop` (nunca `main`), corpo em bullets com test plan?
- [ ] Perguntei antes de mergear — mesmo que já tenha perguntado numa
      conversa anterior?
- [ ] Se mergeou: merge commit (não squash/rebase), branch remota e local
      apagadas, `develop` local atualizada com `git pull`?
- [ ] Contei os merges desde a última tag e avisei sobre release sem cortar
      sozinho?
