import type { Logger, LoggingConfig, LoggerOptions } from '../types/logger';

/**
 * Environment-based logging configuration
 * This configuration manages console output behavior across different environments
 */

export const LOGGING_CONFIG: LoggingConfig = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  enableConsoleOverride: true,
  preserveErrors: true,
};

/**
 * Log levels for structured logging
 */
export const LogLevel = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  ALL: 5,
} as const;

export type LogLevelType = typeof LogLevel[keyof typeof LogLevel];

/**
 * Default logger options
 */
export const DEFAULT_LOGGER_OPTIONS: LoggerOptions = {
  preserveErrors: true,
  preserveWarnings: false,
  customLogLevel: LOGGING_CONFIG.isProduction ? 'error' : 'all',
};

/**
 * Create a logger instance with custom options
 */
export function createLogger(options: LoggerOptions = DEFAULT_LOGGER_OPTIONS): Logger {
  const shouldLog = (level: keyof typeof LogLevel): boolean => {
    if (LOGGING_CONFIG.isDevelopment) return true;
    
    const currentLevel = options.customLogLevel || 'error';
    
    switch (currentLevel) {
      case 'none':
        return false;
      case 'error':
        return level === 'ERROR';
      case 'warn':
        return ['ERROR', 'WARN'].includes(level);
      case 'info':
        return ['ERROR', 'WARN', 'INFO'].includes(level);
      case 'debug':
        return ['ERROR', 'WARN', 'INFO', 'DEBUG'].includes(level);
      case 'all':
        return true;
      default:
        return level === 'ERROR';
    }
  };

  return {
    log: shouldLog('INFO') ? console.log.bind(console) : () => {},
    warn: shouldLog('WARN') || options.preserveWarnings 
      ? console.warn.bind(console) : () => {},
    error: shouldLog('ERROR') || options.preserveErrors 
      ? console.error.bind(console) : () => {},
    info: shouldLog('INFO') ? console.info.bind(console) : () => {},
    debug: shouldLog('DEBUG') ? console.debug.bind(console) : () => {},
    group: shouldLog('DEBUG') ? console.group.bind(console) : () => {},
    groupCollapsed: shouldLog('DEBUG') ? console.groupCollapsed.bind(console) : () => {},
    groupEnd: shouldLog('DEBUG') ? console.groupEnd.bind(console) : () => {},
    table: shouldLog('DEBUG') ? console.table.bind(console) : () => {},
    time: shouldLog('DEBUG') ? console.time.bind(console) : () => {},
    timeEnd: shouldLog('DEBUG') ? console.timeEnd.bind(console) : () => {},
    trace: shouldLog('DEBUG') ? console.trace.bind(console) : () => {},
  };
}

/**
 * Performance monitoring for logging overhead
 */
export const logPerformance = {
  start: (label: string) => {
    if (LOGGING_CONFIG.isDevelopment) {
      performance.mark(`${label}-start`);
    }
  },
  end: (label: string) => {
    if (LOGGING_CONFIG.isDevelopment) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      const measure = performance.getEntriesByName(label)[0];
      console.log(`${label}: ${measure.duration.toFixed(2)}ms`);
    }
  },
};

/**
 * Environment detection utilities
 */
export const environment = {
  isDev: LOGGING_CONFIG.isDevelopment,
  isProd: LOGGING_CONFIG.isProduction,
  isTest: import.meta.env.MODE === 'test',
  mode: import.meta.env.MODE,
  
  // Get environment-specific logger
  getLogger: () => createLogger({
    preserveErrors: true,
    preserveWarnings: !LOGGING_CONFIG.isProduction,
    customLogLevel: LOGGING_CONFIG.isProduction ? 'error' : 'all',
  }),
};