import  Product  from '../models/Product';
import  Order  from '../models/Order';
import  StockMovement  from '../models/StockMovement';
import { appLogger } from '../utils/logger';
import { STATUS_CODES, MESSAGES } from '../utils/constants';
import { IProduct, OrderRequestDto } from '../types';


export async function createOrder(orderData: OrderRequestDto, userId: string) {
  const { items } = orderData;
  let total = 0;
  const updatedProducts: IProduct[] = [];

  // Kiểm tra và cập nhật stock bằng atomic update
  for (const item of items) {
    if (item.qty <= 0) {
      appLogger.warn('Invalid quantity for item', { productId: item.productId, qty: item.qty, userId });
      const error = new Error('Invalid quantity for item');
      error.name = 'BadRequestError';
      (error as any).statusCode = STATUS_CODES.BAD_REQUEST;
      throw error;
    }

    // Dùng atomic update: giảm stock nếu còn đủ
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        stock: { $gte: item.qty } // điều kiện đủ hàng
      },
      {
        $inc: { stock: -item.qty } // atomic giảm stock
      },
      {
        new: true
      }
    );

    if (!updatedProduct) {
      appLogger.warn('Product not found or insufficient stock', { productId: item.productId, userId });
      const error = new Error(MESSAGES.PRODUCT_NOT_FOUND_OR_OUT_OF_STOCK || 'Product not found or not enough stock');
      error.name = 'NotFoundError';
      (error as any).statusCode = STATUS_CODES.NOT_FOUND;
      throw error;
    }

    // Lưu thông tin tên và giá vào order item
    item.name = updatedProduct.name;
    item.price = updatedProduct.price;
    total += item.qty * updatedProduct.price;
    updatedProducts.push(updatedProduct);
  }

  // Tạo đơn hàng
  const order = new Order({
    items,
    total,
    createdBy: userId,
    createdAt: new Date(),
  });

  // Tạo stock movement
  const stockMovements = items.map(item => {
    return new StockMovement({
      type: 'export',
      productId: item.productId,
      qty: item.qty,
      note: `Order ${order._id}`,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  // Lưu order và stock movements
  await Promise.all([
    order.save(),
    ...stockMovements.map(sm => sm.save()),
  ]);

  appLogger.info('Order created with atomic stock update', { orderId: order._id, userId });
  return order;
}


export async function getOrders(page: number = 1, limit: number = 10, userId?: string) {
  const query: any = {};
  if (userId) {
    query.createdBy = userId;
  }

  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(query).skip(skip).limit(limit).lean(),
    Order.countDocuments(query),
  ]);

  appLogger.info('Orders retrieved successfully', { page, limit, total, userId });
  return { orders, total, page, limit };
}


export async function getOrderById(orderId: string, userId: string, role: string) {
  const query: any = { _id: orderId };
  if (role !== 'admin') {
    query.createdBy = userId; 
  }

  const order = await Order.findOne(query).lean();
  if (!order) {
    appLogger.warn('Order not found', { orderId, userId });
    const error = new Error(MESSAGES.ORDER_NOT_FOUND);
    error.name = 'NotFoundError';
    (error as any).statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  appLogger.info('Order retrieved successfully', { orderId, userId });
  return order;
}