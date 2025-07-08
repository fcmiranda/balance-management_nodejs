export interface ILogger {
  info(message: string, data?: unknown): void;
  error(message: string, error?: Error, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  debug(message: string, data?: unknown): void;
}

export class ConsoleLogger implements ILogger {
  info(message: string, data?: unknown): void {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  error(message: string, error?: Error, data?: unknown): void {
    console.error(
      `[ERROR] ${message}`,
      error?.stack || error?.message || '',
      data ? JSON.stringify(data, null, 2) : '',
    );
  }

  warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  debug(message: string, data?: unknown): void {
    console.debug(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

export class NullLogger implements ILogger {
  info(_message: string, _data?: unknown): void {}
  error(_message: string, _error?: Error, _data?: unknown): void {}
  warn(_message: string, _data?: unknown): void {}
  debug(_message: string, _data?: unknown): void {}
}
