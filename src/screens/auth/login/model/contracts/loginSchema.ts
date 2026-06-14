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

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email obrigatório.')
    .email('Email inválido.'),
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;
