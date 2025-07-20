// src/models/Product.ts
import mongoose from "../config/database";
import { IProduct } from "../types";

const ProductSchema = new mongoose.Schema<IProduct>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Index cho sku để tăng tốc độ tìm kiếm
ProductSchema.index({ sku: 1 });

export default mongoose.model<IProduct>("Product", ProductSchema);