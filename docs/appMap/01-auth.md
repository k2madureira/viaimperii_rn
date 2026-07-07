# 01 — Fluxo de Autenticação

Telas públicas (AuthStack) + Splash. Fonte: `src/screens/auth/*`,
`src/screens/defaults/*`.

---

## Splash (`screens/defaults/splash`)

- Não é rota — controlada por `App.tsx`.
- Anima o logo por ~2s e chama `onFinish()` → monta o `NavigationContainer`.
- Sem interações.

---

## Login (`screens/auth/login`)

Form: `login/components/form/Form.tsx` · Social: `SocialLogin.tsx`.

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Campo e-mail / senha | digitar | — | Validação via `loginSchema` (zod) no submit |
| Olho (senha) | toque | — | Alterna visibilidade da senha |
| **Entrar** | submit | — (troca de árvore) | `useLoginMutation`. Sucesso → grava token → RootNavigator troca para `BottomTabs`. **Cadastro incompleto (403)** → `Navigate → Signup { step: 3, email }` |
| "Esqueci minha senha" | toque | `Navigate → ForgotPassword` | — |
| "Cadastre-se" | toque | `Navigate → Signup` | Passo 1 |
| **Google** | toque | OAuth (web browser) | `useGoogleAuth().promptAsync()` → login social |
| **GitHub** | toque | OAuth (web browser) | `useGithubAuth().promptAsync()` → login social |

---

## Signup (`screens/auth/signup`)

Wizard de 3 passos controlado por estado local (`step`), com indicador de
progresso. Params de entrada podem pular direto ao passo 3.

### Passo 1 — dados (`steps/Step1Form.tsx`)

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Nome / e-mail | digitar | — | Validação `signupSimpleSchema` |
| **Continuar** | submit | Passo 2 (interno) | `useSignupMutation`. Sucesso → guarda e-mail, avança ao passo 2 |
| "Já possui o código?" | toque | Passo 3 (interno) | Salta ao passo do token com o e-mail atual |
| "Entrar" | toque | `Navigate → Login` | — |

### Passo 2 — aviso de e-mail (`steps/Step2Info.tsx`)

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| **Continuar** | toque | Passo 3 (interno) | Avança para inserir o token |
| "Reenviar código" | toque | — | `useResendTestCodeMutation` reenvia o e-mail |

### Passo 3 — token (`steps/Step3Token.tsx`)

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Campo e-mail | digitar | — | Visível só quando veio pelo atalho "Já possui o código?" |
| Campo token (7) | digitar | — | Uppercase automático; habilita o botão ao completar |
| **Verificar código** | submit | `Navigate → SpecialtyQuiz { testCode, userId }` | `useVerifyTokenMutation` → pré-carrega o quiz e navega |
| "Reenviar código" | toque | — | Reenvia o e-mail |
| "Voltar" | toque | Passo 2 (interno) | — |

---

## Esqueci a senha (`screens/auth/forgotPassword`)

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Campo e-mail | digitar | — | Validação `forgotPasswordSchema` |
| **Enviar** | submit | — | `useForgotPasswordMutation` dispara o e-mail de recuperação (toast) |
| "Voltar para o login" | toque | `Navigate → Login` | — |

---

## Quiz de Especialidade (`screens/defaults/specialtyQuiz`)

Recebe `{ testCode, userId }`. Máquina de estados: `loading → questions →
submitting → result`.

| Elemento | Ação | Destino | Resultado |
|----------|------|---------|-----------|
| Opção de resposta | toque | — | Seleciona a opção (destaque vermelho) |
| **Próxima** | toque | Próxima pergunta | Guarda a resposta; avança o índice |
| **Finalizar** (última) | toque | Estado `submitting` | `submitQuizAnswers` → grava especialidade (`updateUserSpecialty`) → tela de resultado |
| **Fazer login** (resultado) | toque | `Navigate → Login` | — |
| **Ir para o login** (erro) | toque | `Navigate → Login` | Exibido quando o quiz falha ao carregar |

> Ao terminar, o usuário volta ao Login para entrar já com a especialidade
> definida.
