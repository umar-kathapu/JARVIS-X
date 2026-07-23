export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private scope: string;

  constructor(scope: string) {
    this.scope = scope;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.scope}]: ${message}`;
  }

  public debug(message: string, ...meta: unknown[]): void {
    console.debug(this.formatMessage('debug', message), ...meta);
  }

  public info(message: string, ...meta: unknown[]): void {
    console.info(this.formatMessage('info', message), ...meta);
  }

  public warn(message: string, ...meta: unknown[]): void {
    console.warn(this.formatMessage('warn', message), ...meta);
  }

  public error(message: string, ...meta: unknown[]): void {
    console.error(this.formatMessage('error', message), ...meta);
  }
}

export const createLogger = (scope: string): Logger => new Logger(scope);
