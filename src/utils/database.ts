import mongoose, { ClientSession } from 'mongoose';
import { appLogger } from './logger';

// Kiểm tra trạng thái kết nối
export const isConnected = (): boolean => {
  return mongoose.connection.readyState === 1; // 1 = connected
};

// Thực hiện transaction
export const withTransaction = async <T>(fn: (session: ClientSession) => Promise<T>): Promise<T> => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await fn(session);
    await session.commitTransaction();
    appLogger.info('Transaction committed successfully');
    return result;
  } catch (error) {
    await session.abortTransaction();
    appLogger.error('Transaction failed', { error: (error as Error).message });
    throw error;
  } finally {
    session.endSession();
  }
};

// Seed dữ liệu mẫu (gọi từ scripts/seed.ts)
export const seedInitialData = async () => {
  try {
    appLogger.info('Seeding initial data...');
    // Placeholder: Logic seed sẽ được triển khai trong scripts/seed.ts
  } catch (error) {
    appLogger.error('Failed to seed data', { error: (error as Error).message });
    throw error;
  }
};

// Xóa dữ liệu (dùng trong test)
export const clearDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    appLogger.info('Database cleared successfully');
  } catch (error) {
    appLogger.error('Failed to clear database', { error: (error as Error).message });
    throw error;
  }
};