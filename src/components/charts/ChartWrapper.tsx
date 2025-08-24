import React from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ChartErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ChartErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ChartErrorBoundary extends React.Component<ChartErrorBoundaryProps, ChartErrorBoundaryState> {
  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ChartErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chart rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center p-8 border border-red-200 rounded-lg bg-red-50">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">Chart Error</h3>
            <p className="text-red-700 mb-4">Unable to render chart visualization</p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ChartLoadingProps {
  height?: number;
  message?: string;
}

export const ChartLoading: React.FC<ChartLoadingProps> = ({ 
  height = 400, 
  message = "Loading chart data..." 
}) => (
  <div 
    className="flex items-center justify-center border rounded-lg bg-gray-50"
    style={{ height }}
  >
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

interface ChartWrapperProps {
  children: ReactNode;
  loading?: boolean;
  height?: number;
  loadingMessage?: string;
  errorFallback?: ReactNode;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  children,
  loading = false,
  height = 400,
  loadingMessage,
  errorFallback
}) => {
  if (loading) {
    return <ChartLoading height={height} message={loadingMessage} />;
  }

  return (
    <ChartErrorBoundary fallback={errorFallback}>
      {children}
    </ChartErrorBoundary>
  );
};