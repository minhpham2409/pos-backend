import { Document } from "mongoose";
import { Request } from "express";
export interface IUser extends Document{
    username : string;
    passwordHash : string;
    email : string;
    role :  "admin" | "user";
    createdAt : Date;
    updatedAt : Date;
}

export interface IProduct extends Document {
    name: string;
    sku: string;
    price: number;
    stock: number;
    unit: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrderItem extends Document {
    productId: string;
    name: string;
    qty: number;
    price: number;
}

export interface IOrder extends Document {
    items : IOrderItem[];
    total : number;
    createdBy: string; 
    createdAt: Date;
}

export interface IStockMovement extends Document {
  type: "import" | "export";
  productId: string;
  qty: number;
  note?: string;
  createdBy: string;
  createdAt: Date;
    updatedAt: Date;
}
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}
export interface AuthRequestDto{
    email: string;
    password: string;
    
}

export interface ProductRequestDto {
    name : string;
    sku : string;
    price : number;
    stock : number;
    unit : string;
}
export interface OrderRequestDto {
    items: IOrderItem[];
}

export interface StockMovementRequestDto {
    type: "import" | "export";
    productId: string;
    qty: number;
    note?: string;
}

export interface CustomRequest<T> extends Request {
    body : T;
}

export type ApiResponse<T> = {
    success: boolean;
    data?: T;
    error?: string | string[];
}

export interface AuthPayload {
    id : string;
    role: "admin" | "cashier";
    iat?: number;
    exp?: number;
}

export interface ValidationError {
    field: string;
    message: string;
}

export enum StokeMovementType {
    IMPORT = "import",
    EXPORT = "export"
}

export type Role = "admin" | "cashier";