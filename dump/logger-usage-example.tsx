/**
 * Example React component demonstrating proper logger usage
 * This shows how to integrate the logging system with React components
 */

import React, { useEffect, useState } from 'react';
import { logger } from '../src/lib/utils';
import { environment, createLogger } from '../src/config/logging';

// Create a component-specific logger with custom options
const componentLogger = createLogger({
  preserveErrors: true,
  preserveWarnings: true,
  customLogLevel: environment.isDev ? 'debug' : 'error'
});

interface ExampleComponentProps {
  userId?: string;
  debug?: boolean;
}

const ExampleComponent: React.FC<ExampleComponentProps> = ({ 
  userId, 
  debug = false 
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Log component mount (only in development)
    logger.debug('ExampleComponent mounted', { userId, debug });
    
    // Performance tracking (development only)
    if (environment.isDev) {
      environment.logPerformance.start('component-mount');
    }

    return () => {
      logger.debug('ExampleComponent unmounting');
      
      if (environment.isDev) {
        environment.logPerformance.end('component-mount');
      }
    };
  }, [userId, debug]);

  const handleDataFetch = async () => {
    logger.info('Starting data fetch for user:', userId);
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      const response = await fetch(`/api/user/${userId}/data`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Log successful fetch (only in development)
      logger.debug('Data fetch successful', {
        userId,
        recordCount: result.length,
        timestamp: new Date().toISOString()
      });

      setData(result);

    } catch (fetchError) {
      // Error logging (ALWAYS appears, even in production)
      logger.error('Data fetch failed for user:', userId, {
        error: fetchError,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });

      setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');

    } finally {
      setLoading(false);
      logger.info('Data fetch completed for user:', userId);
    }
  };

  const handleDebugAction = () => {
    // Conditional debug logging
    if (debug && environment.isDev) {
      logger.debug('Debug action triggered', {
        componentState: {
          data: data.length,
          loading,
          error,
          userId
        },
        performance: {
          memory: (performance as any).memory?.usedJSHeapSize || 'unknown',
          timing: performance.now()
        }
      });
    }

    // Use component-specific logger
    componentLogger.log('Debug action executed');
  };

  const handleWarningScenario = () => {
    // Warning that might be useful in development
    logger.warn('Potential performance issue detected', {
      dataSize: data.length,
      threshold: 1000,
      recommendation: 'Consider implementing pagination'
    });

    // Business logic warning
    if (data.length > 1000) {
      componentLogger.warn('Large dataset detected, performance may be impacted');
    }
  };

  const handleCriticalError = () => {
    try {
      // Simulate critical operation
      throw new Error('Critical system failure');
    } catch (criticalError) {
      // This will ALWAYS be logged, even in production
      logger.error('CRITICAL: System failure in ExampleComponent', {
        userId,
        error: criticalError,
        timestamp: new Date().toISOString(),
        stackTrace: criticalError instanceof Error ? criticalError.stack : undefined,
        context: {
          component: 'ExampleComponent',
          action: 'handleCriticalError',
          dataState: data.length > 0 ? 'loaded' : 'empty'
        }
      });
    }
  };

  // Environment-specific rendering
  const renderDebugInfo = () => {
    if (!environment.isDev) return null;

    return (
      <div style={{ 
        padding: '10px', 
        background: '#f0f0f0', 
        border: '1px solid #ccc',
        margin: '10px 0' 
      }}>
        <h4>Debug Info (Development Only)</h4>
        <p>Environment: {environment.mode}</p>
        <p>User ID: {userId || 'Not set'}</p>
        <p>Data Count: {data.length}</p>
        <p>Loading: {loading.toString()}</p>
        <p>Error: {error || 'None'}</p>
        <p>Debug Mode: {debug.toString()}</p>
      </div>
    );
  };

  return (
    <div>
      <h2>Example Component</h2>
      
      {renderDebugInfo()}

      <div style={{ margin: '20px 0' }}>
        <button onClick={handleDataFetch} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
        
        <button onClick={handleDebugAction} style={{ marginLeft: '10px' }}>
          Debug Action
        </button>
        
        <button onClick={handleWarningScenario} style={{ marginLeft: '10px' }}>
          Trigger Warning
        </button>
        
        <button 
          onClick={handleCriticalError} 
          style={{ marginLeft: '10px', background: '#ff4444', color: 'white' }}
        >
          Trigger Critical Error
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}

      {data.length > 0 && (
        <div>
          <h3>Data ({data.length} items)</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', maxHeight: '200px', overflow: 'auto' }}>
            {JSON.stringify(data.slice(0, 5), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ExampleComponent;

/**
 * Usage examples in different scenarios:
 */

// 1. Basic component usage
const BasicUsage = () => (
  <ExampleComponent userId="user123" />
);

// 2. Debug mode (only useful in development)
const DebugUsage = () => (
  <ExampleComponent userId="user123" debug={true} />
);

// 3. Error boundary integration
class ErrorBoundary extends React.Component<
  { children: React.ReactNode }, 
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Always log critical errors
    logger.error('React Error Boundary caught error', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Additional error reporting
    logger.error('React Error Boundary - componentDidCatch', {
      error,
      errorInfo,
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          {environment.isDev && (
            <p>Check the console for detailed error information.</p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Export for usage
export { ExampleComponent, ErrorBoundary, BasicUsage, DebugUsage };