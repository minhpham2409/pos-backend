import  Product  from '../models/Product';
import  StockMovement  from '../models/StockMovement';
import { appLogger } from '../utils/logger';
import { STATUS_CODES, MESSAGES } from '../utils/constants';
import { StockMovementRequestDto } from '../types';

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


export async function getStockMovements(
  page: number = 1,
  limit: number = 10,
  productId?: string,
  type?: 'import' | 'export',
  createdAt?: Date
) {
  const query: any = {};

  if (productId) {
    query.productId = productId;
  }
  if (type) {
    query.type = type;
  }
  if (createdAt) {
    const startOfDay = new Date(createdAt);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(createdAt);
    endOfDay.setHours(23, 59, 59, 999);

    query.createdAt = { $gte: startOfDay, $lte: endOfDay };
  }

  const skip = (page - 1) * limit;
  const [movements, total] = await Promise.all([
    StockMovement.find(query).skip(skip).limit(limit).lean(),
    StockMovement.countDocuments(query),
  ]);

  appLogger.info('Stock movements retrieved successfully', { page, limit, total, productId, type, createdAt });
  return { movements, total, page, limit };
}
