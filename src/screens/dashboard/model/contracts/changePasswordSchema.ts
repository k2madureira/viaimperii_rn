import { z } from 'zod';

const SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

const newPasswordSchema = z
  .string()
  .min(7, 'Senha deve ter no mínimo 7 caracteres.')
  .refine(v => /[A-Z]/.test(v), 'Deve conter ao menos uma letra maiúscula.')
  .refine(
    v => [...v].some(c => SPECIAL_CHARS.includes(c)),
    'Deve conter ao menos um caractere especial.',
  );

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Informe a senha atual.'),
    new_password: newPasswordSchema,
    confirm_password: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine(v => v.new_password === v.confirm_password, {
    message: 'As senhas não coincidem.',
    path: ['confirm_password'],
  });

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
