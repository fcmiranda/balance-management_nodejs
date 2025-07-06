// DTOs for API communication
export interface AccountDTO {
  id: number;
  userId: number;
  accountNumber: string;
  balance: number;
  accountType: 'savings' | 'checking';
  status: 'active' | 'inactive' | 'frozen';
}

export interface AccountDepositRequest {
  amount: number;
}

export interface AccountWithdrawRequest {
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
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'client';
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

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
