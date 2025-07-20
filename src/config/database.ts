// src/config/database.ts
import mongoose from "mongoose";
import { config } from "./environment"; // Import cấu hình từ environment.ts

// Interface để định nghĩa tùy chọn kết nối (tùy chọn)
interface MongooseOptions {
  autoIndex?: boolean; // Chỉ giữ autoIndex, loại bỏ các tùy chọn cũ
}

// Hàm khởi tạo kết nối
export const connectDatabase = async (options: MongooseOptions = { autoIndex: true }) => {
  try {
    // Kiểm tra nếu mongodbUri hợp lệ
    if (!config.mongodbUri) {
      throw new Error("MONGODB_URI is not defined in environment configuration");
    }

    // Kết nối tới MongoDB
    await mongoose.connect(config.mongodbUri, options);
    console.log("MongoDB connected successfully to", config.mongodbUri);

    // Xử lý sự kiện khi kết nối thành công
    mongoose.connection.on("connected", () => {
      console.log("MongoDB connection established");
    });

    // Xử lý ngắt kết nối
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    // Xử lý lỗi kết nối
    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};

// Ngắt kết nối khi ứng dụng dừng
export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
};

// Export mongoose để sử dụng model
export default mongoose;