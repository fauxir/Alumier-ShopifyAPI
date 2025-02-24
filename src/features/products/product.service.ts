import fs from 'fs/promises';
import path from 'path';
import { ShopifyService } from '../../shared/services/shopify.service.js';
import { EmailService } from '../../shared/services/email.service.js';
import { Product, ProductVariant } from '../../shared/types/common.types.js';

export class ProductService {
  private static shopifyService = new ShopifyService(
    process.env.SHOPIFY_DOMAIN || '',
    process.env.SHOPIFY_ADMIN_API_TOKEN || ''
  );

  private static readonly PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json');
  private static readonly PRICE_CHANGE_THRESHOLD = 0.2; // 20%

  static async initializeProductData(): Promise<void> {
    try {
      const dataDir = path.dirname(this.PRODUCTS_FILE);
      await fs.mkdir(dataDir, { recursive: true });

      const query = `
        {
          products(first: 100) {
            edges {
              node {
                id
                title
                variants(first: 100) {
                  edges {
                    node {
                      id
                      title
                      sku
                      price
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await this.shopifyService.makeGraphQLRequest<any>(query);
      const products = response.data.products.edges.map((edge: any) => {
        const product = edge.node;
        return {
          id: product.id,
          title: product.title,
          variants: product.variants.edges.map((variantEdge: any) => {
            const variant = variantEdge.node;
            return {
              id: variant.id,
              title: variant.title,
              price: parseFloat(variant.price),
              sku: variant.sku
            };
          })
        };
      });

      await fs.writeFile(this.PRODUCTS_FILE, JSON.stringify(products, null, 2));
      console.log('Product data initialized successfully');
    } catch (error) {
      console.error('Error initializing product data:', error);
      throw error;
    }
  }

  static async updateProductData(
    productId: string,
    productTitle: string,
    variants: ProductVariant[]
  ): Promise<void> {
    try {
      let products: Product[] = [];
      try {
        const data = await fs.readFile(this.PRODUCTS_FILE, 'utf-8');
        products = JSON.parse(data);
      } catch (error) {
        console.log('No existing product data found, creating new file');
      }

      const existingProductIndex = products.findIndex(p => p.id === productId);
      const newProduct = { id: productId, title: productTitle, variants };

      if (existingProductIndex === -1) {
        products.push(newProduct);
      } else {
        const existingProduct = products[existingProductIndex];
        
        // Check for significant price changes
        for (const newVariant of variants) {
          const existingVariant = existingProduct.variants.find(v => v.id === newVariant.id);
          if (existingVariant) {
            const priceDecrease = (existingVariant.price - newVariant.price) / existingVariant.price;
            if (priceDecrease > this.PRICE_CHANGE_THRESHOLD) {
              await EmailService.sendPriceChangeAlert(
                productTitle,
                newVariant.title,
                newVariant.sku,
                existingVariant.price,
                newVariant.price
              );
            }
          }
        }

        products[existingProductIndex] = newProduct;
      }

      await fs.writeFile(this.PRODUCTS_FILE, JSON.stringify(products, null, 2));
    } catch (error) {
      console.error('Error updating product data:', error);
      throw error;
    }
  }
}
