import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Logging utility that manages console output based on environment
 * In production builds, console.log calls are stripped out for performance
 * In development, all console methods work normally
 */
export const logger = {
  log: import.meta.env.PROD 
    ? () => {} 
    : console.log.bind(console),
  
  warn: import.meta.env.PROD 
    ? () => {} 
    : console.warn.bind(console),
  
  error: console.error.bind(console), // Always preserve errors
  
  info: import.meta.env.PROD 
    ? () => {} 
    : console.info.bind(console),
  
  debug: import.meta.env.PROD 
    ? () => {} 
    : console.debug.bind(console),
  
  group: import.meta.env.PROD 
    ? () => {} 
    : console.group.bind(console),
  
  groupCollapsed: import.meta.env.PROD 
    ? () => {} 
    : console.groupCollapsed.bind(console),
  
  groupEnd: import.meta.env.PROD 
    ? () => {} 
    : console.groupEnd.bind(console),
  
  table: import.meta.env.PROD 
    ? () => {} 
    : console.table.bind(console),
  
  time: import.meta.env.PROD 
    ? () => {} 
    : console.time.bind(console),
  
  timeEnd: import.meta.env.PROD 
    ? () => {} 
    : console.timeEnd.bind(console),
  
  trace: import.meta.env.PROD 
    ? () => {} 
    : console.trace.bind(console),
}

/**
 * Global console override configuration
 * This function should be called once at application startup
 * It replaces the global console object in production
 * Preserves console.error for critical error reporting
 */
export function configureConsole(): void {
  if (import.meta.env.PROD) {
    // In production, replace console methods with no-op functions
    // but preserve error logging for critical issues
    const noop = () => {};
    const originalError = console.error;
    
    (window as any).console = {
      ...console,
      log: noop,
      warn: noop,
      error: originalError, // Preserve error logging in production
      info: noop,
      debug: noop,
      group: noop,
      groupCollapsed: noop,
      groupEnd: noop,
      table: noop,
      time: noop,
      timeEnd: noop,
      trace: noop,
    };
  }
}