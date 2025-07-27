import { Router } from 'express';
import { importStockController, exportStockController, getStockMovementsController } from '../controllers/stock.controller';
import { validateStockMovement } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';

const router = Router();

router.post('/import', authMiddleware, roleMiddleware('admin'), validateStockMovement, importStockController);

router.post('/export', authMiddleware, roleMiddleware('admin'), validateStockMovement, exportStockController);

router.get('/history', authMiddleware, roleMiddleware('admin'), getStockMovementsController);

export const stockRouter = router;