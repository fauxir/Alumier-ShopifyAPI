import { ShopifyDiscount, DiscountResponse } from '../types/shopify.types.js';
import { AppError } from '../middleware/error.middleware.js';

export class DiscountService {
  public static calculateDiscount(data: ShopifyDiscount): DiscountResponse[] {
    try {
      if (!data?.data?.automaticDiscountNode?.automaticDiscount?.customerGets) {
        throw new AppError(400, 'Invalid discount data structure');
      }

      const discountData = data.data.automaticDiscountNode.automaticDiscount.customerGets;
      
      if (!discountData.items?.productVariants?.edges?.length) {
        throw new AppError(404, 'No product variants found for this discount');
      }

      const discountPercentage = discountData.value?.percentage;
      if (typeof discountPercentage !== 'number' || discountPercentage < 0 || discountPercentage > 1) {
        throw new AppError(400, 'Invalid discount percentage');
      }

      return discountData.items.productVariants.edges.map(({ node: variant }) => {
        if (!variant.price || isNaN(parseFloat(variant.price))) {
          throw new AppError(400, 'Invalid product price');
        }

        const productId = variant.id.split('/').pop() as string;
        const originalPrice = parseFloat(variant.price);

        const exactDiscountedPrice = originalPrice * (1 - discountPercentage);
        const discountedPrice = Math.ceil(exactDiscountedPrice * 100) / 100;

        return {
          productId,
          productTitle: variant.product.title,
          productHandle: variant.product.handle,
          originalPrice,
          discountedPrice: discountedPrice.toFixed(2),
          discountPercentage: `${discountPercentage * 100}%`
        };
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(500, 'Error calculating discount');
    }
  }
}
