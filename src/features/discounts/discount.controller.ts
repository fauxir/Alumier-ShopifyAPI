import { Request, Response } from 'express';
import { DiscountService } from './discount.service.js';
import { ShopifyService } from '../../shared/services/shopify.service.js';
import { AppError } from '../../shared/middleware/error.middleware.js';

const shopifyService = new ShopifyService(
  process.env.SHOPIFY_DOMAIN || '',
  process.env.SHOPIFY_ADMIN_API_TOKEN || ''
);

const DEFAULT_DISCOUNT_ID = '1852230926666';
const SHOPIFY_DISCOUNT_PREFIX = 'gid://shopify/DiscountAutomaticNode/';

/**
 * @swagger
 * /discounts:
 *   get:
 *     summary: Get discounted products
 *     description: Returns a list of products with their discounted prices
 *     parameters:
 *       - in: query
 *         name: discountId
 *         schema:
 *           type: string
 *         description: The Shopify discount ID (can be either the full ID or just the numeric part)
 *         example: "1852230926666"
 *     responses:
 *       200:
 *         description: List of discounted products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DiscountResponse'
 *       400:
 *         description: Bad request - invalid discount ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: "error"
 *               message: "Invalid discount ID format"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: "error"
 *               message: "Failed to get discounts"
 */
export class DiscountController {
  public static async getDiscount(req: Request, res: Response): Promise<void> {
    try {
      const rawDiscountId = req.query.discountId as string;
      const discountId = DiscountController.formatDiscountId(rawDiscountId);
      
      console.log('Fetching discount data from Shopify for ID:', discountId);
      const shopifyData = await shopifyService.fetchDiscountData(discountId);
      
      console.log('Processing discount calculation...');
      const discountInfo = DiscountService.calculateDiscount(shopifyData);
      console.log('Discount calculated successfully:', discountInfo);
      
      res.json(discountInfo);
    } catch (error) {
      console.error('Error processing discount:', error);
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: error.message
        });
        return;
      }
      res.status(500).json({ 
        status: 'error',
        message: 'Failed to process discount',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private static formatDiscountId(rawId: string | undefined): string {
    if (!rawId) {
      return SHOPIFY_DISCOUNT_PREFIX + DEFAULT_DISCOUNT_ID;
    }

    // If it's already a full Shopify ID, return as is
    if (rawId.startsWith(SHOPIFY_DISCOUNT_PREFIX)) {
      return rawId;
    }

    // Validate that the ID contains only numbers
    if (!/^\d+$/.test(rawId)) {
      throw new AppError(400, 'Invalid discount ID format. Must be a numeric ID or full Shopify ID.');
    }

    return SHOPIFY_DISCOUNT_PREFIX + rawId;
  }
}
