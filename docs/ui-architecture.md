# PRISM Analytics - Executive Inventory Dashboard Frontend Architecture Document

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-01-23 | 1.0 | Initial Frontend Architecture | Architect Team |

## Template and Framework Selection

### Framework Decision
**Selected Framework:** React 18 + TypeScript + Vite

Based on the PRD requirements, PRISM Analytics uses:
- **React 18** with TypeScript for type-safe component development
- **Vite** as build tool for fast development and optimized production builds
- **Tailwind CSS + shadcn/ui** for rapid, professional UI development
- **Client-side only architecture** with IndexedDB for offline capability

**Rationale:** This stack prioritizes executive dashboard performance with fast HMR during development and optimized bundles for production. The component library choices support rapid development while maintaining professional executive-grade UI standards.

## Frontend Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Framework | React | 18.x | UI component framework | Mature ecosystem, excellent TypeScript support, perfect for data-heavy dashboards |
| UI Library | shadcn/ui | Latest | Component library | Professional components, Tailwind integration, executive-appropriate styling |
| State Management | Zustand | 4.x | Client state management | Lightweight, simple API, perfect for dashboard state without over-engineering |
| Routing | React Router | 6.x | Client-side routing | Standard React routing, supports breadcrumbs needed for drill-downs |
| Build Tool | Vite | 5.x | Development and build | Fast HMR, optimized builds, excellent TypeScript support |
| Styling | Tailwind CSS | 3.x | Utility-first CSS framework | Rapid development, consistent design system, mobile-responsive |
| Testing | Vitest | 1.x | Unit testing framework | Vite-native, fast execution, Jest-compatible API |
| Component Library | shadcn/ui + Recharts | Latest | Pre-built components + Charts | Executive-grade components + powerful chart library |
| Form Handling | React Hook Form | 7.x | File upload forms | Minimal re-renders, excellent validation, perfect for file uploads |
| Animation | Framer Motion | 11.x | UI animations | Smooth chart transitions, loading states, professional micro-interactions |
| Dev Tools | ESLint + Prettier | Latest | Code quality | Consistent code formatting, error prevention |

## Project Structure

```plaintext
src/
├── components/                 # Reusable UI components
│   ├── ui/                    # shadcn/ui base components
│   ├── charts/                # Chart wrapper components
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   ├── LineChart.tsx
│   │   ├── GaugeChart.tsx
│   │   └── index.ts
│   ├── dashboard/             # Dashboard-specific components
│   │   ├── KPICard.tsx
│   │   ├── DashboardGrid.tsx
│   │   └── index.ts
│   ├── upload/                # File upload components
│   │   ├── FileUploader.tsx
│   │   ├── FileValidator.tsx
│   │   └── index.ts
│   └── layout/                # Layout components
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── index.ts
├── features/                  # Feature-based organization
│   ├── inventory/             # Inventory analysis feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── osr/                   # OSR analysis feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   └── reports/               # Export/reporting feature
│       ├── components/
│       ├── hooks/
│       └── utils/
├── lib/                       # Core utilities
│   ├── excel/                 # Excel processing utilities
│   │   ├── parser.ts
│   │   ├── validator.ts
│   │   └── types.ts
│   ├── db/                    # Database operations
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── operations.ts
│   ├── calculations/          # Business logic calculations
│   │   ├── inventory.ts
│   │   ├── osr.ts
│   │   └── metrics.ts
│   └── utils/                 # General utilities
│       ├── format.ts
│       ├── constants.ts
│       └── helpers.ts
├── stores/                    # Zustand stores
│   ├── fileStore.ts
│   ├── dataStore.ts
│   ├── uiStore.ts
│   └── index.ts
├── types/                     # TypeScript definitions
│   ├── excel.ts
│   ├── dashboard.ts
│   ├── api.ts
│   └── index.ts
├── pages/                     # Route components
│   ├── Dashboard.tsx
│   ├── Upload.tsx
│   ├── Inventory.tsx
│   ├── OSR.tsx
│   └── Reports.tsx
├── hooks/                     # Custom React hooks
│   ├── useFileProcessor.ts
│   ├── useChartData.ts
│   ├── useExport.ts
│   └── index.ts
├── styles/                    # Global styles
│   ├── globals.css
│   └── components.css
├── assets/                    # Static assets
├── App.tsx                    # Main app component
├── main.tsx                   # Application entry point
└── vite-env.d.ts             # Vite type definitions
```

## Component Standards

### Component Template

```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  className?: string;
  children?: React.ReactNode;
  // Add specific props here
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn('default-classes', className)} {...props}>
      {children}
    </div>
  );
};

// Export for easier imports
export default ComponentName;
```

### Naming Conventions

**Components:**
- **React Components**: PascalCase (e.g., `KPICard`, `FileUploader`, `OSRHealthGauge`)
- **Component Files**: PascalCase with `.tsx` extension (e.g., `KPICard.tsx`)
- **Hook Files**: camelCase starting with 'use' (e.g., `useFileProcessor.ts`)

**Files & Directories:**
- **Feature Directories**: lowercase (e.g., `inventory/`, `osr/`, `reports/`)
- **Utility Files**: camelCase (e.g., `excelParser.ts`, `metricsCalculator.ts`)
- **Type Files**: camelCase (e.g., `dashboardTypes.ts`, `excelTypes.ts`)

**Variables & Functions:**
- **Props Interfaces**: ComponentName + Props (e.g., `KPICardProps`)
- **Store Names**: featureName + Store (e.g., `fileStore`, `dataStore`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_FILE_SIZE`, `CHART_COLORS`)

**Chart Components:**
- Chart wrapper components: `[ChartType]Chart` (e.g., `BarChart`, `GaugeChart`)
- Chart data hooks: `use[Feature]ChartData` (e.g., `useInventoryChartData`)

## State Management

### Store Structure

```plaintext
stores/
├── fileStore.ts              # File upload and management state
├── dataStore.ts              # Parsed Excel data and business logic state
├── uiStore.ts                # UI state (filters, selected views, etc.)
├── chartStore.ts             # Chart-specific state and configurations
├── exportStore.ts            # Export/report generation state
└── index.ts                  # Store composition and exports
```

### State Management Template

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ExcelFileData, ValidationResult } from '@/types/excel';

interface FileState {
  // Current files
  inventoryFile: ExcelFileData | null;
  osrFile: ExcelFileData | null;
  
  // Upload state
  isUploading: boolean;
  uploadProgress: number;
  validationResults: ValidationResult[];
  
  // File management
  activeDataSources: ('inventory' | 'osr')[];
  
  // Actions
  setInventoryFile: (file: ExcelFileData) => void;
  setOsrFile: (file: ExcelFileData) => void;
  clearFile: (fileType: 'inventory' | 'osr') => void;
  clearAllFiles: () => void;
  setUploadProgress: (progress: number) => void;
  setValidationResults: (results: ValidationResult[]) => void;
}

export const useFileStore = create<FileState>()(
  devtools(
    (set, get) => ({
      // Initial state
      inventoryFile: null,
      osrFile: null,
      isUploading: false,
      uploadProgress: 0,
      validationResults: [],
      activeDataSources: [],
      
      // Actions
      setInventoryFile: (file) => 
        set((state) => ({
          inventoryFile: file,
          activeDataSources: [...new Set([...state.activeDataSources, 'inventory'])]
        })),
      
      setOsrFile: (file) => 
        set((state) => ({
          osrFile: file,
          activeDataSources: [...new Set([...state.activeDataSources, 'osr'])]
        })),
      
      clearFile: (fileType) => 
        set((state) => ({
          [fileType === 'inventory' ? 'inventoryFile' : 'osrFile']: null,
          activeDataSources: state.activeDataSources.filter(source => source !== fileType)
        })),
      
      clearAllFiles: () => 
        set({
          inventoryFile: null,
          osrFile: null,
          activeDataSources: [],
          validationResults: []
        }),
      
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      setValidationResults: (results) => set({ validationResults: results })
    }),
    {
      name: 'file-store'
    }
  )
);
```

## API Integration

### Service Template

```typescript
import { ExcelFileData, ProcessedData, ValidationResult } from '@/types/excel';
import { OSRMetrics, InventoryMetrics } from '@/types/dashboard';

// File processing service (client-side only)
export class ExcelProcessingService {
  private worker: Worker | null = null;

  constructor() {
    // Initialize web worker for heavy processing
    this.worker = new Worker(new URL('../workers/excelProcessor.worker.ts', import.meta.url));
  }

  async processExcelFile(file: File): Promise<ExcelFileData> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }

      this.worker.postMessage({ file, action: 'process' });
      
      this.worker.onmessage = (event) => {
        const { success, data, error } = event.data;
        if (success) {
          resolve(data);
        } else {
          reject(new Error(error));
        }
      };

      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('File processing timeout'));
      }, 30000);
    });
  }

  async validateFileStructure(data: ExcelFileData): Promise<ValidationResult> {
    try {
      // Validation logic for sheet structure and required columns
      const missingColumns: string[] = [];
      const invalidData: string[] = [];
      
      // Check required columns based on file type
      if (data.type === 'inventory') {
        const requiredFGColumns = ['Pack Size(m.d.)', 'Plant', 'location', 'Material', 'Description'];
        const requiredRPMColumns = ['Material', 'Description', 'CAT', 'Plant', 'Material Type'];
        
        // Validate FG sheet
        if (data.sheets.fg) {
          const fgColumns = Object.keys(data.sheets.fg[0] || {});
          requiredFGColumns.forEach(col => {
            if (!fgColumns.includes(col)) {
              missingColumns.push(`FG Sheet: ${col}`);
            }
          });
        }
      }

      return {
        isValid: missingColumns.length === 0 && invalidData.length === 0,
        missingColumns,
        invalidData,
        fileType: data.type
      };
    } catch (error) {
      throw new Error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
```

## Routing

### Route Configuration

```typescript
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Upload = lazy(() => import('@/pages/Upload'));
const Inventory = lazy(() => import('@/pages/Inventory'));
const OSR = lazy(() => import('@/pages/OSR'));
const Reports = lazy(() => import('@/pages/Reports'));

// Route guard component for data-dependent routes
const DataGuard: React.FC<{ children: React.ReactNode; requiredData: string[] }> = ({
  children,
  requiredData
}) => {
  const { activeDataSources } = useFileStore();
  
  const hasRequiredData = requiredData.every(source => 
    activeDataSources.includes(source as 'inventory' | 'osr')
  );
  
  if (!hasRequiredData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">
          This analysis requires {requiredData.join(' and ')} data.
        </p>
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
        path: 'inventory',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DataGuard requiredData={['inventory']}>
              <Inventory />
            </DataGuard>
          </Suspense>
        )
      },
      {
        path: 'osr',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DataGuard requiredData={['osr']}>
              <OSR />
            </DataGuard>
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
        path: '*',
        element: <Navigate to="/dashboard" replace />
      }
    ]
  }
]);
```

## Styling Guidelines

### Styling Approach

PRISM Analytics uses **Tailwind CSS + shadcn/ui** for rapid, professional dashboard development.

### Global Theme Variables

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Executive Color Palette */
    --primary: 214 86% 26%;        /* Navy Blue #1e3a8a - Trust, stability */
    --primary-foreground: 210 40% 98%;
    
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    
    /* Health-Coded Status Colors */
    --success: 142 71% 45%;         /* Emerald #10b981 - Healthy inventory */
    --success-foreground: 210 40% 98%;
    
    --warning: 43 96% 56%;          /* Amber #f59e0b - Attention needed */
    --warning-foreground: 222.2 84% 4.9%;
    
    --destructive: 358 75% 59%;     /* Rose #f43f5e - Critical issues */
    --destructive-foreground: 210 40% 98%;
    
    /* Executive Dashboard Spacing */
    --dashboard-padding: 1.5rem;
    --card-padding: 1.25rem;
    --kpi-card-min-height: 7.5rem;    /* 120px for executive readability */
    
    /* Professional Typography Scale */
    --font-size-kpi: 2.25rem;         /* 36px for KPI values */
    --font-size-heading: 1.5rem;      /* 24px for section headings */
    --font-size-body: 0.875rem;       /* 14px for body text */
    --font-size-caption: 0.75rem;     /* 12px for chart labels */
    
    /* Chart & Animation Variables */
    --chart-animation-duration: 800ms;
    --transition-fast: 150ms;
    --transition-normal: 300ms;
    --transition-slow: 500ms;
  }
}

@layer components {
  /* Executive Dashboard Components */
  .dashboard-grid {
    @apply grid gap-6 p-6;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  .kpi-card {
    @apply bg-card rounded-lg border shadow-sm;
    min-height: var(--kpi-card-min-height);
    padding: var(--card-padding);
  }
  
  .kpi-value {
    @apply font-bold text-primary;
    font-size: var(--font-size-kpi);
    line-height: 1.2;
  }
  
  .status-healthy {
    @apply text-success bg-success/10 border-success/20;
  }
  
  .status-warning {
    @apply text-warning bg-warning/10 border-warning/20;
  }
  
  .status-critical {
    @apply text-destructive bg-destructive/10 border-destructive/20;
  }
}
```

## Testing Requirements

### Component Test Template

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { KPICard } from '@/components/dashboard/KPICard';

// Mock Zustand store
vi.mock('@/stores/fileStore', () => ({
  useFileStore: vi.fn(() => ({
    setInventoryFile: vi.fn(),
    isUploading: false,
    uploadProgress: 0
  }))
}));

describe('KPICard Component', () => {
  const defaultProps = {
    title: 'Total Inventory Value',
    value: 1250000,
    format: 'currency' as const,
    trend: 5.2,
    className: ''
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders KPI card with correct values', () => {
    render(<KPICard {...defaultProps} />);
    
    expect(screen.getByText('Total Inventory Value')).toBeInTheDocument();
    expect(screen.getByText('$1,250,000')).toBeInTheDocument();
    expect(screen.getByText('+5.2%')).toBeInTheDocument();
  });

  it('applies correct status styling based on trend', () => {
    const { rerender } = render(<KPICard {...defaultProps} trend={-3.5} />);
    
    const trendElement = screen.getByText('-3.5%');
    expect(trendElement).toHaveClass('text-destructive');
    
    rerender(<KPICard {...defaultProps} trend={2.1} />);
    const positiveTrend = screen.getByText('+2.1%');
    expect(positiveTrend).toHaveClass('text-success');
  });
});
```

### Testing Best Practices

1. **Unit Tests**: Test individual components in isolation with proper mocking of external dependencies
2. **Integration Tests**: Test component interactions and data flow between stores and UI components
3. **E2E Tests**: Test critical user flows using Playwright for file upload → processing → dashboard rendering
4. **Coverage Goals**: Aim for 80% code coverage with focus on business logic and user interactions
5. **Test Structure**: Follow Arrange-Act-Assert pattern with clear test descriptions
6. **Mock External Dependencies**: Mock Chart libraries, file processing workers, and IndexedDB operations

## Environment Configuration

```typescript
// .env.example
# Application Configuration
VITE_APP_TITLE="PRISM Analytics"
VITE_APP_VERSION="1.0.0"
VITE_APP_DESCRIPTION="Executive Inventory Dashboard"

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_EXPORT_PDF=true
VITE_ENABLE_EXPORT_POWERPOINT=true
VITE_ENABLE_DEV_TOOLS=false

# Performance Configuration
VITE_MAX_FILE_SIZE_MB=50
VITE_CHUNK_PROCESSING_SIZE=1000
VITE_CHART_ANIMATION_DURATION=800
VITE_WORKER_TIMEOUT_MS=30000

# IndexedDB Configuration
VITE_DB_NAME="prism_analytics"
VITE_DB_VERSION=1
VITE_ENABLE_DB_DEBUG=false

# Netlify Deployment
VITE_BUILD_TARGET="es2020"
VITE_BUILD_MINIFY=true
VITE_BUILD_SOURCEMAP=false
```

## Frontend Developer Standards

### Critical Coding Rules

**PRISM Analytics Frontend Development Rules:**

1. **Data Processing Rules**
   - **NEVER** process Excel files on main thread - always use Web Workers
   - **ALWAYS** validate file structure before processing data
   - **NEVER** assume both inventory and OSR files are available - check `activeDataSources`
   - **ALWAYS** handle partial data scenarios gracefully

2. **Chart Rendering Rules**
   - **NEVER** render charts without checking data availability first
   - **ALWAYS** show loading states during data processing
   - **NEVER** hardcode chart colors - use CSS custom properties for theme consistency
   - **ALWAYS** implement responsive chart sizing for executive devices

3. **State Management Rules**
   - **NEVER** mutate Zustand state directly - use provided actions
   - **ALWAYS** handle async operations with proper error boundaries
   - **NEVER** store large datasets in React state - use IndexedDB via stores
   - **ALWAYS** clear file data when switching between datasets

4. **UI/UX Rules**
   - **NEVER** use loading spinners longer than 3 seconds without progress indication
   - **ALWAYS** provide clear feedback when data sources are missing
   - **NEVER** hide functionality - show disabled states with explanatory text
   - **ALWAYS** maintain minimum 120px height for KPI cards (executive readability)

5. **Performance Rules**
   - **NEVER** render more than 10 charts simultaneously without virtualization
   - **ALWAYS** lazy load page components and heavy chart libraries
   - **NEVER** block UI during file uploads - show progress and allow cancellation
   - **ALWAYS** debounce filter inputs and search operations

6. **TypeScript Rules**
   - **NEVER** use `any` type - create proper interfaces for Excel data structures
   - **ALWAYS** define strict types for chart data and business calculations
   - **NEVER** ignore TypeScript errors - they prevent runtime failures
   - **ALWAYS** use discriminated unions for different file types

### Quick Reference

**Common Commands:**
```bash
# Development
npm run dev              # Start development server with HMR
npm run build           # Production build with optimizations
npm run preview         # Preview production build locally
npm run test            # Run unit tests with Vitest
npm run lint            # ESLint code quality checks
npm run type-check      # TypeScript type checking

# Netlify Deployment
git push origin main    # Automatic deployment trigger
```

**Key Import Patterns:**
```typescript
// UI Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Charts
import { BarChart } from '@/components/charts/BarChart';
import { KPICard } from '@/components/dashboard/KPICard';

// Stores
import { useFileStore } from '@/stores/fileStore';
import { useDataStore } from '@/stores/dataStore';

// Utilities
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercentage } from '@/lib/format';

// Types
import type { ExcelFileData, InventoryData, OSRData } from '@/types/excel';
```

**Adaptive Component Pattern:**
```typescript
// Always check data availability before rendering
const InventoryChart = () => {
  const { activeDataSources } = useFileStore();
  
  if (!activeDataSources.includes('inventory')) {
    return <MissingDataPrompt requiredData="inventory" />;
  }
  
  return <ActualChart />;
};
```

## Netlify Deployment Configuration

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

**Architecture Status:** ✅ Complete and Ready for Implementation  
**Implementation Tasks:** 8 priority-ordered tasks created in Archon  
**Next Step:** Begin development with task #10 - "Initialize Vite + React + TypeScript Project"