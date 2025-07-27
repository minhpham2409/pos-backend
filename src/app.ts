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


app.use(helmet()); 
app.use(cors({ credentials: true, origin: 'http://localhost:3000' })); 
app.use(cookieParser());
app.use(
  morgan('dev', {
    stream: {
      write: (message: string) => appLogger.info(message.trim()),
    },
  })
); 
app.use(express.json()); 


app.use('/api/auth', authRouter); 
app.use('/api/products',productRouter); 
app.use('/api/stock', stockRouter); 
app.use('/api/orders', orderRouter); 


app.use(errorHandler);

export default app;