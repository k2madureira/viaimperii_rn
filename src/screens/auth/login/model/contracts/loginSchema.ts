import { z } from 'zod';
import i18n from '../../../../../i18n';

const SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

const passwordSchema = z
  .string()
  .min(7, i18n.t('validation.passwordMin'))
  .refine(v => /[A-Z]/.test(v), i18n.t('validation.passwordUppercase'))
  .refine(
    v => [...v].some(c => SPECIAL_CHARS.includes(c)),
    i18n.t('validation.passwordSpecial'),
  );

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, i18n.t('validation.emailRequired'))
    .email(i18n.t('validation.emailInvalid')),
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;
