# AlumierMD Shopify API

A TypeScript-based Express.js API that extends Shopify's functionality by providing the discounted prices for products outside the cart, monitoring for price changes across product variants and order history.

## Features

- Real-time discount calculations
- Price monitoring with email alerts
- Product variant tracking
- Order history analysis
- HMAC webhook verification
- RESTful endpoints
- OpenAPI/Swagger documentation
- Rate limiting protection
- CORS security
- Docker support

## Prerequisites

- Node.js >= 20
- npm or yarn
- Docker (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/fauxir/Alumier-ShopifyAPI.git
cd Alumier-ShopifyAPI
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
PORT=3000
SHOPIFY_DOMAIN=your-store.myshopify.com
SHOPIFY_API_KEY=your_api_key
SHOPIFY_SECRET_KEY=your_secret_key
SHOPIFY_ADMIN_API_TOKEN=your_admin_token
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
ALLOWED_ORIGINS=http://localhost:3000,https://your-store.myshopify.com
SENDGRID_API_KEY=your_sendgrid_api_key
NOTIFICATION_EMAIL=your@email.com
NOTIFICATION_EMAIL_FROM=notifications@yourdomain.com
```

## API Documentation

The API documentation is available at `/api-docs` when running the server. It provides detailed information about all endpoints, request/response formats, and examples.

### Endpoints

#### GET /discounts
Returns discounted price information for products.

**Query Parameters:**
- `discountId` (optional): Specific discount ID to query

**Response Example:**
```json
[
  {
    "productId": "50333266116938",
    "productTitle": "AlumierMD Moisture Matte Sunscreen",
    "productHandle": "moisture-matte-sunscreen",
    "originalPrice": 49.99,
    "discountedPrice": "44.99",
    "discountPercentage": "10%"
  }
]
```

#### GET /past-orders
Retrieves order history for a specific product.

**Query Parameters:**
- `productId` (required): The Shopify product ID
- `days` (optional): Number of days to look back (default: 30, max: 365)

**Success Response Example:**
```json
[
  {
    "orderId": "4495264825562",
    "orderNumber": "#1002",
    "createdAt": "2025-02-24T22:42:52Z",
    "customer": {
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe"
    },
    "product": {
      "id": "10042865353034",
      "title": "AlumierMD Moisture Matte Sunscreen",
      "quantity": 2
    }
  }
]
```

**Error Responses:**

1. Product Not Found (404):
```json
{
  "status": "error",
  "message": "Product not found"
}
```

2. No Orders Found (404):
```json
{
  "status": "error",
  "message": "No orders found for this product in the specified time period"
}
```

3. Invalid Parameters (400):
```json
{
  "status": "error",
  "message": "Days must be between 1 and 365"
}
```

#### POST /webhook
Handles Shopify webhooks for product updates and price monitoring.

**Headers Required:**
- `X-Shopify-Hmac-Sha256`: HMAC signature for verification
- `X-Shopify-Topic`: Webhook topic (e.g., 'products/update')
- `X-Shopify-Shop-Domain`: Shop domain

**Features:**
- HMAC verification for security
- Price change monitoring
- Email notifications for significant price drops (>20%)
- Product variant tracking

## Price Monitoring

The API includes automated price monitoring:

- Tracks all product variants independently
- Sends email alerts for price drops over 20%
- Stores historical price data
- Includes variant-specific information in notifications

### Email Notifications

Price change notifications include:
- Product title and variant name
- SKU information
- Old and new prices
- Percentage decrease
- Timestamp

## Docker Deployment

1. Build the image:
```bash
docker-compose build
```

2. Start the container:
```bash
docker-compose up -d
```

The API will be available at `http://localhost:3000`.

## Development

Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── features/
│   ├── discounts/
│   │   ├── discount.controller.ts
│   │   ├── discount.service.ts
│   │   └── discount.types.ts
│   ├── orders/
│   │   ├── order.controller.ts
│   │   ├── order.service.ts
│   │   └── order.types.ts
│   ├── products/
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   └── product.types.ts
│   └── webhooks/
│       ├── webhook.controller.ts
│       ├── webhook.service.ts
│       └── webhook.types.ts
├── shared/
│   ├── config/
│   │   └── swagger.config.ts
│   ├── middleware/
│   │   ├── error.middleware.ts
│   │   └── logger.middleware.ts
│   ├── services/
│   │   ├── email.service.ts
│   │   └── shopify.service.ts
│   └── types/
│       └── common.types.ts
└── index.ts
```