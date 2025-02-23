import { Request, Response } from 'express';
import { DiscountService } from '../services/discount.service.js';
import { ShopifyService } from '../services/shopify.service.js';

const shopifyService = new ShopifyService(
  process.env.SHOPIFY_DOMAIN || '',
  process.env.SHOPIFY_ADMIN_API_TOKEN || ''
);

export class DiscountController {
  public static async getDiscount(req: Request, res: Response): Promise<void> {
    try {
      const discountId = req.query.discountId as string || 'gid://shopify/DiscountAutomaticNode/1852230926666';
      
      console.log('Fetching discount data from Shopify for ID:', discountId);
      const shopifyData = await shopifyService.fetchDiscountData(discountId);
      
      console.log('Processing discount calculation...');
      const discountInfo = DiscountService.calculateDiscount(shopifyData);
      console.log('Discount calculated successfully:', discountInfo);
      
      res.json(discountInfo);
    } catch (error) {
      console.error('Error processing discount:', error);
      res.status(500).json({ 
        error: 'Error processing discount',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
