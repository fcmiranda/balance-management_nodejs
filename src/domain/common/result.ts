export abstract class Result<T, E = Error> {
  abstract isSuccess(): boolean;
  abstract isFailure(): boolean;
  abstract getValue(): T;
  abstract getError(): E;

  static success<T, E = Error>(value: T): Result<T, E> {
    return new SuccessResult(value);
  }

  static failure<T, E = Error>(error: E): Result<T, E> {
    return new FailureResult(error);
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isSuccess()) {
      return Result.success(fn(this.getValue()));
    }
    return Result.failure(this.getError());
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isSuccess()) {
      return fn(this.getValue());
    }
    return Result.failure(this.getError());
  }

  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isFailure()) {
      return Result.failure(fn(this.getError()));
    }
    return Result.success(this.getValue());
  }
}

class SuccessResult<T, E = Error> extends Result<T, E> {
  constructor(private readonly value: T) {
    super();
  }

  isSuccess(): boolean {
    return true;
  }

  isFailure(): boolean {
    return false;
  }

  getValue(): T {
    return this.value;
  }

  getError(): E {
    throw new Error('Cannot get error from success result');
  }
}

class FailureResult<T, E = Error> extends Result<T, E> {
  constructor(private readonly error: E) {
    super();
  }

  isSuccess(): boolean {
    return false;
  }

  isFailure(): boolean {
    return true;
  }

  getValue(): T {
    throw new Error('Cannot get value from failure result');
  }

  getError(): E {
    return this.error;
  }
}
