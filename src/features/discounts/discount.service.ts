import { ShopifyService } from '../../shared/services/shopify.service.js';
import { ShopifyDiscount, DiscountResponse } from '../../shared/types/common.types.js';
import { AppError } from '../../shared/middleware/error.middleware.js';

export class DiscountService {
  private static shopifyService = new ShopifyService(
    process.env.SHOPIFY_DOMAIN || '',
    process.env.SHOPIFY_ADMIN_API_TOKEN || ''
  );

  static async getDiscountedProducts(discountId?: string): Promise<DiscountResponse[]> {
    try {
      const query = `
      {
        automaticDiscountNode(id: "${discountId}") {
          id
          automaticDiscount {
            ... on DiscountAutomaticBasic {
              customerGets {
                items {
                  ... on DiscountProducts {
                    __typename
                    productVariants(first: 10) {
                      edges {
                        node {
                          id
                          product {
                            title
                            handle
                          }
                          price
                        }
                      }
                    }
                  }
                }
                value {
                  ... on DiscountPercentage {
                    __typename
                    percentage
                  }
                }
              }
            }
          }
        }
      }
    `;

      const response = await this.shopifyService.makeGraphQLRequest<ShopifyDiscount>(query);
      return this.calculateDiscount(response);
    } catch (error) {
      console.error('Error fetching discounted products:', error);
      throw error;
    }
  }

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
