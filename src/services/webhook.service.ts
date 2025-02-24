import crypto from 'crypto';

export class WebhookService {
  private static readonly HMAC_KEY = 'baf348fe6d2e3772848ccff1e20779a9f7685a063a8ae3c4f6727a52cf77ca04';

  static verifyHmac(hmac: string, rawBody: string): boolean {
    const calculatedHmac = crypto
      .createHmac('sha256', this.HMAC_KEY)
      .update(rawBody, 'utf-8')
      .digest('base64');

    try {
      const providedHmacBase64 = Buffer.from(hmac, 'hex').toString('base64');
      return crypto.timingSafeEqual(
        Buffer.from(calculatedHmac),
        Buffer.from(providedHmacBase64)
      );
    } catch (error) {
      console.error('Error comparing HMACs:', error);
      return false;
    }
  }
}
