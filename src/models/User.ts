// src/models/User.ts
import mongoose from "../config/database";
import { IUser } from "../types";

const UserSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["admin", "user"], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Tự động quản lý createdAt và updatedAt
  }
);


export default mongoose.model<IUser>("User", UserSchema);