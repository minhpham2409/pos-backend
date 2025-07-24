import { Request, Response, NextFunction } from 'express';
import { login as loginService, register as registerService, logout as logoutService } from '../services/auth.service';
import { appLogger } from '../utils/logger';
import { STATUS_CODES, MESSAGES } from '../utils/constants';
import { AuthRequest, AuthRequestDto } from '../types';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authData: AuthRequestDto = req.body;
    const result = await loginService(authData);

    // Lưu token vào cookie
    res.cookie('jwt', result.token, {
      httpOnly: true, // Ngăn JavaScript truy cập cookie
      secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS trong production
      sameSite: 'strict', // Ngăn CSRF
      maxAge: 60 * 60 * 1000, // Hết hạn sau 1 giờ (phù hợp với expiresIn: '1h')
    });

    appLogger.info('Login request processed successfully', { userId: result.user.id });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: { user: result.user }, // Không trả token trong body, chỉ lưu trong cookie
      message: MESSAGES.LOGIN_SUCCESS,
    });
  } catch (error) {
    appLogger.error('Login request failed', {
      error: (error as Error).message,
      email: req.body.email,
    });
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authData: AuthRequestDto & { username: string; role?: 'admin' | 'user' } = req.body;
    const result = await registerService(authData);

    // Lưu token vào cookie
    res.cookie('jwt', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
    });

    appLogger.info('Register request processed successfully', { userId: result.user.id });
    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: { user: result.user }, // Không trả token trong body
      message: MESSAGES.REGISTER_SUCCESS,
    });
  } catch (error) {
    appLogger.error('Register request failed', {
      error: (error as Error).message,
      email: req.body.email,
      username: req.body.username,
    });
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
    if (!token) {
      appLogger.warn('No token provided for logout', { userId: req.user?.userId });
      const error = new Error(MESSAGES.UNAUTHORIZED);
      error.name = 'UnauthorizedError';
      (error as any).statusCode = STATUS_CODES.UNAUTHORIZED;
      throw error;
    }

    const result = await logoutService(token, req.user!.userId);

    // Xóa cookie jwt
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    appLogger.info('Logout request processed successfully', { userId: req.user!.userId });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: result,
      message: MESSAGES.LOGOUT_SUCCESS,
    });
  } catch (error) {
    appLogger.error('Logout request failed', {
      error: (error as Error).message,
      userId: req.user?.userId,
    });
    next(error);
  }
};