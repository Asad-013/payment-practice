// services/logger.ts

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export class Logger {
  private static formatMessage(level: LogLevel, message: string, context?: any): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  static info(message: string, context?: any) {
    console.log(this.formatMessage('info', message, context));
  }

  static warn(message: string, context?: any) {
    console.warn(this.formatMessage('warn', message, context));
  }

  static error(message: string, error?: any, context?: any) {
    const errorDetails = error ? ` | Error: ${error.message || error}` : '';
    console.error(this.formatMessage('error', message, context) + errorDetails);
  }

  static debug(message: string, context?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage('debug', message, context));
    }
  }
}
