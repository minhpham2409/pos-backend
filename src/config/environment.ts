// src/config/environment.ts
import dotenv from "dotenv";

dotenv.config(); // Đọc file .env

export interface EnvironmentConfig {
  nodeEnv: "development" | "production" | "test";
  port: number;
  mongodbUri: string;
  sessionSecret: string;
  jwtSecret: string;
  bcryptRounds: number;
}

export const config: EnvironmentConfig = {
  nodeEnv: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/pos_db",
  sessionSecret: process.env.SESSION_SECRET || "your-super-secret-key",
  jwtSecret: process.env.JWT_SECRET || "your-jwt-secret",
  bcryptRounds: process.env.BCRYPT_ROUNDS ? parseInt(process.env.BCRYPT_ROUNDS, 10) : 12,
};

// Validation
const requiredEnvVars = ["mongodbUri", "sessionSecret", "jwtSecret"];
requiredEnvVars.forEach((varName) => {
  if (!config[varName as keyof EnvironmentConfig]) {
    throw new Error(`${varName} is required in .env`);
  }
});

// Kiểm tra giá trị hợp lệ
if (config.port <= 0 || config.port > 65535) {
  throw new Error("PORT must be a valid port number (1-65535)");
}

if (config.bcryptRounds <= 0) {
  throw new Error("BCRYPT_ROUNDS must be a positive number");
}