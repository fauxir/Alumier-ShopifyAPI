import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service.js';

export class WebhookController {
  static async handleWebhook(req: Request, res: Response) {
    try {
      const hmac = req.header('X-Shopify-Hmac-Sha256');
      const topic = req.header('X-Shopify-Topic');
      const shopDomain = req.header('X-Shopify-Shop-Domain');
      
      if (!hmac) {
        return res.status(401).json({
          status: 'error',
          message: 'Missing HMAC header'
        });
      }

      const rawBody = (req as any).rawBody?.toString('utf-8') || '';
      if (!rawBody) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing request body'
        });
      }

      const isValid = WebhookService.verifyHmac(hmac, rawBody);

      if (!isValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid HMAC signature'
        });
      }

      console.log('Webhook received:', {
        topic,
        shopDomain,
        data: req.body
      });

      return res.status(200).json({
        status: 'success',
        message: 'Webhook processed successfully'
      });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to process webhook'
      });
    }
  }
}
