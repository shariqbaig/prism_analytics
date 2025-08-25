/**
 * Theme Management System for PRISM Analytics
 * Provides comprehensive theming API with design tokens and theme switching
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

// Theme types
export type Theme = 'light' | 'dark' | 'system' | 'executive-light' | 'executive-dark';
export type ColorFormat = 'oklch' | 'hsl' | 'rgb';

// Design token interface
interface DesignTokens {
  colors: {
    background: string;
    foreground: string;
    primary: string;
    'primary-foreground': string;
    secondary: string;
    'secondary-foreground': string;
    accent: string;
    'accent-foreground': string;
    muted: string;
    'muted-foreground': string;
    card: string;
    'card-foreground': string;
    popover: string;
    'popover-foreground': string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    'destructive-foreground': string;
    success: string;
    'success-foreground': string;
    warning: string;
    'warning-foreground': string;
    neutral: string;
    'neutral-foreground': string;
    chart: Record<1 | 2 | 3 | 4 | 5, string>;
    sidebar: {
      DEFAULT: string;
      foreground: string;
      primary: string;
      'primary-foreground': string;
      accent: string;
      'accent-foreground': string;
      border: string;
      ring: string;
    };
  };
  spacing: {
    radius: string;
    'kpi-card-min-height': string;
    'executive-summary-min-height': string;
    'dashboard-padding': string;
    'card-padding': string;
  };
  typography: {
    fontFamily: {
      sans: string[];
      heading: string[];
      mono: string[];
    };
    fontSize: {
      'display-2xl': [string, { lineHeight: string }];
      'display-xl': [string, { lineHeight: string }];
      'display-lg': [string, { lineHeight: string }];
      'display-md': [string, { lineHeight: string }];
      'display-sm': [string, { lineHeight: string }];
    };
  };
  animation: {
    'chart-animation-duration': string;
    'transition-fast': string;
    'transition-normal': string;
    'transition-slow': string;
  };
}

// Executive-optimized themes (for future expansion)
// const EXECUTIVE_THEMES = {
//   'executive-light': {
//     name: 'Executive Light',
//     description: 'Professional light theme optimized for C-Suite dashboards',
//     colors: {
//       background: '1 0 0',
//       foreground: '0.13 0.028 261.692',
//       primary: '0.21 0.034 264.665',
//       'primary-foreground': '0.985 0.002 247.839',
//     }
//   },
//   'executive-dark': {
//     name: 'Executive Dark',
//     description: 'Professional dark theme optimized for boardroom presentations',
//     colors: {
//       background: '0.13 0.028 261.692',
//       foreground: '0.985 0.002 247.839',
//       primary: '0.928 0.006 264.531',
//       'primary-foreground': '0.21 0.034 264.665',
//     }
//   }
// } as const;

// Theme context
interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
  tokens: DesignTokens;
  applyCustomColors: (colors: Record<string, string>) => void;
  resetTheme: () => void;
  exportTheme: () => string;
  importTheme: (themeConfig: string) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Theme provider component
export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}> = ({
  children,
  defaultTheme = 'system',
  storageKey = 'prism-analytics-theme'
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  // Detect system theme
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load theme from storage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored && ['light', 'dark', 'system', 'executive-light', 'executive-dark'].includes(stored)) {
      setTheme(stored as Theme);
    }
  }, [storageKey]);

  // Save theme to storage and apply to DOM
  useEffect(() => {
    localStorage.setItem(storageKey, theme);
    
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'executive-light', 'executive-dark');
    
    // Apply appropriate theme class
    if (theme === 'system') {
      root.classList.add(systemTheme);
    } else if (theme.startsWith('executive-')) {
      root.classList.add(theme);
      // Also apply light/dark for base styling
      root.classList.add(theme.includes('dark') ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
    
    // Apply custom colors
    Object.entries(customColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [theme, systemTheme, customColors]);

  // Resolve current theme
  const resolvedTheme: 'light' | 'dark' = 
    theme === 'system' ? systemTheme :
    theme.includes('dark') ? 'dark' : 'light';

  // Get design tokens
  const tokens: DesignTokens = {
    colors: {
      background: 'oklch(var(--background))',
      foreground: 'oklch(var(--foreground))',
      primary: 'oklch(var(--primary))',
      'primary-foreground': 'oklch(var(--primary-foreground))',
      secondary: 'oklch(var(--secondary))',
      'secondary-foreground': 'oklch(var(--secondary-foreground))',
      accent: 'oklch(var(--accent))',
      'accent-foreground': 'oklch(var(--accent-foreground))',
      muted: 'oklch(var(--muted))',
      'muted-foreground': 'oklch(var(--muted-foreground))',
      card: 'oklch(var(--card))',
      'card-foreground': 'oklch(var(--card-foreground))',
      popover: 'oklch(var(--popover))',
      'popover-foreground': 'oklch(var(--popover-foreground))',
      border: 'oklch(var(--border))',
      input: 'oklch(var(--input))',
      ring: 'oklch(var(--ring))',
      destructive: 'oklch(var(--destructive))',
      'destructive-foreground': 'oklch(var(--destructive-foreground))',
      success: 'oklch(var(--success))',
      'success-foreground': 'oklch(var(--success-foreground))',
      warning: 'oklch(var(--warning))',
      'warning-foreground': 'oklch(var(--warning-foreground))',
      neutral: 'oklch(var(--neutral))',
      'neutral-foreground': 'oklch(var(--neutral-foreground))',
      chart: {
        1: 'oklch(var(--chart-1))',
        2: 'oklch(var(--chart-2))',
        3: 'oklch(var(--chart-3))',
        4: 'oklch(var(--chart-4))',
        5: 'oklch(var(--chart-5))',
      },
      sidebar: {
        DEFAULT: 'oklch(var(--sidebar))',
        foreground: 'oklch(var(--sidebar-foreground))',
        primary: 'oklch(var(--sidebar-primary))',
        'primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
        accent: 'oklch(var(--sidebar-accent))',
        'accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
        border: 'oklch(var(--sidebar-border))',
        ring: 'oklch(var(--sidebar-ring))',
      },
    },
    spacing: {
      radius: 'var(--radius)',
      'kpi-card-min-height': 'var(--kpi-card-min-height)',
      'executive-summary-min-height': 'var(--executive-summary-min-height)',
      'dashboard-padding': 'var(--dashboard-padding)',
      'card-padding': 'var(--card-padding)',
    },
    typography: {
      fontFamily: {
        sans: ['var(--font-family-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-family-heading)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-family-mono)', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['var(--font-size-display-2xl)', { lineHeight: 'var(--line-height-display-2xl)' }],
        'display-xl': ['var(--font-size-display-xl)', { lineHeight: 'var(--line-height-display-xl)' }],
        'display-lg': ['var(--font-size-display-lg)', { lineHeight: 'var(--line-height-display-lg)' }],
        'display-md': ['var(--font-size-display-md)', { lineHeight: 'var(--line-height-display-md)' }],
        'display-sm': ['var(--font-size-display-sm)', { lineHeight: 'var(--line-height-display-sm)' }],
      },
    },
    animation: {
      'chart-animation-duration': 'var(--chart-animation-duration)',
      'transition-fast': 'var(--transition-fast)',
      'transition-normal': 'var(--transition-normal)',
      'transition-slow': 'var(--transition-slow)',
    },
  };

  // Apply custom colors
  const applyCustomColors = (colors: Record<string, string>) => {
    setCustomColors(prev => ({ ...prev, ...colors }));
  };

  // Reset theme to defaults
  const resetTheme = () => {
    setCustomColors({});
    setTheme(defaultTheme);
    
    // Clear custom CSS properties
    const root = document.documentElement;
    Object.keys(customColors).forEach(key => {
      root.style.removeProperty(`--${key}`);
    });
  };

  // Export theme configuration
  const exportTheme = (): string => {
    const config = {
      theme,
      customColors,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
    return JSON.stringify(config, null, 2);
  };

  // Import theme configuration
  const importTheme = (themeConfig: string) => {
    try {
      const config = JSON.parse(themeConfig);
      if (config.theme && ['light', 'dark', 'system', 'executive-light', 'executive-dark'].includes(config.theme)) {
        setTheme(config.theme);
      }
      if (config.customColors && typeof config.customColors === 'object') {
        setCustomColors(config.customColors);
      }
    } catch (error) {
      console.error('Failed to import theme configuration:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
      tokens,
      applyCustomColors,
      resetTheme,
      exportTheme,
      importTheme,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Utility functions
export const getColorValue = (colorToken: string): string => {
  return `oklch(var(--${colorToken}))`;
};

export const getCSSCustomProperty = (property: string): string => {
  if (typeof window !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${property}`).trim();
  }
  return '';
};

export const setCSSCustomProperty = (property: string, value: string): void => {
  if (typeof window !== 'undefined') {
    document.documentElement.style.setProperty(`--${property}`, value);
  }
};

// Theme presets for quick switching
export const THEME_PRESETS = {
  light: {
    name: 'Light',
    description: 'Clean light theme for daily use',
    value: 'light' as const,
  },
  dark: {
    name: 'Dark',
    description: 'Dark theme for reduced eye strain',
    value: 'dark' as const,
  },
  'executive-light': {
    name: 'Executive Light',
    description: 'Professional light theme for executive dashboards',
    value: 'executive-light' as const,
  },
  'executive-dark': {
    name: 'Executive Dark',
    description: 'Professional dark theme for presentations',
    value: 'executive-dark' as const,
  },
  system: {
    name: 'System',
    description: 'Follow system preference',
    value: 'system' as const,
  },
} as const;

// Color utilities for executive themes
export const EXECUTIVE_COLORS = {
  status: {
    healthy: 'oklch(0.646 0.222 142.086)',
    warning: 'oklch(0.84 0.16 84)',
    critical: 'oklch(0.577 0.245 27.325)',
    neutral: 'oklch(0.7 0.015 264.5)',
  },
  chart: {
    1: 'oklch(0.646 0.222 41.116)',   // Warm orange
    2: 'oklch(0.6 0.118 184.704)',    // Ocean blue
    3: 'oklch(0.398 0.07 227.392)',   // Deep purple
    4: 'oklch(0.828 0.189 84.429)',   // Bright green
    5: 'oklch(0.769 0.188 70.08)',    // Golden yellow
  },
  executive: {
    navy: 'oklch(0.21 0.034 264.665)',     // Primary executive color
    steel: 'oklch(0.551 0.027 264.364)',   // Secondary executive color
    platinum: 'oklch(0.928 0.006 264.531)', // Accent executive color
  },
} as const;