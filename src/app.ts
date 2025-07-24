import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes';
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

// Error Handler
app.use(errorHandler);

export default app;