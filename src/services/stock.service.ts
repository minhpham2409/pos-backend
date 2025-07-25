import  Product  from '../models/Product';
import  StockMovement  from '../models/StockMovement';
import { appLogger } from '../utils/logger';
import { STATUS_CODES, MESSAGES } from '../utils/constants';
import { StockMovementRequestDto } from '../types';

/**
 * Nhập kho sản phẩm (admin only)
 * @param stockData - Dữ liệu nhập kho (productId, qty, note)
 * @param userId - ID của user thực hiện
 * @returns Lịch sử nhập kho
 */
export async function importStock(stockData: StockMovementRequestDto, userId: string) {
  const { productId, qty, note } = stockData;

  // Kiểm tra sản phẩm tồn tại
  const product = await Product.findById(productId);
  if (!product) {
    appLogger.warn('Product not found', { productId, userId });
    const error = new Error(MESSAGES.PRODUCT_NOT_FOUND);
    error.name = 'NotFoundError';
    (error as any).statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  // Tạo lịch sử nhập kho
  const stockMovement = new StockMovement({
    type: 'import',
    productId,
    qty,
    note,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Cập nhật stock sản phẩm
  product.stock += qty;
  await Promise.all([stockMovement.save(), product.save()]);

  appLogger.info('Stock imported successfully', { productId, qty, userId });
  return stockMovement;
}

/**
 * Xuất kho sản phẩm (admin only)
 * @param stockData - Dữ liệu xuất kho (productId, qty, note)
 * @param userId - ID của user thực hiện
 * @returns Lịch sử xuất kho
 */
export async function exportStock(stockData: StockMovementRequestDto, userId: string) {
  const { productId, qty, note } = stockData;

  // Kiểm tra sản phẩm tồn tại
  const product = await Product.findById(productId);
  if (!product) {
    appLogger.warn('Product not found', { productId, userId });
    const error = new Error(MESSAGES.PRODUCT_NOT_FOUND);
    error.name = 'NotFoundError';
    (error as any).statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  // Kiểm tra đủ stock để xuất
  if (product.stock < qty) {
    appLogger.warn('Insufficient stock', { productId, stock: product.stock, requestedQty: qty, userId });
    const error = new Error('Insufficient stock');
    error.name = 'BadRequestError';
    (error as any).statusCode = STATUS_CODES.BAD_REQUEST;
    throw error;
  }

  // Tạo lịch sử xuất kho
  const stockMovement = new StockMovement({
    type: 'export',
    productId,
    qty,
    note,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Cập nhật stock sản phẩm
  product.stock -= qty;
  await Promise.all([stockMovement.save(), product.save()]);

  appLogger.info('Stock exported successfully', { productId, qty, userId });
  return stockMovement;
}

/**
 * Lấy danh sách lịch sử nhập/xuất kho với phân trang và lọc
 * @param page - Trang hiện tại
 * @param limit - Số lượng mỗi trang
 * @param productId - Lọc theo sản phẩm (tùy chọn)
 * @param type - Lọc theo loại ('import' hoặc 'export', tùy chọn)
 * @returns Danh sách lịch sử nhập/xuất kho
 */
export async function getStockMovements(page: number = 1, limit: number = 10, productId?: string, type?: 'import' | 'export') {
  const query: any = {};
  if (productId) {
    query.productId = productId;
  }
  if (type) {
    query.type = type;
  }

  const skip = (page - 1) * limit;
  const [movements, total] = await Promise.all([
    StockMovement.find(query).skip(skip).limit(limit).lean(),
    StockMovement.countDocuments(query),
  ]);

  appLogger.info('Stock movements retrieved successfully', { page, limit, total, productId, type });
  return { movements, total, page, limit };
}