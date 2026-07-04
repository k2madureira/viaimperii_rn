import { z } from 'zod';
import i18n from '../../../../../i18n';

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, i18n.t('validation.emailRequired')).email(i18n.t('validation.emailInvalid')),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
