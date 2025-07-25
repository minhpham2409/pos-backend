import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { stockRouter } from './routes/stock.routes';
import { authRouter } from './routes/auth.routes';
import { productRouter } from './routes/product.routes';
import {orderRouter} from './routes/order.routes';
import  errorHandler  from './middlewares/errorHandler';
import { appLogger } from './utils/logger';

const app = express();

// Middleware
app.use(helmet()); // Bảo mật header HTTP
app.use(cors({ credentials: true, origin: 'http://localhost:3000' })); // Cho phép cookie cross-origin
app.use(cookieParser()); // Parse cookie
app.use(
  morgan('dev', {
    stream: {
      write: (message: string) => appLogger.info(message.trim()),
    },
  })
); // Ghi log HTTP
app.use(express.json()); // Parse JSON body

// Routes
app.use('/api/auth', authRouter); // Route xác thực
app.use('/api/products',productRouter); // Route sản phẩm
app.use('/api/stock', stockRouter); // Route quản lý kho
app.use('/api/orders', orderRouter); // Route quản lý đơn hàng

// Error Handler
app.use(errorHandler);

export default app;