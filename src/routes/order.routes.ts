import { Router } from 'express';
import { createOrderController, getOrdersController, getOrderByIdController } from '../controllers/order.controller';
import { validateOrder } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/', authMiddleware, validateOrder, createOrderController);

router.get('/', authMiddleware, getOrdersController);

router.get('/:id', authMiddleware, getOrderByIdController);

export const orderRouter = router;