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

export const signupSimpleSchema = z.object({
  name: z.string().min(2, i18n.t('validation.nameMin')),
  email: z.string().min(1, i18n.t('validation.emailRequired')).email(i18n.t('validation.emailInvalid')),
  invite_code: z.string().optional(),
});

export const signupWithPasswordSchema = signupSimpleSchema
  .extend({
    password: passwordSchema,
    confirmPassword: z.string().min(1, i18n.t('validation.confirmPasswordRequired')),
  })
  .refine(v => v.password === v.confirmPassword, {
    message: i18n.t('validation.passwordsDontMatch'),
    path: ['confirmPassword'],
  });

export type SignupSimpleData = z.infer<typeof signupSimpleSchema>;
export type SignupWithPasswordData = z.infer<typeof signupWithPasswordSchema>;
