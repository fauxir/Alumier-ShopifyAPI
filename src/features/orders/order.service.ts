import { ShopifyService } from '../../shared/services/shopify.service.js';

export class OrderService {
  private static shopifyService = new ShopifyService(
    process.env.SHOPIFY_DOMAIN || '',
    process.env.SHOPIFY_ADMIN_API_TOKEN || ''
  );

  static async getPastOrders(productId: string, days: number = 30): Promise<any[]> {
    try {
      // First, verify if the product exists
      const productQuery = `
        {
          product(id: "gid://shopify/Product/${productId}") {
            id
            title
          }
        }
      `;

      const productResponse = await this.shopifyService.makeGraphQLRequest<any>(productQuery);
      
      if (!productResponse.data.product) {
        throw new Error('PRODUCT_NOT_FOUND');
      }

      const query = `
        {
          orders(
            first: 50,
            query: "created_at:>='${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()}' product_id:${productId}"
          ) {
            edges {
              node {
                id
                name
                createdAt
                customer {
                  firstName
                  lastName
                }
                lineItems(first: 10) {
                  edges {
                    node {
                      quantity
                      product {
                        id
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await this.shopifyService.makeGraphQLRequest<any>(query);
      const orders = response.data.orders.edges.map((edge: any) => {
        const order = edge.node;
        const lineItem = order.lineItems.edges.find((e: any) => 
          e.node.product?.id.includes(productId)
        )?.node;

        return {
          orderId: order.id.split('/').pop(),
          orderNumber: order.name,
          createdAt: order.createdAt,
          customer: order.customer ? {
            firstName: order.customer.firstName,
            lastName: order.customer.lastName,
            fullName: `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
          } : null,
          product: lineItem ? {
            id: lineItem.product.id.split('/').pop(),
            title: lineItem.product.title,
            quantity: lineItem.quantity
          } : null
        };
      });

      if (orders.length === 0) {
        throw new Error('NO_ORDERS_FOUND');
      }

      return orders;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PRODUCT_NOT_FOUND') {
          throw new Error('Product not found');
        } else if (error.message === 'NO_ORDERS_FOUND') {
          throw new Error('No orders found for this product in the specified time period');
        }
      }
      console.error('Error fetching past orders:', error);
      throw error;
    }
  }
}
