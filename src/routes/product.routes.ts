import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { validateProduct } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';

const router = Router();

router.get('/', authMiddleware, getProducts);

router.post('/', authMiddleware, roleMiddleware('admin'), validateProduct, createProduct);

router.put('/:id', authMiddleware, roleMiddleware('admin'), validateProduct, updateProduct);

router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteProduct);

export const productRouter = router;