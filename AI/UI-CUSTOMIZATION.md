# UI Customization & Theming

## Design System

### Color Palette

#### **Primary Colors**
```css
:root {
  /* Primary Purple */
  --color-primary-50: #f3e8ff;
  --color-primary-100: #e9d5ff;
  --color-primary-200: #d8b4fe;
  --color-primary-300: #c084fc;
  --color-primary-400: #a855f7;
  --color-primary-500: #9333ea;
  --color-primary-600: #7c3aed;
  --color-primary-700: #6d28d9;
  --color-primary-800: #5b21b6;
  --color-primary-900: #4c1d95;

  /* Secondary Teal */
  --color-secondary-50: #f0fdfa;
  --color-secondary-100: #ccfbf1;
  --color-secondary-200: #99f6e4;
  --color-secondary-300: #5eead4;
  --color-secondary-400: #2dd4bf;
  --color-secondary-500: #14b8a6;
  --color-secondary-600: #0d9488;
  --color-secondary-700: #0f766e;
  --color-secondary-800: #115e59;
  --color-secondary-900: #134e4a;
}
```

#### **Semantic Colors**
```css
:root {
  /* Success */
  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;

  /* Warning */
  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-warning-700: #b45309;

  /* Error */
  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;

  /* Info */
  --color-info-50: #eff6ff;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
  --color-info-700: #1d4ed8;
}
```

### Typography

#### **Font Stack**
```css
:root {
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-family-display: 'Poppins', 'Inter', sans-serif;
}
```

#### **Font Sizes**
```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
}
```

#### **Line Heights**
```css
:root {
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### Spacing System

#### **Spacing Scale**
```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  --space-32: 8rem;     /* 128px */
}
```

### Border Radius

#### **Radius Scale**
```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-base: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-3xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
}
```

### Shadows

#### **Shadow System**
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

## Theme System

### Light Theme
```css
[data-theme="light"] {
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-surface-elevated: #ffffff;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-tertiary: #94a3b8;
  --color-border: #e2e8f0;
  --color-border-strong: #cbd5e1;
}
```

### Dark Theme
```css
[data-theme="dark"] {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-surface-elevated: #334155;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #cbd5e1;
  --color-text-tertiary: #94a3b8;
  --color-border: #334155;
  --color-border-strong: #475569;
}
```

### Theme Implementation

#### **Theme Provider**
```tsx
// src/renderer/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
    } else {
      root.setAttribute('data-theme', theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

#### **Theme Toggle Component**
```tsx
// src/renderer/components/ThemeToggle.tsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Icon } from './Icon';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return 'Sun';
      case 'dark':
        return 'Moon';
      case 'system':
        return 'Monitor';
      default:
        return 'Sun';
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
    >
      <Icon name={getIcon()} size={20} />
    </button>
  );
};
```

## Component Customization

### Button Variants

#### **Button Component**
```tsx
// src/renderer/components/Button.tsx
import React from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && 'opacity-50 cursor-not-allowed',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Icon name="Loader" size={16} className="mr-2 animate-spin" />}
      {children}
    </button>
  );
};
```

### Card Components

#### **Card Component**
```tsx
// src/renderer/components/Card.tsx
import React from 'react';
import { cn } from '../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'rounded-lg transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-surface border border-border',
    elevated: 'bg-surface-elevated shadow-md hover:shadow-lg',
    outlined: 'bg-transparent border-2 border-border-strong'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

### Form Components

#### **Input Component**
```tsx
// src/renderer/components/Input.tsx
import React from 'react';
import { cn } from '../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: string;
  rightIcon?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon name={leftIcon} size={16} className="text-text-tertiary" />
          </div>
        )}
        
        <input
          className={cn(
            'w-full px-3 py-2 border rounded-lg transition-colors',
            'bg-surface text-text-primary placeholder-text-tertiary',
            'border-border focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Icon name={rightIcon} size={16} className="text-text-tertiary" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      
      {helper && !error && (
        <p className="text-sm text-text-secondary">{helper}</p>
      )}
    </div>
  );
};
```

## Animation System

### Transition Classes
```css
/* src/renderer/styles/animations.css */
.transition-fast {
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

.transition-normal {
  transition-duration: 250ms;
  transition-timing-function: ease-out;
}

.transition-slow {
  transition-duration: 350ms;
  transition-timing-function: ease-out;
}

/* Hover animations */
.hover-lift {
  transition: transform 150ms ease-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale {
  transition: transform 150ms ease-out;
}

.hover-scale:hover {
  transform: scale(1.05);
}

/* Loading animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-spin { animation: spin 1s linear infinite; }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
.animate-bounce { animation: bounce 1s infinite; }
```

### Framer Motion Integration
```tsx
// src/renderer/components/AnimatedCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2 }}
      className="card"
    >
      {children}
    </motion.div>
  );
};
```

## Responsive Design

### Breakpoints
```css
/* src/renderer/styles/responsive.css */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

@media (max-width: 639px) {
  .mobile-only { display: block; }
  .desktop-only { display: none; }
}

@media (min-width: 640px) {
  .mobile-only { display: none; }
  .desktop-only { display: block; }
}
```

### Layout Components
```tsx
// src/renderer/components/ResponsiveLayout.tsx
import React from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  mobile?: React.ReactNode;
  desktop?: React.ReactNode;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  mobile,
  desktop
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (isMobile && mobile) {
    return <>{mobile}</>;
  }
  
  if (!isMobile && desktop) {
    return <>{desktop}</>;
  }
  
  return <>{children}</>;
};
```

## Accessibility

### Focus Management
```css
/* src/renderer/styles/focus.css */
.focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.focus-ring {
  box-shadow: 0 0 0 2px var(--color-primary-500);
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .focus-visible {
    outline-width: 3px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Support
```tsx
// src/renderer/components/AccessibleButton.tsx
import React from 'react';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  loading = false,
  loadingText = 'Loading...',
  children,
  ...props
}) => {
  return (
    <button
      {...props}
      aria-disabled={loading}
      aria-describedby={loading ? 'loading-text' : undefined}
    >
      {loading && (
        <span id="loading-text" className="sr-only">
          {loadingText}
        </span>
      )}
      {children}
    </button>
  );
};
```

## Performance Optimization

### CSS Optimization
```css
/* Use CSS custom properties for better performance */
:root {
  --transition-fast: 150ms ease-out;
  --transition-normal: 250ms ease-out;
  --transition-slow: 350ms ease-out;
}

/* Use transform instead of changing layout properties */
.hover-lift {
  transition: transform var(--transition-fast);
}

.hover-lift:hover {
  transform: translateY(-2px);
}

/* Use will-change sparingly */
.animate-element {
  will-change: transform;
}
```

### Component Optimization
```tsx
// src/renderer/components/OptimizedCard.tsx
import React, { memo } from 'react';

interface OptimizedCardProps {
  title: string;
  content: string;
  onClick: () => void;
}

export const OptimizedCard = memo<OptimizedCardProps>(({ title, content, onClick }) => {
  return (
    <div onClick={onClick} className="card">
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
});

OptimizedCard.displayName = 'OptimizedCard';
```

This comprehensive UI customization system provides a solid foundation for creating a beautiful, accessible, and performant LifeOS application with custom theming, components, and animations.
