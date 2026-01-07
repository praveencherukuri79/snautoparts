/**
 * Resend Email Client
 * 
 * Low-level client for Resend API interactions.
 * This client handles the HTTP communication with Resend.
 */

import { logger } from '../../config/logger.js';
import type { SendEmailOptions, SendEmailResult, EmailClientConfig } from './email.types.js';

const RESEND_API_URL = 'https://api.resend.com/emails';

export class ResendClient {
  private readonly apiKey: string;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(config: EmailClientConfig) {
    this.apiKey = config.apiKey;
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName || 'SN Auto Parts';
  }

  /**
   * Check if client is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && !!this.fromEmail;
  }

  /**
   * Send an email via Resend API
   */
  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      logger.warn(
        { to: options.to, subject: options.subject },
        'Resend not configured - email not sent',
      );
      return { id: `mock_${Date.now()}`, success: false };
    }

    const recipients = this.normalizeRecipients(options.to);

    try {
      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${this.fromName} <${this.fromEmail}>`,
          to: recipients,
          subject: options.subject,
          html: options.html,
          text: options.text,
          reply_to: options.replyTo,
          attachments: options.attachments?.map((a) => ({
            filename: a.filename,
            content: typeof a.content === 'string' 
              ? a.content 
              : a.content.toString('base64'),
            content_type: a.contentType,
          })),
          tags: options.tags,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resend API error (${response.status}): ${errorText}`);
      }

      const result = await response.json() as { id: string };
      
      logger.info(
        { emailId: result.id, to: recipients, subject: options.subject },
        'Email sent successfully',
      );

      return { id: result.id, success: true };
    } catch (error) {
      logger.error(
        { error, to: recipients, subject: options.subject },
        'Failed to send email',
      );
      throw error;
    }
  }

  /**
   * Normalize recipients to string array
   */
  private normalizeRecipients(
    to: SendEmailOptions['to'],
  ): string[] {
    if (typeof to === 'string') {
      return [to];
    }
    if (Array.isArray(to)) {
      return to.map((r) => (typeof r === 'string' ? r : r.email));
    }
    return [to.email];
  }
}

