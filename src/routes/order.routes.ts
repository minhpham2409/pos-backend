import { Router } from 'express';
import { createOrderController, getOrdersController, getOrderByIdController } from '../controllers/order.controller';
import { validateOrder } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

/**
 * @route POST /api/orders
 * @desc Tạo đơn hàng mới
 * @access Private (admin hoặc cashier)
 */
router.post('/', authMiddleware, validateOrder, createOrderController);

/**
 * @route GET /api/orders
 * @desc Lấy danh sách đơn hàng
 * @access Private (admin thấy tất cả, cashier chỉ thấy đơn của mình)
 */
router.get('/', authMiddleware, getOrdersController);

/**
 * @route GET /api/orders/:id
 * @desc Lấy chi tiết đơn hàng theo ID
 * @access Private (admin thấy tất cả, cashier chỉ thấy đơn của mình)
 */
router.get('/:id', authMiddleware, getOrderByIdController);

export const orderRouter = router;