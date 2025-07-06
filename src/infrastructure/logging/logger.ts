// Logging interface following DIP
export interface ILogger {
  info(message: string, data?: any): void;
  error(message: string, error?: Error, data?: any): void;
  warn(message: string, data?: any): void;
  debug(message: string, data?: any): void;
}

// Console logger implementation
export class ConsoleLogger implements ILogger {
  info(message: string, data?: any): void {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  error(message: string, error?: Error, data?: any): void {
    console.error(
      `[ERROR] ${message}`,
      error?.stack || error?.message || '',
      data ? JSON.stringify(data, null, 2) : '',
    );
  }

  warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  debug(message: string, data?: any): void {
    console.debug(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
}

// Null logger for testing
export class NullLogger implements ILogger {
  info(message: string, data?: any): void {}
  error(message: string, error?: Error, data?: any): void {}
  warn(message: string, data?: any): void {}
  debug(message: string, data?: any): void {}
}
