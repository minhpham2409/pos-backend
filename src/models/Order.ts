// src/models/Order.ts
import mongoose from "../config/database";
import { IOrder, IOrderItem } from "../types";

const OrderItemSchema = new mongoose.Schema<IOrderItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const OrderSchema = new mongoose.Schema<IOrder>(
  {
    items: [OrderItemSchema],
    total: { type: Number, required: true, min: 0 },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    
  },
  {
    timestamps: true,
  }
);

// Middleware để tính total trước khi lưu (tùy chọn)
OrderSchema.pre<IOrder>("save", function (next) {
  this.total = this.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  next();
});

export default mongoose.model<IOrder>("Order", OrderSchema);