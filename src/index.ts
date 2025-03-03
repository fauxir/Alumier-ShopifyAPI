import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { DiscountController } from './features/discounts/discount.controller.js';
import { OrderController } from './features/orders/order.controller.js';
import { WebhookController } from './features/webhooks/webhook.controller.js';
import { requestLogger } from './shared/middleware/logger.middleware.js';
import { errorHandler } from './shared/middleware/error.middleware.js';
import { ProductService } from './features/products/product.service.js';
import { EmailService } from './shared/services/email.service.js';
import { swaggerSpec } from './shared/config/swagger.config.js';

const app = express();
app.set('trust proxy', 1);
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',').filter(Boolean).length ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST'],
  optionsSuccessStatus: 200
};

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

const rawBodyBuffer = (req: express.Request, _res: express.Response, buf: Buffer) => {
  (req as any).rawBody = buf;
};

// Middleware
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({
  verify: rawBodyBuffer
}));
app.use(requestLogger);

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/discounts', DiscountController.getDiscount);
app.get('/past-orders', OrderController.getPastOrders);
app.post('/webhook', WebhookController.handleWebhook);

// Error Handling
app.use(errorHandler);

app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

app.listen(port, '0.0.0.0', async () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`API Documentation available at http://0.0.0.0:${port}/api-docs`);

  if (!process.env.SHOPIFY_DOMAIN || !process.env.SHOPIFY_ADMIN_API_TOKEN) {
    console.warn('Warning: Shopify credentials are not configured in environment variables');
  } else {
    console.log('Shopify configuration detected for store:', process.env.SHOPIFY_DOMAIN);
    try {
      EmailService.initialize();
      await ProductService.initializeProductData();
      console.log('Product data initialized successfully');
    } catch (error) {
      console.error('Failed to initialize product data:', error);
    }
  }
});
