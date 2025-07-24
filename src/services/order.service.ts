// import mongoose, { ClientSession } from 'mongoose';
// import  Order  from '../models/Order';
// import  Product  from '../models/Product';
// import  StockMovement  from '../models/StockMovement';
// import { appLogger } from '../utils/logger';
// import { STATUS_CODES, MESSAGES } from '../utils/constants';
// import { OrderRequestDto, IOrder, IOrderItem } from '../types';
// import { withTransaction } from '../utils/database';

// export class OrderService {
//   /**
//    * Creates a new order, validates stock, updates product stock, and logs stock movement.
//    * @param orderData - The order data including items.
//    * @param userId - The ID of the user creating the order.
//    * @returns The created order.
//    */
//   static async createOrder(orderData: OrderRequestDto, userId: string): Promise<IOrder> {
//     return withTransaction(async (session: ClientSession) => {
//       try {
//         const { items } = orderData;

//         // Validate and fetch products
//         const productIds = items.map(item => item.productId);
//         const products = await Product.find({ _id: { $in: productIds } }).session(session);

//         if (products.length !== items.length) {
//           appLogger.warn('Some products not found', { productIds });
//           const error = new Error(MESSAGES.PRODUCT_NOT_FOUND);
//           error.name = 'NotFoundError';
//           (error as any).statusCode = STATUS_CODES.NOT_FOUND;
//           throw error;
//         }

//         // Validate stock availability
//         for (const item of items) {
//           const product = products.find(p => p._id.toString() === item.productId);
//           if (!product) {
//             appLogger.warn('Product not found', { productId: item.productId });
//             const error = new Error(MESSAGES.PRODUCT_NOT_FOUND);
//             error.name = 'NotFoundError';
//             (error as any).statusCode = STATUS_CODES.NOT_FOUND;
//             throw error;
//           }
//           if (product.stock < item.qty) {
//             appLogger.warn('Insufficient stock', { productId: item.productId, stock: product.stock, requested: item.qty });
//             const error = new Error(MESSAGES.INVALID_STOCK);
//             error.name = 'InvalidStockError';
//             (error as any).statusCode = STATUS_CODES.BAD_REQUEST;
//             throw error;
//           }
//         }

//         // Prepare order items with product details
//         const orderItems: IOrderItem[] = items.map(item => {
//           const product = products.find(p => p._id.toString() === item.productId)!;
//           return {
//             productId: item.productId,
//             name: product.name,
//             qty: item.qty,
//             price: product.price,
//           };
//         });

//         // Calculate total
//         const total = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);

//         // Create order
//         const order = new Order({
//           items: orderItems,
//           total,
//           createdBy: userId,
//         });

//         // Update product stock and create stock movements
//         for (const item of orderItems) {
//           const product = products.find(p => p._id.toString() === item.productId)!;
//           product.stock -= item.qty;
//           await product.save({ session });

//           const stockMovement = new StockMovement({
//             type: 'export',
//             productId: item.productId,
//             qty: item.qty,
//             note: `Order ${order._id}`,
//             createdBy: userId,
//           });
//           await stockMovement.save({ session });
//         }

//         // Save order
//         await order.save({ session });

//         appLogger.info('Order created successfully', { orderId: order._id, userId });
//         return order;
//       } catch (error) {
//         appLogger.error('Failed to create order', { error: (error as Error).message, userId });
//         throw error;
//       }
//     });
//   }

//   /**
//    * Retrieves a paginated list of orders with optional filtering.
//    * @param page - The page number.
//    * @param limit - Number of orders per page.
//    * @param startDate - Optional start date filter.
//    * @param endDate - Optional end date filter.
//    * @returns Paginated list of orders.
//    */
//   static async getOrders(page: number = 1, limit: number = 10, startDate?: Date, endDate?: Date): Promise<{
//     orders: IOrder[];
//     total: number;
//     page: number;
//     limit: number;
//   }> {
//     try {
//       const query: any = {};
//       if (startDate && endDate) {
//         query.createdAt = { $gte: startDate, $lte: endDate };
//       }

//       const skip = (page - 1) * limit;
//       const [orders, total] = await Promise.all([
//         Order.find(query).skip(skip).limit(limit).lean(),
//         Order.countDocuments(query),
//       ]);

//       appLogger.info('Orders retrieved successfully', { page, limit, total });
//       return { orders, total, page, limit };
//     } catch (error) {
//       appLogger.error('Failed to retrieve orders', { error: (error as Error).message });
//       const err = new Error(MESSAGES.SERVER_ERROR);
//       err.name = 'ServerError';
//       (err as any).statusCode = STATUS_CODES.SERVER_ERROR;
//       throw err;
//     }
//   }

//   /**
//    * Retrieves details of a specific order by ID.
//    * @param orderId - The ID of the order.
//    * @returns The order details.
//    */
//   static async getOrderById(orderId: string): Promise<IOrder> {
//     try {
//       const order = await Order.findById(orderId).lean();
//       if (!order) {
//         appLogger.warn('Order not found', { orderId });
//         const error = new Error(MESSAGES.NOT_FOUND);
//         error.name = 'NotFoundError';
//         (error as any).statusCode = STATUS_CODES.NOT_FOUND;
//         throw error;
//       }

//       appLogger.info('Order retrieved successfully', { orderId });
//       return order;
//     } catch (error) {
//       appLogger.error('Failed to retrieve order', { error: (error as Error).message, orderId });
//       throw error;
//     }
//   }
// }