/**
 * Test script for verifying logging configuration
 * This file demonstrates how to use the logging system
 */

import { logger } from '../src/lib/utils';
import { environment, createLogger } from '../src/config/logging';

// Test basic logger
console.log('Testing basic console.log - should be disabled in production');
console.warn('Testing basic console.warn - should be disabled in production');
console.error('Testing basic console.error - should always work');

// Test custom logger
logger.log('Testing logger.log - should be disabled in production');
logger.warn('Testing logger.warn - should be disabled in production');
logger.error('Testing logger.error - should always work');
logger.info('Testing logger.info - should be disabled in production');
logger.debug('Testing logger.debug - should be disabled in production');

// Test environment detection
console.log('Environment info:');
console.log('- isDev:', environment.isDev);
console.log('- isProd:', environment.isProd);
console.log('- mode:', environment.mode);

// Test custom logger with options
const customLogger = createLogger({
  preserveErrors: true,
  preserveWarnings: true,
  customLogLevel: 'warn'
});

customLogger.log('Custom logger log - should follow custom level');
customLogger.warn('Custom logger warn - should follow custom level');
customLogger.error('Custom logger error - should always work');

// Test performance logging
environment.getLogger().log('Performance test completed');

export { logger, environment, createLogger };