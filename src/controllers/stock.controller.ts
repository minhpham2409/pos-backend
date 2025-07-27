import { Request, Response, NextFunction } from 'express';
import { importStock, exportStock, getStockMovements } from '../services/stock.service';
import { appLogger } from '../utils/logger';
import { STATUS_CODES } from '../utils/constants';
import { AuthRequest } from '../types';

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
export async function getStockMovementsController(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = '1', limit = '10', productId, type, createdAt } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const createdAtDate = createdAt ? new Date(createdAt as string) : undefined;

    const result = await getStockMovements(
      pageNum,
      limitNum,
      productId as string,
      type as 'import' | 'export',
      createdAtDate
    );

    res.status(STATUS_CODES.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    appLogger.error('Failed to retrieve stock movements', { error: (error as Error).message });
    next(error);
  }
}