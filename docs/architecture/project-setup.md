# PRISM Analytics - Project Setup

## Overview
PRISM Analytics is an executive-focused React dashboard that transforms inventory and OSR Excel data into actionable insights. Built with Vite, React 18, TypeScript, and Tailwind CSS.

## Tech Stack
- **Framework**: React 18.x with TypeScript
- **Build Tool**: Vite 5.x (ES2020 target)
- **Styling**: Tailwind CSS 3.x + shadcn/ui components
- **State Management**: Zustand 4.x
- **Charts**: Chart.js + Recharts
- **Storage**: Dexie.js (IndexedDB wrapper)
- **File Processing**: SheetJS with Web Workers
- **Deployment**: Netlify static hosting

## Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── charts/          # Chart wrapper components
│   ├── dashboard/       # Dashboard-specific components
│   ├── upload/          # File upload components
│   └── layout/          # Layout components
├── features/            # Feature-based organization
│   ├── inventory/       # Inventory analysis feature
│   ├── osr/            # OSR analysis feature
│   └── reports/        # Export/reporting feature
├── lib/                # Core utilities
│   ├── excel/          # Excel processing
│   ├── db/             # Database operations
│   ├── calculations/   # Business logic
│   └── utils/          # General utilities
├── stores/             # Zustand stores
├── types/              # TypeScript definitions
├── pages/              # Route components
├── hooks/              # Custom React hooks
└── styles/             # Global styles
```

## Development Commands
```bash
npm run dev         # Start development server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # ESLint check
npm run type-check  # TypeScript check
```

## Configuration Files
- `vite.config.ts` - Build configuration with path aliases
- `tailwind.config.js` - Tailwind with shadcn/ui setup
- `tsconfig.app.json` - TypeScript config with path mapping
- `netlify.toml` - Netlify deployment configuration
- `.env.example` - Environment variables template

## Key Features
1. **Executive-Focused UI**: 120px minimum KPI cards, professional animations
2. **Adaptive Rendering**: Charts adapt based on available data sources
3. **Offline Capability**: Full functionality with IndexedDB storage
4. **Web Worker Processing**: Non-blocking Excel file processing
5. **Responsive Design**: Optimized for desktop and tablet (1024px+)

## Development Standards
- TypeScript strict mode enabled
- Path aliases configured (@/* → ./src/*)
- Executive color palette with health-coded indicators
- Component-based architecture with feature organization
- Performance-optimized builds with code splitting