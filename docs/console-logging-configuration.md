# Console Logging Configuration

This document describes the console logging configuration implemented for the Prism Analytics project, which manages console output based on the environment (development vs production).

## Overview

The logging configuration provides a comprehensive system to:
- **Disable console.log statements in production** for better performance and cleaner production logs
- **Preserve error logging** in all environments for critical issue tracking
- **Provide flexible logging utilities** for development debugging
- **Integrate seamlessly with Vite build system** for automatic environment detection

## Implementation Details

### 1. Core Configuration Files

#### `src/lib/utils.ts`
Contains the main logging utilities:
- `logger` object with environment-aware console methods
- `configureConsole()` function for global console override

#### `src/config/logging.ts`
Advanced logging configuration with:
- Environment detection utilities
- Custom logger creation with options
- Performance monitoring helpers

#### `src/types/logger.ts`
TypeScript definitions for proper type safety

### 2. Environment Detection

The system uses Vite's built-in environment variables:
- `import.meta.env.DEV` - Development mode detection
- `import.meta.env.PROD` - Production mode detection
- `import.meta.env.MODE` - Current build mode

### 3. Console Method Behavior

| Method | Development | Production | Notes |
|--------|------------|------------|-------|
| `console.log` | ✅ Enabled | ❌ Disabled | Standard logging |
| `console.warn` | ✅ Enabled | ❌ Disabled | Warning messages |
| `console.error` | ✅ Enabled | ✅ **Enabled** | **Always preserved** |
| `console.info` | ✅ Enabled | ❌ Disabled | Informational |
| `console.debug` | ✅ Enabled | ❌ Disabled | Debug output |
| `logger.*` | Environment-aware | Custom behavior | Recommended approach |

## Usage Guide

### 1. Basic Usage

```typescript
import { logger } from '@/lib/utils';

// Use logger instead of console for environment-aware logging
logger.log('This will only appear in development');
logger.warn('This warning is hidden in production');
logger.error('This error ALWAYS appears'); // Critical errors
logger.debug('Debug info for development only');
```

### 2. Advanced Usage

```typescript
import { createLogger, environment } from '@/config/logging';

// Create custom logger with specific options
const customLogger = createLogger({
  preserveErrors: true,
  preserveWarnings: true,
  customLogLevel: 'warn' // Only show warnings and errors
});

// Environment-specific code
if (environment.isDev) {
  console.log('Development-only code');
}

// Performance monitoring
environment.logPerformance.start('data-processing');
// ... your code ...
environment.logPerformance.end('data-processing');
```

### 3. Direct Console Usage

```typescript
// These work as normal in development
console.log('Development message'); // Hidden in production
console.warn('Warning message');    // Hidden in production
console.error('Error message');     // ALWAYS visible
```

## Integration with Build System

### Vite Configuration

The `vite.config.ts` includes additional console removal during build:

```typescript
define: {
  // Remove console.log in production builds for additional safety
  ...(process.env.NODE_ENV === 'production' ? {
    'console.log': '(() => {})',
    'console.debug': '(() => {})',
    'console.info': '(() => {})',
  } : {}),
}
```

### Application Initialization

The main entry point (`src/main.tsx`) initializes the console configuration:

```typescript
import { configureConsole } from './lib/utils';

// Configure console logging based on environment
configureConsole();
```

## Best Practices

### 1. Use Logger Utility

**Recommended:**
```typescript
import { logger } from '@/lib/utils';
logger.log('User action completed');
```

**Not recommended:**
```typescript
console.log('User action completed'); // Will be disabled in production
```

### 2. Preserve Critical Errors

Always use `console.error` or `logger.error` for critical issues:

```typescript
try {
  // Some operation
} catch (error) {
  logger.error('Critical operation failed:', error);
  // This will always be visible, even in production
}
```

### 3. Environment-Specific Logic

```typescript
import { environment } from '@/config/logging';

if (environment.isDev) {
  // Development-only debugging code
  logger.debug('Detailed state:', complexObject);
}
```

### 4. Performance Considerations

For performance-critical operations:

```typescript
import { environment } from '@/config/logging';

// Only create expensive debug output in development
if (environment.isDev) {
  const debugData = generateExpensiveDebugInfo();
  logger.debug('Performance data:', debugData);
}
```

## Testing the Configuration

### Development Testing

1. Start the development server: `npm run dev`
2. Open browser DevTools console
3. All console methods should work normally

### Production Testing

1. Build the project: `npm run build`
2. Serve the built files: `npm run preview`
3. Open browser DevTools console
4. Only `console.error` and `logger.error` should produce output

### Demo File

Use the demo file at `dump/console-demo.html` to test the configuration:
- Open the file in a browser
- Toggle between development and production modes
- Test all console methods
- Observe the behavior differences

## Configuration Options

### Custom Logger Options

```typescript
interface LoggerOptions {
  preserveErrors?: boolean;        // Always show errors (default: true)
  preserveWarnings?: boolean;      // Show warnings in production (default: false)
  customLogLevel?: LogLevel;       // Custom logging level
}
```

### Environment Configuration

```typescript
interface LoggingConfig {
  isDevelopment: boolean;          // Development mode flag
  isProduction: boolean;           // Production mode flag
  enableConsoleOverride: boolean;  // Enable global console override
  preserveErrors: boolean;         // Preserve error logging
}
```

## Security and Privacy

- **Production Safety**: No sensitive debug information leaks to production console
- **Error Tracking**: Critical errors are preserved for monitoring and debugging
- **Performance**: Removed console statements don't impact production performance
- **Compliance**: Helps meet security requirements for clean production deployments

## Troubleshooting

### Console Methods Not Working in Development

Check that `configureConsole()` is called in `main.tsx` and that the environment detection is working properly.

### Errors Not Appearing in Production

Verify that error logging is using `console.error` or `logger.error`, which are preserved in all environments.

### Build Failures

Ensure TypeScript types are properly imported and the logging configuration doesn't conflict with other build tools.

## Future Enhancements

1. **Remote Logging**: Integrate with remote logging services (Sentry, LogRocket)
2. **Log Levels**: Implement configurable log levels per environment
3. **Performance Metrics**: Add automatic performance monitoring
4. **Log Filtering**: Add runtime log filtering capabilities
5. **Storage Integration**: Store logs in local storage for debugging

## Related Files

- `/src/lib/utils.ts` - Main logging utilities
- `/src/config/logging.ts` - Advanced configuration
- `/src/types/logger.ts` - TypeScript definitions
- `/src/main.tsx` - Application initialization
- `/vite.config.ts` - Build configuration
- `/dump/console-demo.html` - Testing demo
- `/dump/test-logging.ts` - Test script

## References

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Console API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Console)
- [Production Logging Best Practices](https://12factor.net/logs)