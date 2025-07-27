import  Product  from '../models/Product';
import  Order  from '../models/Order';
import  StockMovement  from '../models/StockMovement';
import { appLogger } from '../utils/logger';
import { STATUS_CODES, MESSAGES } from '../utils/constants';
import { OrderRequestDto } from '../types';

export async function createOrder(orderData: OrderRequestDto, userId: string) {
  const { items } = orderData;

  // Kiểm tra sản phẩm tồn tại và đủ stock
  const productIds = items.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== items.length) {
    appLogger.warn('One or more products not found', { productIds, userId });
    const error = new Error(MESSAGES.PRODUCT_NOT_FOUND);
    error.name = 'NotFoundError';
    (error as any).statusCode = STATUS_CODES.NOT_FOUND;
    throw error;
  }

  // Kiểm tra stock và tính tổng tiền
  let total = 0;
  for (const item of items) {
    const product = products.find(p => p._id.toString() === item.productId);
    if (!product) {
      appLogger.warn('Product not found for item', { productId: item.productId, userId });
      const error = new Error(MESSAGES.PRODUCT_NOT_FOUND);
      error.name = 'NotFoundError';
      (error as any).statusCode = STATUS_CODES.NOT_FOUND;
      throw error;
    }
    if (product.stock < item.qty) {
      appLogger.warn('Insufficient stock for product', {
        productId: item.productId,
        stock: product.stock,
        requestedQty: item.qty,
        userId,
      });
      const error = new Error('Insufficient stock');
      error.name = 'BadRequestError';
      (error as any).statusCode = STATUS_CODES.BAD_REQUEST;
      throw error;
    }
    total += item.qty * product.price;
    item.name = product.name; // Lưu tên sản phẩm vào đơn hàng
    item.price = product.price; // Lưu giá sản phẩm vào đơn hàng
  }

  // Tạo đơn hàng
  const order = new Order({
    items,
    total,
    createdBy: userId,
    createdAt: new Date(),
  });

  // Tạo StockMovement và cập nhật stock
  const stockMovements = items.map(item => {
    const product = products.find(p => p._id.toString() === item.productId)!;
    product.stock -= item.qty; // Giảm stock
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

  // Lưu đồng thời order, products, và stock movements
  await Promise.all([
    order.save(),
    ...products.map(p => p.save()),
    ...stockMovements.map(sm => sm.save()),
  ]);

  appLogger.info('Order created successfully', { orderId: order._id, userId });
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
    query.createdBy = userId; // Cashier chỉ thấy đơn của mình
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