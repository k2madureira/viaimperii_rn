import { z } from 'zod';

const SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

const passwordSchema = z
  .string()
  .min(7, 'Senha deve ter no mínimo 7 caracteres.')
  .refine(v => /[A-Z]/.test(v), 'Senha deve conter ao menos uma letra maiúscula.')
  .refine(
    v => [...v].some(c => SPECIAL_CHARS.includes(c)),
    'Senha deve conter ao menos um caractere especial (!@#$%^&*...).',
  );

export const signupSimpleSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres.'),
  email: z.string().min(1, 'Email obrigatório.').email('Email inválido.'),
  invite_code: z.string().optional(),
});

export const signupWithPasswordSchema = signupSimpleSchema
  .extend({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirmação de senha obrigatória.'),
  })
  .refine(v => v.password === v.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

export type SignupSimpleData = z.infer<typeof signupSimpleSchema>;
export type SignupWithPasswordData = z.infer<typeof signupWithPasswordSchema>;
