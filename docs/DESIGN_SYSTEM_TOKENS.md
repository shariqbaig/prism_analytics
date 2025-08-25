# PRISM Analytics Design System Tokens

## Overview

This document defines the complete design token system for PRISM Analytics, built on Shadcn/UI principles with executive dashboard optimizations. The system uses OKLCH color space for better color perception and manipulation.

## Color System

### Core Philosophy

Our color system is designed for:
- **Executive Readability**: High contrast ratios for C-Suite users
- **Professional Aesthetics**: Navy and neutral palette for trust and stability
- **Data Clarity**: Distinct chart colors for complex visualizations
- **Accessibility**: WCAG 2.1 AA compliance across all themes

### Primary Color Palette

```css
/* Executive Navy - Primary Brand */
--primary: 0.21 0.034 264.665;          /* Professional navy blue */
--primary-foreground: 0.985 0.002 247.839;

/* Secondary Grays - Supporting Colors */
--secondary: 0.967 0.003 264.542;       /* Light gray */
--secondary-foreground: 0.21 0.034 264.665;

/* Accent Colors - Highlights */
--accent: 0.967 0.003 264.542;
--accent-foreground: 0.21 0.034 264.665;
```

### Status Color System

Health-coded colors for dashboard metrics:

```css
/* Success - Healthy Status */
--success: 0.646 0.222 142.086;         /* Professional green */
--success-foreground: 0.985 0.002 247.839;

/* Warning - Attention Needed */
--warning: 0.84 0.16 84;                /* Professional amber */
--warning-foreground: 0.28 0.07 46;

/* Critical - Immediate Action */
--destructive: 0.577 0.245 27.325;      /* Professional red */
--destructive-foreground: 0.985 0.002 247.839;

/* Neutral - No Status */
--neutral: 0.7 0.015 264.5;             /* Neutral gray */
--neutral-foreground: 0.985 0.002 247.839;
```

### Chart Color Palette

Optimized for data visualization and accessibility:

```css
--chart-1: 0.646 0.222 41.116;         /* Warm Orange */
--chart-2: 0.6 0.118 184.704;          /* Ocean Blue */
--chart-3: 0.398 0.07 227.392;         /* Deep Purple */
--chart-4: 0.828 0.189 84.429;         /* Bright Green */
--chart-5: 0.769 0.188 70.08;          /* Golden Yellow */
```

**Chart Color Guidelines:**
- Maximum 5 colors per chart for cognitive load management
- Colors maintain distinction in both light and dark modes
- Colorblind-friendly palette tested for deuteranopia and protanopia
- High contrast ratios for executive presentation environments

## Typography Scale

### Font Families

```css
--font-family-sans: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-family-heading: "Inter", system-ui, sans-serif;
--font-family-mono: "JetBrains Mono", "Fira Code", Menlo, monospace;
```

### Display Typography

Executive-optimized sizing for dashboard components:

```css
/* Hero Displays - 72px */
--font-size-display-2xl: 4.5rem;
--line-height-display-2xl: 1.1;

/* Large Displays - 60px */
--font-size-display-xl: 3.75rem;
--line-height-display-xl: 1.1;

/* Medium Displays - 48px */
--font-size-display-lg: 3rem;
--line-height-display-lg: 1.15;

/* KPI Values - 36px */
--font-size-display-md: 2.25rem;
--line-height-display-md: 1.2;

/* Section Headers - 30px */
--font-size-display-sm: 1.875rem;
--line-height-display-sm: 1.25;
```

**Typography Guidelines:**
- KPI values use `display-md` (36px) for executive readability
- Section headers use `display-sm` (30px) for clear hierarchy
- Body text maintains 14px minimum for accessibility
- Line heights optimized for executive dashboard scanning patterns

## Spacing System

### Executive Dashboard Spacing

```css
/* Executive Component Heights */
--kpi-card-min-height: 120px;          /* Executive readability standard */
--executive-summary-min-height: 200px;
--dashboard-padding: 1.5rem;           /* 24px - Optimal tablet spacing */
--card-padding: 1.25rem;               /* 20px - Card content spacing */

/* Extended Spacing Scale */
--spacing-18: 4.5rem;                  /* 72px */
--spacing-22: 5.5rem;                  /* 88px */
--spacing-26: 6.5rem;                  /* 104px */
--spacing-30: 7.5rem;                  /* 120px */
```

### Border Radius

```css
--radius: 0.625rem;                    /* 10px - Professional rounded corners */
```

**Spacing Guidelines:**
- 120px minimum height for KPI cards ensures readability on tablets
- 24px dashboard padding provides comfortable tablet interaction zones
- Consistent spacing scale maintains visual rhythm across components

## Animation System

### Transition Timing

```css
--chart-animation-duration: 800ms;     /* Data visualization animations */
--transition-fast: 150ms;              /* UI feedback */
--transition-normal: 300ms;            /* Standard transitions */
--transition-slow: 500ms;              /* Complex state changes */
```

**Animation Guidelines:**
- Chart animations use 800ms for smooth data transitions
- UI feedback uses 150ms for immediate response feeling
- Complex state changes use 500ms for clear visual progression

## Theme System

### Light Theme (Default)

```css
:root {
  --background: 1 0 0;                 /* Pure white */
  --foreground: 0.13 0.028 261.692;    /* Deep navy text */
  --card: 1 0 0;                       /* White cards */
  --border: 0.928 0.006 264.531;       /* Light borders */
  --input: 0.928 0.006 264.531;        /* Input field borders */
  --ring: 0.707 0.022 261.325;         /* Focus rings */
}
```

### Dark Theme

```css
.dark {
  --background: 0.13 0.028 261.692;    /* Deep navy background */
  --foreground: 0.985 0.002 247.839;   /* Light text */
  --card: 0.21 0.034 264.665;          /* Dark cards */
  --border: 1 0 0 / 10%;               /* Transparent borders */
  --input: 1 0 0 / 15%;                /* Transparent inputs */
  --ring: 0.551 0.027 264.364;         /* Accent focus rings */
}
```

### Executive Themes

**Executive Light**: Professional light theme optimized for C-Suite dashboards
**Executive Dark**: Professional dark theme optimized for boardroom presentations

Both themes maintain the core color relationships while adjusting for executive presentation contexts.

## Component-Specific Tokens

### Sidebar Components

```css
--sidebar: 0.985 0.002 247.839;
--sidebar-foreground: 0.13 0.028 261.692;
--sidebar-primary: 0.21 0.034 264.665;
--sidebar-primary-foreground: 0.985 0.002 247.839;
--sidebar-accent: 0.967 0.003 264.542;
--sidebar-accent-foreground: 0.21 0.034 264.665;
--sidebar-border: 0.928 0.006 264.531;
--sidebar-ring: 0.707 0.022 261.325;
```

## Usage Guidelines

### CSS Custom Properties

```css
/* Use semantic color names */
.component {
  background: oklch(var(--card));
  color: oklch(var(--card-foreground));
  border: 1px solid oklch(var(--border));
}

/* Status colors for conditional styling */
.status-success {
  background: oklch(var(--success));
  color: oklch(var(--success-foreground));
}
```

### Tailwind CSS Classes

```tsx
// Use semantic classes
<div className="bg-card text-card-foreground border border-border" />

// Status-based styling
<div className="bg-success text-success-foreground" />

// Chart colors
<div className="bg-chart-1" />
<div className="bg-chart-2" />
```

### TypeScript Usage

```typescript
import { useTheme, getColorValue } from '@/lib/theme';

// Access design tokens
const { tokens } = useTheme();

// Get specific color values
const primaryColor = getColorValue('primary');
const chartColor = getColorValue('chart-1');
```

## Customization

### Custom Color Integration

```typescript
import { useTheme } from '@/lib/theme';

const { applyCustomColors } = useTheme();

// Apply custom brand colors
applyCustomColors({
  primary: '0.25 0.05 280',           // Custom brand primary
  'chart-1': '0.7 0.2 45',           // Custom chart color
});
```

### Theme Export/Import

```typescript
import { useTheme } from '@/lib/theme';

const { exportTheme, importTheme } = useTheme();

// Export current theme configuration
const themeConfig = exportTheme();

// Import saved theme configuration
importTheme(themeConfig);
```

## Accessibility Considerations

### Color Contrast Ratios

All color combinations meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- Interactive elements: 3:1 minimum contrast ratio

### Executive Dashboard Requirements

- KPI values maintain 7:1 contrast ratio for executive clarity
- Chart colors remain distinguishable in various lighting conditions
- Status colors maintain semantic meaning across cultures

### Testing Tools

- **Contrast Ratio**: Use WebAIM Contrast Checker
- **Color Blindness**: Test with Stark or Sim Daltonism
- **Executive Testing**: Validate on tablet devices in meeting room lighting

## Best Practices

### Do's

✅ Use semantic color names (`bg-primary`, `text-foreground`)
✅ Maintain consistent spacing using design tokens
✅ Test themes in both light and dark modes
✅ Use OKLCH format for color consistency
✅ Apply executive spacing standards (120px min height for KPI cards)

### Don'ts

❌ Hardcode color values (`bg-blue-600`)
❌ Use arbitrary spacing (`p-7`, `mt-13`)
❌ Create colors that fail contrast requirements
❌ Mix color spaces (HSL, RGB) with OKLCH tokens
❌ Ignore executive readability requirements

## Migration Guide

### From HSL to OKLCH

```css
/* Old HSL format */
--primary: 214 86% 26%;

/* New OKLCH format */
--primary: 0.21 0.034 264.665;
```

### Updating Components

```tsx
// Old hardcoded approach
<div className="bg-blue-600 text-white" />

// New semantic token approach
<div className="bg-primary text-primary-foreground" />
```

### Theme Provider Integration

```tsx
import { ThemeProvider } from '@/lib/theme';

function App() {
  return (
    <ThemeProvider defaultTheme="executive-light">
      <YourApp />
    </ThemeProvider>
  );
}
```

## Token Reference

### Complete Color Token List

| Token | Purpose | Light Value | Dark Value |
|-------|---------|-------------|------------|
| `background` | Page background | `1 0 0` | `0.13 0.028 261.692` |
| `foreground` | Text color | `0.13 0.028 261.692` | `0.985 0.002 247.839` |
| `primary` | Brand primary | `0.21 0.034 264.665` | `0.928 0.006 264.531` |
| `secondary` | Supporting color | `0.967 0.003 264.542` | `0.278 0.033 256.848` |
| `accent` | Accent highlights | `0.967 0.003 264.542` | `0.278 0.033 256.848` |
| `muted` | Subdued backgrounds | `0.967 0.003 264.542` | `0.278 0.033 256.848` |
| `card` | Card backgrounds | `1 0 0` | `0.21 0.034 264.665` |
| `border` | Border colors | `0.928 0.006 264.531` | `1 0 0 / 10%` |
| `input` | Input field borders | `0.928 0.006 264.531` | `1 0 0 / 15%` |
| `ring` | Focus ring color | `0.707 0.022 261.325` | `0.551 0.027 264.364` |
| `success` | Success state | `0.646 0.222 142.086` | `0.488 0.243 142.086` |
| `warning` | Warning state | `0.84 0.16 84` | `0.41 0.11 46` |
| `destructive` | Error state | `0.577 0.245 27.325` | `0.704 0.191 22.216` |

### Executive Dashboard Measurements

| Component | Minimum Height | Padding | Purpose |
|-----------|----------------|---------|---------|
| KPI Card | 120px | 20px | Executive readability |
| Executive Summary | 200px | 20px | Strategic overview |
| Dashboard Container | - | 24px | Tablet interaction |
| Chart Card | 200px | 20px | Data visualization |

This design system ensures consistent, accessible, and executive-optimized interfaces across all PRISM Analytics components.