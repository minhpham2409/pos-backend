import { Request, Response, NextFunction } from 'express';
import  Product  from '../models/Product';
import { appLogger } from '../utils/logger';
import { STATUS_CODES, MESSAGES } from '../utils/constants';
import { AuthRequest, ProductRequestDto } from '../types';

/**
 * Lấy danh sách sản phẩm với phân trang và lọc
 * @param req - Request chứa query params (page, limit, search)
 * @param res - Response trả về danh sách sản phẩm
 * @param next - Chuyển lỗi đến middleware errorHandler
 */export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '10', name, sku } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const query: any = {};
    if (name) {
      query.name = { $regex: name, $options: 'i' }; // Tìm kiếm theo tên, không phân biệt hoa thường
    }
    if (sku) {
      query.sku = { $regex: sku, $options: 'i' }; // Tìm kiếm theo SKU
    }

    const skip = (pageNum - 1) * limitNum;
    const [products, total] = await Promise.all([
      Product.find(query).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    appLogger.info('Products retrieved successfully', { page: pageNum, limit: limitNum, total, name, sku });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: { products, total, page: pageNum, limit: limitNum },
    });
  } catch (error) {
    appLogger.error('Failed to retrieve products', { error: (error as Error).message });
    next(error);
  }
}

/**
 * Thêm sản phẩm mới (admin only)
 * @param req - Request chứa dữ liệu sản phẩm
 * @param res - Response trả về sản phẩm vừa tạo
 * @param next - Chuyển lỗi đến middleware errorHandler
 */
export async function createProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const productData: ProductRequestDto = req.body;
    const { name, sku, price, stock, unit, description } = productData;
    const userId = req.user!.userId;

    // Kiểm tra SKU trùng lặp
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      appLogger.warn('Product with SKU already exists', { sku, userId });
      const error = new Error('SKU already exists');
      error.name = 'ConflictError';
      (error as any).statusCode = STATUS_CODES.CONFLICT;
      throw error;
    }

    const product = new Product({
      name,
      sku,
      price,
      stock,
      unit,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await product.save();

    appLogger.info('Product created successfully', { productId: product._id, userId });
    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    appLogger.error('Failed to create product', { error: (error as Error).message, userId: req.user?.userId });
    next(error);
  }
}

/**
 * Cập nhật sản phẩm (admin only)
 * @param req - Request chứa ID sản phẩm và dữ liệu cập nhật
 * @param res - Response trả về sản phẩm đã cập nhật
 * @param next - Chuyển lỗi đến middleware errorHandler
 */
export async function updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const productData: Partial<ProductRequestDto> = req.body;
    const userId = req.user!.userId;

    const product = await Product.findById(id);
    if (!product) {
      appLogger.warn('Product not found', { productId: id, userId });
      const error = new Error(MESSAGES.PRODUCT_NOT_FOUND);
      error.name = 'NotFoundError';
      (error as any).statusCode = STATUS_CODES.NOT_FOUND;
      throw error;
    }

    // Kiểm tra SKU trùng lặp (nếu cập nhật SKU)
    if (productData.sku && productData.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: productData.sku });
      if (existingProduct) {
        appLogger.warn('Product with SKU already exists', { sku: productData.sku, userId });
        const error = new Error('SKU already exists');
        error.name = 'ConflictError';
        (error as any).statusCode = STATUS_CODES.CONFLICT;
        throw error;
      }
    }

    Object.assign(product, { ...productData, updatedAt: new Date() });
    await product.save();

    appLogger.info('Product updated successfully', { productId: id, userId });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: product,
      message: 'Product updated successfully',
    });
  } catch (error) {
    appLogger.error('Failed to update product', { error: (error as Error).message, productId: req.params.id, userId: req.user?.userId });
    next(error);
  }
}

/**
 * Xóa sản phẩm (admin only)
 * @param req - Request chứa ID sản phẩm
 * @param res - Response trả về thông báo xóa thành công
 * @param next - Chuyển lỗi đến middleware errorHandler
 */
export async function deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id;
    const userId = req.user!.userId;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      appLogger.warn('Product not found', { productId: id, userId });
      const error = new Error(MESSAGES.PRODUCT_NOT_FOUND);
      error.name = 'NotFoundError';
      (error as any).statusCode = STATUS_CODES.NOT_FOUND;
      throw error;
    }

    appLogger.info('Product deleted successfully', { productId: id, userId });
    res.status(STATUS_CODES.OK).json({
      success: true,
      data: { message: 'Product deleted successfully' },
      message: 'Product deleted successfully',
    });
  } catch (error) {
    appLogger.error('Failed to delete product', { error: (error as Error).message, productId: req.params.id, userId: req.user?.userId });
    next(error);
  }
}