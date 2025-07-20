import morgan from 'morgan';
import { createWriteStream } from 'fs';
import { config } from '../config/environment';

// Cấu hình Morgan để ghi log HTTP
const morganFormat = config.nodeEnv === 'production' ? 'combined' : 'dev';

// Logger cho HTTP requests (console trong dev, file trong production)
export const httpLogger = morgan(morganFormat);

// Ghi log ra file trong môi trường production
const accessLogStream = createWriteStream('access.log', { flags: 'a' });
export const fileLogger = morgan(morganFormat, { stream: accessLogStream });

// Logger tùy chỉnh cho các sự kiện ứng dụng
export const appLogger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
  },
};