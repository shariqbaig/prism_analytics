import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useFileStore } from '@/stores/fileStore';
import { BarChart3 } from 'lucide-react';

// Lazy load page components for code splitting
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Upload = React.lazy(() => import('@/pages/Upload'));
const TestUpload = React.lazy(() => import('@/pages/TestUpload'));
const ValidationRequirements = React.lazy(() => import('@/pages/ValidationRequirements'));
const DataViewer = React.lazy(() => import('@/pages/DataViewer'));
const Inventory = React.lazy(() => import('@/pages/Inventory'));
const OSR = React.lazy(() => import('@/pages/OSR'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const Demo = React.lazy(() => import('@/pages/Demo'));

// Data Guard component for routes that require specific data
interface DataGuardProps {
  children: React.ReactNode;
  requiredData: ('inventory' | 'osr')[];
}

const DataGuard: React.FC<DataGuardProps> = ({ children, requiredData }) => {
  const { activeDataSources } = useFileStore();
  
  const hasRequiredData = requiredData.every(source => 
    activeDataSources.includes(source)
  );
  
  if (!hasRequiredData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 p-6">
        <BarChart3 className="h-12 w-12 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Data Required</h3>
          <p className="text-muted-foreground">
            This analysis requires {requiredData.join(' and ')} data.
          </p>
          <p className="text-sm text-muted-foreground">
            Please upload the required files to continue.
          </p>
        </div>
        <Navigate to="/upload" replace />
      </div>
    );
  }
  
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Dashboard />
          </Suspense>
        )
      },
      {
        path: 'upload',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Upload />
          </Suspense>
        )
      },
      {
        path: 'test-upload',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <TestUpload />
          </Suspense>
        )
      },
      {
        path: 'validation-requirements',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ValidationRequirements />
          </Suspense>
        )
      },
      {
        path: 'data-viewer',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DataViewer />
          </Suspense>
        )
      },
      {
        path: 'inventory',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Inventory />
          </Suspense>
        )
      },
      {
        path: 'osr',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <OSR />
          </Suspense>
        )
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Reports />
          </Suspense>
        )
      },
      {
        path: 'demo',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Demo />
          </Suspense>
        )
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />
      }
    ]
  }
]);