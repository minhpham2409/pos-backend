import { Request, Response, NextFunction } from 'express';
import {appLogger} from '../utils/logger';
import { STATUS_CODES, MESSAGES } from '../utils/constants';
import { AuthRequest } from '../types';

// Middleware xử lý lỗi
const errorHandler = (err: any, req: AuthRequest, res: Response, next: NextFunction) => {
  // Ghi log lỗi
  appLogger.error('Server error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    user: req.user ? { userId: req.user.userId, role: req.user.role } : 'Unauthenticated',
  });

  // Xác định mã trạng thái và thông điệp lỗi mặc định
  let statusCode = err.statusCode || STATUS_CODES.SERVER_ERROR;
  let message = err.message || MESSAGES.SERVER_ERROR;

  // Xử lý các lỗi cụ thể
  switch (err.name) {
    case 'JsonWebTokenError':
    case 'TokenExpiredError':
      message = MESSAGES.UNAUTHORIZED;
      statusCode = STATUS_CODES.UNAUTHORIZED;
      break;
    case 'ForbiddenError':
      message = MESSAGES.FORBIDDEN;
      statusCode = STATUS_CODES.FORBIDDEN;
      break;
    case 'NotFoundError':
      message = MESSAGES.PRODUCT_NOT_FOUND;
      statusCode = STATUS_CODES.NOT_FOUND;
      break;
    case 'InvalidStockError':
      message = MESSAGES.INVALID_STOCK;
      statusCode = STATUS_CODES.BAD_REQUEST;
      break;
    default:
      // Giữ nguyên statusCode và message mặc định cho các lỗi không xác định
      break;
  }

  // Trả về phản hồi lỗi
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }), // Chỉ trả về stack trace trong môi trường development
  });
};

export default errorHandler;