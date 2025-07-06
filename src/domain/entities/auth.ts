import { z } from 'zod';

// User Entity for authentication
export interface User {
  id: number;
  email: string;
  password: string;
  role: 'admin' | 'client';
  createdAt: Date;
  updatedAt: Date;
}

// JWT Payload
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
    email: string;
    role: string;
  };
}
