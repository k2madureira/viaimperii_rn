import { z } from 'zod';
import i18n from '../../../../i18n';

const SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

const newPasswordSchema = z
  .string()
  .min(7, i18n.t('validation.passwordMin'))
  .refine(v => /[A-Z]/.test(v), i18n.t('validation.passwordUppercase'))
  .refine(
    v => [...v].some(c => SPECIAL_CHARS.includes(c)),
    i18n.t('validation.passwordSpecial'),
  );

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, i18n.t('validation.currentPasswordRequired')),
    new_password: newPasswordSchema,
    confirm_password: z.string().min(1, i18n.t('validation.confirmNewPasswordRequired')),
  })
  .refine(v => v.new_password === v.confirm_password, {
    message: i18n.t('validation.passwordsDontMatch'),
    path: ['confirm_password'],
  });

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
