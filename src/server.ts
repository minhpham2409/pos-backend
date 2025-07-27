import dotenv from 'dotenv';
import { config } from './config/environment';
import { connectDatabase, disconnectDatabase } from './config/database';
import { appLogger } from './utils/logger';
import app from './app';

dotenv.config();

const startServer = async () => {
  try {
    
    await connectDatabase({ autoIndex: config.nodeEnv !== 'production' });
    appLogger.info('Server connected to MongoDB', { uri: config.mongodbUri });

    
    const server = app.listen(config.port, () => {
      appLogger.info(`Server running on port ${config.port}`, { env: config.nodeEnv });
    });

   
    server.on('error', (error: NodeJS.ErrnoException) => {
      appLogger.error('Server error', { error: error.message });
      process.exit(1);
    });
  } catch (error) {
    appLogger.error('Failed to start server', { error: (error as Error).message });
    process.exit(1);
  }
};

// Xử lý khi process bị tắt (graceful shutdown)
process.on('SIGTERM', async () => {
  appLogger.info('SIGTERM received. Shutting down gracefully...');
  await disconnectDatabase();
  appLogger.info('MongoDB connection closed');
  process.exit(0);
});

// Xử lý khi Ctrl+C
process.on('SIGINT', async () => {
  appLogger.info('SIGINT received. Shutting down gracefully...');
  await disconnectDatabase();
  appLogger.info('MongoDB connection closed');
  process.exit(0);
});

startServer();