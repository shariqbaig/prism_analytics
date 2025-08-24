/**
 * Logger type definitions for environment-aware console management
 */

export interface Logger {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  group: (...args: any[]) => void;
  groupCollapsed: (...args: any[]) => void;
  groupEnd: () => void;
  table: (data: any) => void;
  time: (label?: string) => void;
  timeEnd: (label?: string) => void;
  trace: (...args: any[]) => void;
}

/**
 * Environment configuration for logging
 */
export interface LoggingConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  enableConsoleOverride: boolean;
  preserveErrors: boolean;
}

/**
 * Logger options for configuration
 */
export interface LoggerOptions {
  preserveErrors?: boolean;
  preserveWarnings?: boolean;
  customLogLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug' | 'all';
}