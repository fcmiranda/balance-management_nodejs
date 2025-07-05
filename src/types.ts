export interface Client {
    id?: number;
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
