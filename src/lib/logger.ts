/**
 * Application Logger
 * 
 * A professional logging utility that adapts to the execution environment.
 * - Development: All logs (DEBUG, INFO, WARN, ERROR) are printed with colors.
 * - Production: Only INFO, WARN, and ERROR are printed.
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const LOG_THRESHOLD = IS_PRODUCTION ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

class Logger {
  private namespace: string;

  constructor(namespace: string = 'APP') {
    this.namespace = namespace.toUpperCase();
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_THRESHOLD;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${this.namespace}] ${message}`;
  }

  debug(message: string, ...args: unknown[]) {
    if (this.shouldLog('DEBUG')) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]) {
    if (this.shouldLog('INFO')) {
      console.info(this.formatMessage('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]) {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]) {
    if (this.shouldLog('ERROR')) {
      console.error(this.formatMessage('ERROR', message), ...args);
    }
  }

  /**
   * Create a sub-logger with a specific namespace
   */
  static create(namespace: string): Logger {
    return new Logger(namespace);
  }
}

// Default export as a global logger
export const logger = new Logger();

// Expert export for creating namespaced loggers
export default Logger;
