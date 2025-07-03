export interface Cliente {
    id?: number;
    nome: string;
    email: string;
    saldo: number;
}

export interface CreateClienteRequest {
    nome: string;
    email: string;
}

export interface UpdateClienteRequest {
    nome: string;
    email: string;
}

export interface DepositRequest {
    valor: number;
}

export interface WithdrawalRequest {
    valor: number;
}

export interface ErrorResponse {
    error: string;
}
