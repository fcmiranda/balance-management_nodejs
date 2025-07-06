// Base use case interfaces following SOLID principles

// Generic use case interface for commands that return a response
export interface UseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

// For queries that don't need a request parameter
export interface QueryUseCase<TResponse> {
  execute(): Promise<TResponse>;
}

// For commands that need a request parameter
export interface CommandUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

// For commands that don't return a response (void)
export interface CommandUseCaseVoid<TRequest> {
  execute(request: TRequest): Promise<void>;
}

// For simple operations with basic parameters
export interface SimpleUseCase<TResponse> {
  execute(...args: any[]): Promise<TResponse>;
}

// For operations that don't return anything
export interface VoidUseCase {
  execute(...args: any[]): Promise<void>;
}
