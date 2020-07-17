import express, { Request, Response } from 'express';
import { Order } from '../models/order';
import { body } from 'express-validator';
import {
  requireAuth,
  BadRequestError,
  validateRequest,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@agreejwc/common';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('token').notEmpty().withMessage('Token must be provided'),
    body('orderId').notEmpty().withMessage('OrderId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError('Order not found');
    }
    if (order.userId !== req.currentuser!.id) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }

    res.status(201).send({ success: true });
  }
);

export { router as createChargeRouter };
