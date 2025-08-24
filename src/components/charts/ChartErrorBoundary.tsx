import React, { Component } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chart Error Boundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/10">
          <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Chart Rendering Error
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {this.state.error?.message || 'An error occurred while rendering this chart.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Chart
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper function component for easier usage
export const ChartErrorWrapper: React.FC<{
  children: ReactNode;
  title?: string;
  onError?: (error: Error) => void;
}> = ({ children, title = 'Chart', onError }) => {
  return (
    <ChartErrorBoundary
      onError={(error, errorInfo) => {
        console.error(`${title} Error:`, error, errorInfo);
        onError?.(error);
      }}
    >
      {children}
    </ChartErrorBoundary>
  );
};