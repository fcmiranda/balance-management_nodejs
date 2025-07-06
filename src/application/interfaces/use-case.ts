export interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

export interface QueryUseCase<TResponse> {
  execute(): Promise<TResponse>;
}

export interface CommandUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

export interface CommandUseCaseVoid<TRequest> {
  execute(request: TRequest): Promise<void>;
}
