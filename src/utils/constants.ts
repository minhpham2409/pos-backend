export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
} as const;

export type Role = 'admin' | 'cashier';
export const STOCK_TYPES = {
  IMPORT: 'import',
  EXPORT: 'export',
} as const;

export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  CONFLICT: 409,
} as const;

export const MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access denied',
  PRODUCT_NOT_FOUND: 'Product not found',
  ORDER_CREATED: 'Order created successfully',
  STOCK_UPDATED: 'Stock updated successfully',
  INVALID_STOCK: 'Insufficient stock',
   SERVER_ERROR: 'Internal server error', 
   USER_EXISTS: 'User already exists',
   LOGOUT_SUCCESS: 'Logout successful',
   CONFLICT: 'Conflict error',
   NOT_FOUND: 'Resource not found',
   REGISTER_SUCCESS: 'Registration successful',

} as const;