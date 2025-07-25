import { Router } from 'express';
import { importStockController, exportStockController, getStockMovementsController } from '../controllers/stock.controller';
import { validateStockMovement } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';

const router = Router();

/**
 * @route POST /api/stock/import
 * @desc Nhập kho sản phẩm
 * @access Private (admin only)
 */
router.post('/import', authMiddleware, roleMiddleware('admin'), validateStockMovement, importStockController);

/**
 * @route POST /api/stock/export
 * @desc Xuất kho sản phẩm
 * @access Private (admin only)
 */
router.post('/export', authMiddleware, roleMiddleware('admin'), validateStockMovement, exportStockController);

/**
 * @route GET /api/stock/history
 * @desc Lấy danh sách lịch sử nhập/xuất kho
 * @access Private (admin only)
 */
router.get('/history', authMiddleware, roleMiddleware('admin'), getStockMovementsController);

export const stockRouter = router;