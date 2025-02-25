import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AlumierMD Shopify API',
      version: '1.0.0',
      description: 'API for Shopify discount management and price monitoring',
      contact: {
        name: 'API Support',
        url: 'https://github.com/fauxir/Alumier-ShopifyAPI'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://alumiermd-discounts.michaeladrian.co.uk',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error'
            },
            message: {
              type: 'string',
              example: 'Error message description'
            }
          }
        },
        CustomerInfo: {
          type: 'object',
          properties: {
            firstName: {
              type: 'string',
              nullable: true,
              example: 'John'
            },
            lastName: {
              type: 'string',
              nullable: true,
              example: 'Doe'
            },
            fullName: {
              type: 'string',
              example: 'John Doe'
            }
          }
        },
        DiscountResponse: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              example: '1852230926666'
            },
            productTitle: {
              type: 'string',
              example: 'AlumierMD Moisture Matte Sunscreen'
            },
            productHandle: {
              type: 'string',
              example: 'alumiermd-moisture-matte-sunscreen'
            },
            originalPrice: {
              type: 'number',
              example: 29.99
            },
            discountedPrice: {
              type: 'string',
              example: '24.99'
            },
            discountPercentage: {
              type: 'string',
              example: '20%'
            }
          }
        },
        OrderProduct: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '10042865353034'
            },
            title: {
              type: 'string',
              example: 'AlumierMD Moisture Matte Sunscreen'
            },
            quantity: {
              type: 'integer',
              example: 2
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              example: '4495264825562'
            },
            orderNumber: {
              type: 'string',
              example: '#1002'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-02-24T22:42:52Z'
            },
            customer: {
              $ref: '#/components/schemas/CustomerInfo'
            },
            product: {
              $ref: '#/components/schemas/OrderProduct'
            }
          }
        },
        DiscountedProduct: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              example: '50333266116938'
            },
            productTitle: {
              type: 'string',
              example: 'The Complete Snowboard'
            },
            productHandle: {
              type: 'string',
              example: 'the-complete-snowboard'
            },
            originalPrice: {
              type: 'number',
              example: 699.95
            },
            discountedPrice: {
              type: 'string',
              example: '629.96'
            },
            discountPercentage: {
              type: 'string',
              example: '10%'
            }
          }
        }
      }
    }
  },
  apis: ['./src/features/**/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
