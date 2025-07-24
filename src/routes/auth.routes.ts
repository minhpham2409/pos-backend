import { Router } from 'express';
import { login, register, logout } from '../controllers/auth.controller';
import { validateLogin, validateRegister } from '../middlewares/validate';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/login', validateLogin, login);

router.post('/register', validateRegister, register);

router.post('/logout', authMiddleware, logout);

export const authRouter = router;