/**
 * Email Service
 * 
 * @deprecated Use `getEmailService()` from '@/integrations/email' instead.
 * This file is kept for backwards compatibility.
 */

export {
  EmailService,
  getEmailService,
  emailService,
} from '../integrations/email/index.js';

export type {
  SendEmailOptions as EmailOptions,
  SendEmailResult,
  OrderConfirmationData,
  OrderShippedData,
  PasswordResetData,
  WelcomeData,
  LowStockAlertData,
} from '../integrations/email/index.js';
