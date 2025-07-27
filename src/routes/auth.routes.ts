import { Router } from 'express';
import { login, register, logout, getProfile, getAllUsers } from '../controllers/auth.controller';
import { validateLogin, validateRegister } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';
import { roleMiddleware } from '../middlewares/role';


const router = Router();

router.post('/login', validateLogin, login);

router.post('/register', validateRegister, register);

router.post('/logout', authMiddleware, logout);

router.get('/profile', authMiddleware, getProfile)

router.get('/users', authMiddleware,roleMiddleware('admin'), getAllUsers); 





export const authRouter = router;