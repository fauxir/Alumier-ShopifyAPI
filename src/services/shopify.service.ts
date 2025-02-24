import fetch from 'node-fetch';
import { ShopifyDiscount } from '../types/shopify.types.js';

interface ShopifyErrorResponse {
  errors?: string[];
}

export class ShopifyService {
  private static SHOPIFY_ADMIN_API_VERSION = '2024-01';
  
  constructor(
    private shopifyDomain: string,
    private accessToken: string
  ) {}

  async makeGraphQLRequest<T>(query: string): Promise<T & ShopifyErrorResponse> {
    if (!this.shopifyDomain || !this.accessToken) {
      throw new Error('Shopify credentials are not configured');
    }

    try {
      const response = await fetch(
        `https://${this.shopifyDomain}/admin/api/${ShopifyService.SHOPIFY_ADMIN_API_VERSION}/graphql.json`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': this.accessToken
          },
          body: JSON.stringify({ query })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API error: ${response.statusText}. ${errorText}`);
      }

      const data = await response.json() as T & ShopifyErrorResponse;
      
      if (data.errors) {
        throw new Error(`GraphQL Errors: ${JSON.stringify(data.errors)}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching from Shopify:', error);
      throw new Error('Failed to fetch data from Shopify');
    }
  }

  async fetchDiscountData(discountId: string): Promise<ShopifyDiscount> {
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

    return this.makeGraphQLRequest<ShopifyDiscount>(query);
  }
}
