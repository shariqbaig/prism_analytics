/**
 * Theme Switcher Component
 * Provides UI for switching between different themes with executive presets
 */

import React from 'react';
import { Monitor, Moon, Sun, Briefcase, Settings } from 'lucide-react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { useTheme, THEME_PRESETS, type Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

interface ThemeSwitcherProps {
  className?: string;
  variant?: 'icon' | 'button' | 'compact';
}

const ThemeIcon = ({ theme, className }: { theme: Theme; className?: string }) => {
  switch (theme) {
    case 'light':
      return <Sun className={className} />;
    case 'dark':
      return <Moon className={className} />;
    case 'executive-light':
    case 'executive-dark':
      return <Briefcase className={className} />;
    case 'system':
    default:
      return <Monitor className={className} />;
  }
};

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className,
  variant = 'icon'
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex gap-1 p-1 bg-muted rounded-lg', className)}>
        {Object.entries(THEME_PRESETS).map(([key, preset]) => (
          <Button
            key={key}
            variant={theme === preset.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleThemeChange(preset.value)}
            className="h-8 w-8 p-0"
            title={preset.description}
          >
            <ThemeIcon theme={preset.value} className="h-4 w-4" />
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const themes: Theme[] = ['light', 'dark', 'executive-light', 'executive-dark', 'system'];
          const currentIndex = themes.indexOf(theme);
          const nextTheme = themes[(currentIndex + 1) % themes.length];
          handleThemeChange(nextTheme);
        }}
        className={className}
      >
        <ThemeIcon theme={theme} className="h-4 w-4 mr-2" />
        {THEME_PRESETS[theme]?.name || 'Theme'}
      </Button>
    );
  }

  // Default: icon dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('h-8 w-8 px-0', className)}
          title="Switch theme"
        >
          <ThemeIcon theme={theme} className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-semibold">
          Theme Settings
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Standard Themes */}
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Standard
        </DropdownMenuLabel>
        {(['light', 'dark', 'system'] as const).map((themeOption) => {
          const preset = THEME_PRESETS[themeOption];
          return (
            <DropdownMenuItem
              key={themeOption}
              onClick={() => handleThemeChange(themeOption)}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                theme === themeOption && 'bg-accent text-accent-foreground'
              )}
            >
              <ThemeIcon theme={themeOption} className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{preset.name}</div>
                <div className="text-xs text-muted-foreground">{preset.description}</div>
              </div>
              {theme === themeOption && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        {/* Executive Themes */}
        <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
          Executive
        </DropdownMenuLabel>
        {(['executive-light', 'executive-dark'] as const).map((themeOption) => {
          const preset = THEME_PRESETS[themeOption];
          return (
            <DropdownMenuItem
              key={themeOption}
              onClick={() => handleThemeChange(themeOption)}
              className={cn(
                'flex items-center gap-2 cursor-pointer',
                theme === themeOption && 'bg-accent text-accent-foreground'
              )}
            >
              <ThemeIcon theme={themeOption} className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{preset.name}</div>
                <div className="text-xs text-muted-foreground">{preset.description}</div>
              </div>
              {theme === themeOption && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-muted-foreground">
          <Settings className="h-4 w-4 mr-2" />
          Current: {resolvedTheme === 'light' ? 'Light' : 'Dark'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Quick theme toggle button for header/toolbar
export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('executive-light');
    } else if (theme === 'executive-light') {
      setTheme('executive-dark');
    } else {
      setTheme('light');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className={cn('h-8 w-8 px-0', className)}
      title={`Switch to next theme (current: ${THEME_PRESETS[theme]?.name || theme})`}
    >
      <ThemeIcon theme={theme} className="h-4 w-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

// Theme status indicator for debugging/development
export const ThemeStatus: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, resolvedTheme, systemTheme } = useTheme();
  
  return (
    <div className={cn('text-xs text-muted-foreground space-y-1', className)}>
      <div>Theme: {theme}</div>
      <div>Resolved: {resolvedTheme}</div>
      {theme === 'system' && <div>System: {systemTheme}</div>}
    </div>
  );
};