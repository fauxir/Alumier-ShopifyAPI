# AlumierMD Shopify Discount API

A TypeScript-based Express.js API that extends Shopify's functionality by providing discounted prices for products outside the cart. This solves the limitation of Shopify's liquid templating where discounts are only visible in the cart.

## Purpose

This API server fetches product discount information from Shopify's Admin API with GraphQL and calculates the discounted prices, allowing you to display accurate discount information directly on product pages.

## Features

- Fetches real-time discount data from Shopify Admin API
- Calculates precise discounted prices
- RESTful endpoint for easy integration
- CORS protection with configurable origins
- Rate limiting (100 requests/minute)
- Comprehensive error handling
- Docker support for deployment
- TypeScript for type safety

## Quick Start

### Local Development

1. Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd <repository-name>
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```
Update `.env` with your credentials:
```
PORT=3000
SHOPIFY_DOMAIN=your-store.myshopify.com
SHOPIFY_API_KEY=your_api_key
SHOPIFY_SECRET_KEY=your_secret_key
SHOPIFY_ADMIN_API_TOKEN=your_admin_token
ALLOWED_ORIGINS=http://localhost:3000,https://your-store.myshopify.com
```

3. Start the development server:
```bash
npm run dev
```

### Docker Deployment

1. Build and start the container:
```bash
docker-compose up -d
```

2. Check logs:
```bash
docker-compose logs -f
```

## API Usage

### GET /discounts

Returns the discounted price information for a product.

Usage:
- `/discounts` - Uses default discount ID
- `/discounts?discountId=gid://shopify/DiscountAutomaticNode/YOUR_ID` - Uses specified discount ID

Example Response:
```json
{
  "productId": "50337148436810",
  "originalPrice": 2629.95,
  "discountedPrice": "2366.96",
  "discountPercentage": "10%"
}
```

Error Response:
```json
{
  "status": "error",
  "message": "Error description",
  "details": "Additional error details (for API errors)"
}
```

Common error cases handled:
- Invalid discount data structure
- Missing product variants
- Invalid prices
- Invalid discount percentages
- Rate limit exceeded
- Invalid routes

## Security Features

- CORS protection with configurable origins
- Rate limiting: 100 requests per minute per IP
- Environment-based configuration
- Error boundaries and type safety

## Architecture

- Express.js REST API with TypeScript
- Shopify GraphQL Admin API integration
- Service-based architecture for maintainability
- Docker containerization for deployment
- Environment-based configuration

## Development

- `npm run dev`: Start development server with hot-reload
- `npm run build`: Build TypeScript code
- `npm start`: Start production server

## Health Check

The API includes a health check endpoint at `/health` for monitoring.

## Notes

- Keep your Shopify Admin API token secure
- Configure ALLOWED_ORIGINS in production
- Monitor rate limiting in high-traffic scenarios
