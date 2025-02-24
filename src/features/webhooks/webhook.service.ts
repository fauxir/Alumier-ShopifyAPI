import crypto from 'crypto';

export class WebhookService {
  static verifyHmac(hmac: string, body: string): boolean {
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || '';
    const calculatedHmac = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf-8')
      .digest('base64');

    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(calculatedHmac)
    );
  }
}
