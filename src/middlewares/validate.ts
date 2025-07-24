import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { appLogger } from '../utils/logger';
import { STATUS_CODES, MESSAGES } from '../utils/constants';
import { AuthRequest } from '../types';

// Hàm xử lý lỗi validation
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    appLogger.warn('Validation errors', { errors: errors.array(), path: req.path });
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    (error as any).details = errors.array();
    (error as any).statusCode = STATUS_CODES.BAD_REQUEST;
    return next(error);
  }
  next();
};

// Validation cho POST /login
export const validateLogin = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// Validation cho POST /register
export const validateRegister = [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('username').notEmpty().withMessage('Username is required'),
  body('role').optional().isIn(['admin', 'user']).withMessage('Role must be either admin or user'),
  handleValidationErrors,
];

// Validation cho POST /products
export const validateProduct = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('unit').notEmpty().withMessage('Unit is required'),
  handleValidationErrors,
];

// Validation cho POST /orders
export const validateOrder = [
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors,
];

// Validation cho POST /stock/import và POST /stock/export
export const validateStockMovement = [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('qty').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('type').isIn(['import', 'export']).withMessage('Type must be import or export'),
  body('note').optional().isString().withMessage('Note must be a string'),
  handleValidationErrors,
];