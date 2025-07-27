import { Request, Response, NextFunction } from 'express';
import { createOrder, getOrders,getOrderById } from '../services/order.service';
import { appLogger } from '../utils/logger';
import { STATUS_CODES } from '../utils/constants';
import { AuthRequest, OrderRequestDto } from '../types';

export async function createOrderController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const orderData: OrderRequestDto = req.body;
    const userId = req.user!.userId;

    const order = await createOrder(orderData, userId);

    appLogger.info('Order created successfully', { orderId: order._id, userId });
    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    appLogger.error('Failed to create order', {
      error: (error as Error).message,
      userId: req.user?.userId,
    });
    next(error);
  }
}


export async function getOrdersController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '10', userId } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const filterUserId = userId ? (userId as string) : req.user!.userId;

    const result = await getOrders(pageNum, limitNum, filterUserId);

    appLogger.info('Orders retrieved successfully', { page: pageNum, limit: limitNum, userId: filterUserId });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    appLogger.error('Failed to retrieve orders', {
      error: (error as Error).message,
      userId: req.user?.userId,
    });
    next(error);
  }
}


export async function getOrderByIdController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const orderId = req.params.id;
    const userId = req.user!.userId;
    const role = req.user!.role;

    const order = await getOrderById(orderId, userId, role);

    appLogger.info('Order retrieved successfully', { orderId, userId });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: order,
      message: 'Order retrieved successfully',
    });
  } catch (error) {
    appLogger.error('Failed to retrieve order', {
      error: (error as Error).message,
      orderId: req.params.id,
      userId: req.user?.userId,
    });
    next(error);
  }
}