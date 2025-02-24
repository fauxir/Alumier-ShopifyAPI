import { gql } from 'graphql-request';
import { ShopifyService } from './shopify.service.js';
import { ShopifyOrdersResponse } from '../types/shopify.orders.types.js';

export class OrderService {
  private static shopifyService = new ShopifyService(
    process.env.SHOPIFY_DOMAIN || '',
    process.env.SHOPIFY_ADMIN_API_TOKEN || ''
  );

  static async getPastOrders(productId: string, daysBack: number) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - daysBack);
    const formattedPastDate = pastDate.toISOString().split('T')[0];

    const query = gql`
      {
        orders(
          first: 50,
          query: "created_at:>='${formattedPastDate}' product_id:${productId}"
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

    const response = await this.shopifyService.makeGraphQLRequest<ShopifyOrdersResponse>(query);

    return response.data.orders.edges.map((edge) => {
      const order = edge.node;
      return {
        orderId: order.id,
        orderNumber: order.name,
        createdAt: order.createdAt,
        customer: {
          firstName: order.customer?.firstName || '',
          lastName: order.customer?.lastName || '',
          fullName: order.customer ? `${order.customer.firstName} ${order.customer.lastName}`.trim() : 'Anonymous'
        },
        products: order.lineItems.edges.map((item) => ({
          quantity: item.node.quantity,
          productId: item.node.product.id,
          productTitle: item.node.product.title
        }))
      };
    });
  }
}
