// DTOs for API communication
export interface ClientDTO {
  id: number;
  name: string;
  email: string;
  balance: number;
}

export interface CreateClientRequest {
  name: string;
  email: string;
}

export interface UpdateClientRequest {
  name: string;
  email: string;
}

export interface DepositRequest {
  amount: number;
}

export interface WithdrawalRequest {
  amount: number;
}

export interface ErrorResponse {
  error: string;
}

// Authentication DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: 'admin' | 'client';
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
