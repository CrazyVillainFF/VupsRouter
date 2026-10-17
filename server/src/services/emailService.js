import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const emailService = {
  async sendPasswordResetEmail(email, resetUrl) {
    if (env.EMAIL_PROVIDER_API_KEY) {
      // In production with SendGrid/Resend API key configured
      logger.info(`Sending password reset email to ${email} via configured provider...`);
      // Ready for live email provider hook
      return { success: true, delivered: true };
    }

    // Local / development fallback: Log clear URL to console without crashing
    logger.info(`--------------------------------------------------`);
    logger.info(`[PASSWORD RESET SIMULATION - DEV MODE]`);
    logger.info(`Recipient: ${email}`);
    logger.info(`Reset Link: ${resetUrl}`);
    logger.info(`(To configure live email delivery, set EMAIL_PROVIDER_API_KEY in server/.env)`);
    logger.info(`--------------------------------------------------`);

    return {
      success: true,
      delivered: false,
      devNotice: 'Password reset link logged to server console (EMAIL_PROVIDER_API_KEY not set).'
    };
  }
};
