import { Request, Response } from 'express';
import { OrderService } from '../services/order.service.js';

export class OrderController {
  static async getPastOrders(req: Request, res: Response) {
    try {
      const productId = req.query.productId as string;
      const daysBack = parseInt(req.query.daysBack as string);

      if (!productId || isNaN(daysBack)) {
        return res.status(400).json({
          status: 'error',
          message: 'Product ID and days back are required parameters'
        });
      }

      const orders = await OrderService.getPastOrders(productId, daysBack);
      
      return res.status(200).json({
        status: 'success',
        data: orders
      });
    } catch (error) {
      console.error('Error in getPastOrders:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch past orders'
      });
    }
  }
}
