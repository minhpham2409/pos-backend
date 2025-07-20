// src/models/StockMovement.ts
import mongoose from "../config/database";
import { IStockMovement } from "../types";

const StockMovementSchema = new mongoose.Schema<IStockMovement>(
  {
    type: { type: String, enum: ["import", "export"], required: true },
    productId: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    note: { type: String },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Index cho productId để tăng tốc độ tìm kiếm
StockMovementSchema.index({ productId: 1 });

export default mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);