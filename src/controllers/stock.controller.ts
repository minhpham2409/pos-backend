import { Request, Response, NextFunction } from 'express';
import { importStock, exportStock, getStockMovements } from '../services/stock.service';
import { appLogger } from '../utils/logger';
import { STATUS_CODES } from '../utils/constants';
import { AuthRequest } from '../types';

/**
 * Xử lý yêu cầu nhập kho sản phẩm (admin only)
 * @param req - Request chứa dữ liệu nhập kho
 * @param res - Response trả về lịch sử nhập kho
 * @param next - Chuyển lỗi đến middleware errorHandler
 */
export async function importStockController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stockData = req.body;
    const userId = req.user!.userId;

    const stockMovement = await importStock(stockData, userId);

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: stockMovement,
      message: 'Stock imported successfully',
    });
  } catch (error) {
    appLogger.error('Failed to import stock', { error: (error as Error).message });
    next(error);
  }
}

/**
 * Xử lý yêu cầu xuất kho sản phẩm (admin only)
 * @param req - Request chứa dữ liệu xuất kho
 * @param res - Response trả về lịch sử xuất kho
 * @param next - Chuyển lỗi đến middleware errorHandler
 */
export async function exportStockController(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const stockData = req.body;
    const userId = req.user!.userId;

    const stockMovement = await exportStock(stockData, userId);

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      data: stockMovement,
      message: 'Stock exported successfully',
    });
  } catch (error) {
    appLogger.error('Failed to export stock', { error: (error as Error).message });
    next(error);
  }
}

/**
 * Xử lý yêu cầu lấy danh sách lịch sử nhập/xuất kho
 * @param req - Request chứa query params (page, limit, productId, type)
 * @param res - Response trả về danh sách lịch sử
 * @param next - Chuyển lỗi đến middleware errorHandler
 */
export async function getStockMovementsController(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '10', productId, type } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const result = await getStockMovements(pageNum, limitNum, productId as string, type as 'import' | 'export');

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    appLogger.error('Failed to retrieve stock movements', { error: (error as Error).message });
    next(error);
  }
}