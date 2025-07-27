import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { config } from '../config/environment';
import { appLogger } from '../utils/logger';
import { MESSAGES, STATUS_CODES } from '../utils/constants';
import { AuthRequestDto } from '../types';

// Danh sách đen để lưu token đã logout
const tokenBlacklist: Set<string> = new Set();

export const login = async (dto: AuthRequestDto) => {
  const { email, password } = dto;
  const user = await User.findOne({ email });
  if (!user) {
    appLogger.warn('Invalid credentials', { email });
    const error = new Error(MESSAGES.UNAUTHORIZED);
    error.name = 'UnauthorizedError';
    (error as any).statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    appLogger.warn('Invalid credentials', { email });
    const error = new Error(MESSAGES.UNAUTHORIZED);
    error.name = 'UnauthorizedError';
    (error as any).statusCode = STATUS_CODES.UNAUTHORIZED;
    throw error;
  }

  const token = jwt.sign({ userId: user._id.toString(), role: user.role }, config.jwtSecret, {
    expiresIn: '1h',
  });

  appLogger.info('Login successful', { userId: user._id, role: user.role });
  return { token, user: { id: user._id, email: user.email, role: user.role } };
};

export const register = async (dto: AuthRequestDto & { username: string; role?: 'admin' | 'user' }) => {
  const { email, password, username, role = 'user' } = dto;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    appLogger.warn('User already exists', { email, username });
    const error = new Error(MESSAGES.USER_EXISTS);
    error.name = 'ConflictError';
    (error as any).statusCode = STATUS_CODES.CONFLICT;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

  const user = new User({
    username,
    email,
    passwordHash,
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await user.save();
  const savedUser = await User.findById(user._id);
  if (!savedUser) {
    appLogger.error('Failed to save user to database', { email, username });
    const error = new Error(MESSAGES.SERVER_ERROR);
    error.name = 'ServerError';
    (error as any).statusCode = STATUS_CODES.SERVER_ERROR;
    throw error;
  }

  const token = jwt.sign({ userId: user._id.toString(), role: user.role }, config.jwtSecret, {
    expiresIn: '1h',
  });

  appLogger.info('User registered successfully', { userId: user._id, role: user.role });
  return { token, user: { id: user._id, email: user.email, username: user.username, role: user.role } };
};

export const logout = async (token: string, userId: string) => {
  try {
    tokenBlacklist.add(token);
    appLogger.info('Logout successful', { userId });
    return { message: MESSAGES.LOGOUT_SUCCESS };
  } catch (error) {
    appLogger.error('Logout failed', { userId, error: (error as Error).message });
    const err = new Error(MESSAGES.SERVER_ERROR);
    err.name = 'ServerError';
    (err as any).statusCode = STATUS_CODES.SERVER_ERROR;
    throw err;
  }
};

export const getAllUsers = async () => {
  const users = await User.find().select('-passwordHash').lean();
  appLogger.info('Retrieved all users', { count: users.length });
  return users;
};

export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};