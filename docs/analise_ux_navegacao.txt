==========================================================================
 VIA IMPERII — ANÁLISE DE UX & NAVEGAÇÃO (foco em evasão / churn)
 Data: 2026-06-28
 Escopo: todas as telas criadas (auth, dashboard, missions, ranks, legions,
         achievements, profile, quiz) + navegação (tabs/stacks) e modais.
 Formato: tópicos curtos. Severidade: [BLOQUEIO] > [ALTO] > [MÉDIO] > [BAIXO].
==========================================================================

--------------------------------------------------------------------------
0. TOP PRIORIDADES (maior risco de evasão x menor esforço)
--------------------------------------------------------------------------
- [ALTO] Labels da bottom tab estão FIXAS em PT (não usam i18n) → usuário em
  EN vê "Início/Missões/Legião/Conquistas/Perfil". App parece quebrado p/ EN.
- [ALTO] Ícones de Conquistas não aparecem (SVG remoto em <Image>). Tela
  central de gamificação fica "vazia" → sensação de app sem conteúdo.
- [ALTO] Perfil de OUTRO usuário (via feed) não tem botão voltar visível
  (barra removida). Android sem gesto = usuário "preso" → fecha o app.
- [MÉDIO] Backgrounds de destaque não renderizam (classes sem prefixo `bg-`):
  ranks (banner Recruta IV) e missions (badge "diárias" ativa).
- [MÉDIO] `console.log(user)` a cada render em missions/index.tsx (debug +
  vaza dados do usuário no log). Remover.
- [MÉDIO] Sem pull-to-refresh em ranks/legions/achievements/profile → dado
  desatualizado após completar missão; usuário não consegue "forçar" update.

--------------------------------------------------------------------------
1. NAVEGAÇÃO (estrutura geral)
--------------------------------------------------------------------------
- [ALTO] BottomTabs.TAB_LABEL hardcoded em PT; deveria vir de `t(...)`.
  Quebra a internacionalização já existente (pt/en).
- [MÉDIO] "Ranks" (ladder de patentes) NÃO está nas tabs; só acessível pelo
  botão "Ver requisitos" no card de patente da Home. Descoberta baixa para
  uma feature central de progressão. Avaliar atalho no Perfil/Patente.
- [MÉDIO] Duplicidade de destino "Legion": existe como aba e como push no
  HomeStack. Risco de telas empilhadas/voltar inconsistente. Padronizar.
- [BAIXO] Telas internas alternam padrão de cabeçalho: umas usam <Navbar/>
  (dashboard, missions, legions, achievements, profile), outras um header
  próprio com seta voltar (ranks). Inconsistência visual de navegação.
- [BAIXO] Perfil é alcançado por 2 caminhos (aba = próprio; push = outro
  usuário) usando a MESMA tela; o param `userId` decide. Sem header de
  contexto, fica ambíguo "de quem é este perfil".

--------------------------------------------------------------------------
2. ONBOARDING / MODais AUTOMÁTICOS (Home)
--------------------------------------------------------------------------
- [OK] Sequência província → trilha → legião é encadeada e dismissível
  (bom: não dispara tudo de uma vez).
- [MÉDIO] Modais podem reaparecer a cada montagem da Home se o usuário
  apenas "dispensar" (dismiss é só em memória/sessão). Persistir o "depois"
  evita irritação recorrente → motivo comum de evasão precoce.
- [MÉDIO] Bloqueio em Recruta IV (precisa escolher trilha p/ avançar) só é
  comunicado por texto pequeno no card. Sem CTA forte/explicação do "porquê",
  o usuário pode achar que travou e desistir.
- [BAIXO] Legião só é sugerida após 1ª missão concluída; ok, mas garantir
  que o usuário entenda o ganho de entrar numa legião (social/validação).

--------------------------------------------------------------------------
3. AUTENTICAÇÃO (login / signup / forgot)
--------------------------------------------------------------------------
- [MÉDIO] AuthContainer: KeyboardAvoidingView com behavior=undefined no
  Android → teclado pode cobrir inputs (senha/confirmar) em telas menores.
  Usar 'height' ou ajuste de scroll no Android.
- [MÉDIO] Signup é multi-step (1 cadastro → 2 info → 3 token) mas não há
  indicador de progresso ("Passo 2 de 3"). Fluxo de e-mail+token é ponto
  clássico de abandono; mostrar progresso e reenvio de código.
- [BAIXO] Existe `signup/components/form/Form.tsx` aparentemente ÓRFÃO (a
  tela usa Step1/2/3Form). É a fonte dos erros de `tsc` e código morto.
  Remover para limpar o type-check e evitar confusão.
- [BAIXO] Erros de validação aparecem só após `isTouched`; ok. Garantir
  mensagem clara de credencial inválida vinda da API (não só erro genérico).
- [BAIXO] "Esqueci a senha": confirmar feedback de sucesso ("e-mail enviado")
  e estado de loading no submit para evitar duplo envio.

--------------------------------------------------------------------------
4. DASHBOARD / FEED (Mural)
--------------------------------------------------------------------------
- [OK] Hierarquia boa: saudação → patente+missões → campanha → legião →
  composer → mural. Pull-to-refresh presente.
- [MÉDIO] Card de patente repete dados (Home, Ranks, Perfil mostram quase o
  mesmo). Não é erro, mas dilui o senso de "novidade" ao navegar.
- [BAIXO] Estados vazios do feed: confirmar mensagem amigável quando não há
  posts (novo usuário vê mural vazio → reforçar CTA de 1º post).
- [BAIXO] Tempo relativo do post usa pt-BR fixo no fallback de data
  (`toLocaleDateString('pt-BR')`) — inconsistente com EN.

--------------------------------------------------------------------------
5. MISSÕES
--------------------------------------------------------------------------
- [OK] Filtro de dificuldade agora é chips visíveis (corrigido). Bom.
- [OK] Abas Missões/Revisão, tipos diária/semanal, cotas e timer de reset.
- [MÉDIO] Badge "diárias" ativa sem `bg-` (classe `accent-500`) → cor de
  destaque não aparece; estado ativo fica fraco visualmente.
- [MÉDIO] `console.log(user)` em todo render (remover — perf + privacidade).
- [MÉDIO] Fluxo de evidência + janela de revisão é complexo; sem um "como
  funciona" rápido, o usuário pode não entender por que a missão ficou em
  "pending_review" e abandonar. Considerar tooltip/onboarding leve.
- [BAIXO] Muitos blocos condicionais (cota esgotada, vídeo premiado, abaixo
  de Recruta IV). Validar que nunca resultam em tela "vazia" sem explicação.

--------------------------------------------------------------------------
6. RANKS (ladder de patentes)
--------------------------------------------------------------------------
- [MÉDIO] Banner de escolha de trilha (Recruta IV) usa `accent-500/10` sem
  `bg-` → fundo não renderiza; o destaque some.
- [BAIXO] XP das 3 patentes do topo é ocultado ("???"). Intencional, mas
  sem explicação pode parecer bug. Um rótulo "revelado mais tarde" ajuda.
- [BAIXO] Lista longa (36 patentes) sem busca/scroll-to-current → usuário
  precisa rolar muito até a patente atual. Auto-scroll p/ a atual ajudaria.
- [BAIXO] Header próprio com seta (≠ Navbar das outras telas) — ver item 1.

--------------------------------------------------------------------------
7. LEGIÕES
--------------------------------------------------------------------------
- [BAIXO] Metáfora "estante de livros" (lombadas + livro aberto) é bonita,
  mas lombadas de 38px com nome rotacionado têm alvo de toque pequeno e
  baixa legibilidade. Validar acessibilidade/descoberta do clique.
- [BAIXO] Nenhum indicador de "como entrar" numa legião a partir desta tela
  (entrada é via fluxo de missão). Pode gerar expectativa frustrada.
- [BAIXO] Sem pull-to-refresh; contagem de membros pode ficar desatualizada.

--------------------------------------------------------------------------
8. CONQUISTAS (Achievements)
--------------------------------------------------------------------------
- [ALTO] icon_url são SVG (achievements/<slug>.svg). <Image> NÃO renderiza
  SVG remoto → ícones em branco/ausentes. Usar SvgUri (como já feito no
  ícone de país do Perfil). Impacto alto: tela inteira de ícones vazia.
- [MÉDIO] Sem pull-to-refresh; após desbloquear conquista, a tela não
  atualiza facilmente.
- [BAIXO] 500 conquistas (100 x 5 especialidades) numa lista plana →
  considerar agrupar por especialidade / filtro, senão vira scroll infinito
  desmotivador.

--------------------------------------------------------------------------
9. PERFIL
--------------------------------------------------------------------------
- [ALTO] Perfil de outro usuário sem botão voltar visível (barra removida a
  pedido). Em Android sem gesto de borda o usuário fica preso. Sugestão:
  seta de voltar discreta DENTRO do Navbar só quando `!isOwnProfile`.
- [OK] Cards (patente/legião/origem) reaproveitam componentes da Home e o
  ícone SVG do país já usa SvgUri.
- [BAIXO] Avatar/maestria/counts dependem de 2 queries (profile + stats);
  garantir skeleton/placeholder coerente enquanto carrega (evita "pulos").
- [BAIXO] Sem pull-to-refresh na tela de Perfil.

--------------------------------------------------------------------------
10. CROSS-CUTTING (vale para todas as telas)
--------------------------------------------------------------------------
- [ALTO] i18n incompleto: tab labels e algumas datas fixas em PT.
- [ALTO] SVG remoto em <Image> não funciona (Achievements; era o caso do
  país no Perfil). Padronizar um componente RemoteIcon que escolhe
  SvgUri vs Image por extensão.
- [MÉDIO] Tailwind/nativewind: classes de cor sem prefixo (`accent-500`,
  `accent-500/10`) não aplicam fundo. Fazer varredura por `'[a-z]+-500'`
  sem `bg-/text-/border-`.
- [MÉDIO] Carregamento: spinners full-screen em quase tudo; skeletons dariam
  percepção de velocidade e reduziriam abandono em conexões lentas.
- [MÉDIO] Acessibilidade: botões só-ícone (chevron do UserMenu, ✕, filtros)
  sem accessibilityLabel/role; alvos < 44px em alguns pontos.
- [BAIXO] Tratamento de erro de rede: confirmar que toda query tem estado de
  erro com retry (missions/profile têm; ranks/legions/achievements menos).
- [BAIXO] `console.log` de debug em produção (missions) — auditar outros.

--------------------------------------------------------------------------
11. CHECKLIST DE CORREÇÕES RÁPIDAS (quick wins)
--------------------------------------------------------------------------
[ ] i18n nas labels da BottomTabs.
[ ] SvgUri nos ícones de Conquistas (e qualquer SVG remoto).
[ ] Voltar visível no Perfil de outro usuário.
[ ] Corrigir classes sem `bg-` (ranks banner, missions badge).
[ ] Remover console.log(user) de missions/index.tsx.
[ ] Pull-to-refresh em ranks/legions/achievements/profile.
[ ] Remover signup/components/form/Form.tsx órfão (zera erro do tsc).
[ ] Indicador de progresso no signup multi-step.
[ ] Persistir "dispensar" dos modais de onboarding.
[ ] Datas/locale dinâmicos (não fixar pt-BR).

==========================================================================
 Observação: análise estática (leitura de código). Recomenda-se validar no
 dispositivo (Android + iOS) os itens de teclado, gesto de voltar e render
 de SVG, pois variam por plataforma.
==========================================================================
