import { Request, Response } from 'express';
import { OrderService } from './order.service.js';

/**
 * @swagger
 * /past-orders:
 *   get:
 *     summary: Get past orders for a product
 *     description: Returns past orders for a specific product within a given time frame, including customer and product details
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The Shopify product ID (e.g., 10042865353034)
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *           maximum: 365
 *         description: Number of days to look back for orders
 *     responses:
 *       200:
 *         description: List of past orders for the product
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *               example:
 *                 - orderId: "4495264825562"
 *                   orderNumber: "#1002"
 *                   createdAt: "2025-02-24T22:42:52Z"
 *                   customer:
 *                     firstName: "John"
 *                     lastName: "Doe"
 *                     fullName: "John Doe"
 *                   product:
 *                     id: "10042865353034"
 *                     title: "AlumierMD Moisture Matte Sunscreen"
 *                     quantity: 2
 *       400:
 *         description: Bad request - missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingId:
 *                 summary: Missing product ID
 *                 value:
 *                   status: "error"
 *                   message: "Product ID is required"
 *               invalidDays:
 *                 summary: Invalid days parameter
 *                 value:
 *                   status: "error"
 *                   message: "Days must be between 1 and 365"
 *       404:
 *         description: Product not found or no orders found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               productNotFound:
 *                 summary: Product not found
 *                 value:
 *                   status: "error"
 *                   message: "Product not found"
 *               noOrders:
 *                 summary: No orders found
 *                 value:
 *                   status: "error"
 *                   message: "No orders found for this product in the specified time period"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               status: "error"
 *               message: "Failed to get past orders"
 */
export class OrderController {
  /**
   * Get past orders for a specific product
   * @param req Express request object with productId and optional days
   * @param res Express response object
   * @returns Promise<void>
   */
  static async getPastOrders(req: Request, res: Response): Promise<void> {
    try {
      const productId = req.query.productId as string;
      const days = parseInt(req.query.days as string) || 30;

      if (!productId) {
        res.status(400).json({
          status: 'error',
          message: 'Product ID is required'
        });
        return;
      }

      if (days < 1 || days > 365) {
        res.status(400).json({
          status: 'error',
          message: 'Days must be between 1 and 365'
        });
        return;
      }

      const orders = await OrderService.getPastOrders(productId, days);
      res.json(orders);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Product not found') {
          res.status(404).json({
            status: 'error',
            message: error.message
          });
          return;
        } else if (error.message === 'No orders found for this product in the specified time period') {
          res.status(404).json({
            status: 'error',
            message: error.message
          });
          return;
        }
      }
      
      console.error('Error getting past orders:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get past orders'
      });
    }
  }
}
