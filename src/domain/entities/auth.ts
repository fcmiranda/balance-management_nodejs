import { z } from 'zod';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'client';
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}
