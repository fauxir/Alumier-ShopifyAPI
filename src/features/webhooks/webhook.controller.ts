import { Request, Response } from 'express';
import { WebhookService } from './webhook.service.js';
import { ProductService } from '../products/product.service.js';

/**
 * @swagger
 * /webhook:
 *   post:
 *     summary: Handle Shopify webhooks
 *     description: Receives and processes Shopify webhooks for product updates
 *     tags: [Webhooks]
 *     security:
 *       - hmacVerification: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Webhook processed successfully
 *       401:
 *         description: Invalid HMAC signature
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export class WebhookController {
  /**
   * Handle incoming Shopify webhooks
   * @param req Express request object with HMAC signature and webhook data
   * @param res Express response object
   * @returns Promise<Response>
   */
  static async handleWebhook(req: Request, res: Response) {
    try {
      const hmac = req.header('X-Shopify-Hmac-Sha256');
      const topic = req.header('X-Shopify-Topic');
      const shopDomain = req.header('X-Shopify-Shop-Domain');
      
      if (!hmac) {
        console.log('Missing HMAC header');
        return res.status(401).json({
          status: 'error',
          message: 'Missing HMAC header'
        });
      }

      const rawBody = (req as any).rawBody?.toString('utf-8') || '';
      if (!rawBody) {
        console.log('Missing request body');
        return res.status(400).json({
          status: 'error',
          message: 'Missing request body'
        });
      }

      console.log('Received HMAC:', hmac);
      console.log('Raw body length:', rawBody.length);

      const isValid = WebhookService.verifyHmac(hmac, rawBody);

      if (!isValid) {
        console.log('Invalid HMAC signature');
        return res.status(401).json({
          status: 'error',
          message: 'Invalid HMAC signature'
        });
      }

      console.log('Webhook received:');
      console.log('Topic:', topic);
      console.log('Shop Domain:', shopDomain);

      if (topic === 'products/update') {
        const product = req.body;
        const variants = product.variants.map((variant: any) => ({
          id: variant.admin_graphql_api_id,
          title: variant.title,
          price: parseFloat(variant.price),
          sku: variant.sku
        }));

        await ProductService.updateProductData(
          product.admin_graphql_api_id,
          product.title,
          variants
        );
      }

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
