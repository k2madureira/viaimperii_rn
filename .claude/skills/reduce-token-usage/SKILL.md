---
name: reduce-token-usage
description: Passo a passo para reduzir o consumo de tokens ao trabalhar neste repositório (Expo/React Native). Use antes de explorar o código, ler arquivos grandes, ou quando o contexto estiver crescendo demais.
---

# Redução de uso de tokens

Objetivo: gastar o mínimo de tokens para entregar a mesma tarefa. Siga as etapas na ordem.

## 1. Antes de ler — localize com ferramentas baratas
- Use `Glob` para achar arquivos por padrão (ex.: `src/**/*Screen.tsx`) em vez de listar pastas.
- Use `Grep` (`output_mode: "files_with_matches"` ou `"count"`) para encontrar onde algo está, antes de abrir o arquivo.
- Nunca rode `find`/`grep`/`cat` via shell para isso — use as ferramentas dedicadas (resultados mais enxutos).

## 2. Leia só o necessário
- Leia **trechos** com `offset`/`limit`, não o arquivo inteiro, quando já souber a região (use o número de linha do Grep).
- Não releia um arquivo que você acabou de editar — o harness já confirma a edição.
- Evite abrir arquivos ignoráveis (ver `.claudeignore`): lockfiles, `node_modules`, `assets`, `.expo`, builds.

## 3. Explore com subagente quando a busca for ampla
- Para "onde está X / quais arquivos usam Y" em várias pastas, lance o agente **Explore** ("quick"/"medium"), que devolve só o resumo — não o conteúdo bruto.
- Não use subagente para tarefas pequenas que você resolve com 1–2 Grep.

## 4. Edite com cirurgia
- Prefira `Edit` com `old_string` mínimo e único, em vez de reescrever o arquivo com `Write`.
- Faça edições independentes em paralelo (várias chamadas numa só resposta).
- Só use `Write` para arquivo novo ou substituição total real.

## 5. Verifique de forma barata
- Rode `npx tsc --noEmit` filtrando a saída (ex.: `| grep -iE "error" | head`) em vez de despejar tudo.
- Não rode o bundler/Expo só para "ver se compila" — o type-check basta na maioria dos casos.
- Reaproveite resultados já obtidos no contexto; não re-derive o que já foi estabelecido.

## 6. Backend (E:\projetos\python\viaimperii)
- Confirme contratos lendo a rota/DTO específica (Grep por `@router`/`class ...Response`), não o arquivo inteiro.
- Cheque o `response_wrapper` / envelope `{ time, content }` uma vez e reutilize o conhecimento.

## 7. Respostas
- Seja direto: entregue o que mudou e por quê, sem repetir código grande já mostrado.
- Não narre opções que não vai seguir; dê a recomendação.

## Checklist rápido
- [ ] Usei Glob/Grep antes de ler?
- [ ] Li só os trechos necessários (offset/limit)?
- [ ] Editei com `old_string` mínimo?
- [ ] Filtrei a saída de comandos longos?
- [ ] Evitei reler/recompilar à toa?
