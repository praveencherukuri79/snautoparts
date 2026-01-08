# SN Auto Parts - React UI Guidelines

> **Single source of truth** for React frontend architecture, component design, theming, and implementation standards.

---

## ⚠️ CRITICAL RULES (READ FIRST)

1. **NO INLINE SVGs** - All SVGs must be in `src/assets/icons/` and imported
2. **NO HARDCODED COLORS** - Use theme colors only (`primary.main`, `text.muted`, `background.surfaceDark`, etc.)
3. **USE MUI COMPONENTS** - Use Box, Stack, Typography, not raw HTML (div, span, p, h1)
4. **USE react-hook-form** - For all forms
5. **IMAGES FROM CONFIG** - All image URLs in `src/config/images.ts`
6. **MINIMAL sx PROPS** - Use theme, primitives first; sx only for layout (spacing, flex)
7. **UX MOCKUPS = REFERENCE ONLY** - Don't replicate exactly, take best guess
8. **KEEP COMPONENTS MINIMAL** - Simple, focused, small files
9. **USE GLOBAL UTILITY CSS** - Use existing utility classes from `globals.css` (flex, gap-4, text-muted, etc.), NOT page-specific CSS classes
10. **NO PAGE-SPECIFIC CSS** - Never create `.auth-*`, `.login-*`, `.dashboard-*` classes. Use MUI + utility classes only

### Auth Page Layout Rules

1. **Social login buttons at BOTTOM** - After the form, after divider, before "Sign up/Sign in" link
2. **NO vertical border/divider** between hero image section and form section
3. **Header "Return to Shop" button** - Use `ArrowBack` icon, styled with `rgba(249, 115, 22, 0.1)` bg and `primary.main` text
4. **Logo must be visible** - Use `color: 'primary.main'` on LogoIcon component

### Theme Color Reference

```typescript
// Background colors
'background.surfaceDark'  // #181411 - main dark bg
'background.inputDark'    // #27201b - input bg on dark
'background.dark'         // #23170f - darker bg

// Text colors  
'common.white'            // #ffffff
'text.muted'              // #bba89b - muted text on dark
'text.primary'            // #181411 - primary text on light
'text.secondary'          // #8c725f

// Border colors
'border.dark'             // #55453a - borders on dark bg
'border.light'            // #e6dfdb - borders on light bg

// Semantic colors
'primary.main'            // #f97415 - brand orange
'error.main'              // #dc2626
'error.light'             // #fee2e2 - error bg
'success.main'            // #16a34a
```

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Theme System](#3-theme-system)
4. [Component Architecture](#4-component-architecture)
5. [Primitive Components](#5-primitive-components)
6. [Layout Components](#6-layout-components)
7. [Styling Guidelines](#7-styling-guidelines)
8. [State Management](#8-state-management)
9. [API Integration](#9-api-integration)
10. [Utility Functions](#10-utility-functions)
11. [Design Tokens](#11-design-tokens)
12. [Accessibility](#12-accessibility)

---

## 1. Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18+ | Component framework |
| Vite | Build tool & dev server |
| TypeScript | Type safety |
| MUI (Material-UI) v5+ | UI component library |
| Recoil | Global state management |
| React Router v6 | Routing |
| Day.js | Date/time manipulation |
| Axios | HTTP client |

### Why These Choices?

- **Vite**: Fast HMR, optimized builds, native ESM support
- **MUI**: Comprehensive component library with built-in theming
- **Recoil**: Simple, flexible state management with React-like API
- **Day.js**: Lightweight alternative to Moment.js (2KB vs 67KB)

---

## 2. Project Structure

```
frontend-react/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component with providers
│   ├── vite-env.d.ts
│   │
│   ├── assets/                     # Static assets
│   │   ├── images/                 # Image files (png, jpg, webp)
│   │   ├── icons/                  # SVG icon files
│   │   │   ├── logo.svg
│   │   │   ├── google.svg
│   │   │   └── ...
│   │   └── fonts/                  # Custom fonts (if any)
│   │
│   ├── config/                     # App configuration
│   │   ├── index.ts
│   │   ├── env.ts                  # Environment variables
│   │   └── routes.ts               # Route definitions
│   │
│   ├── theme/                      # MUI theme configuration
│   │   ├── index.ts                # Theme exports
│   │   ├── palette.ts              # Color palette
│   │   ├── typography.ts           # Typography settings
│   │   ├── components.ts           # Component overrides
│   │   ├── lightTheme.ts           # Light theme
│   │   ├── darkTheme.ts            # Dark theme
│   │   └── ThemeProvider.tsx       # Theme context provider
│   │
│   ├── styles/                     # Global CSS
│   │   ├── globals.css             # Global styles & CSS variables
│   │   ├── reset.css               # CSS reset
│   │   └── utilities.css           # Utility classes
│   │
│   ├── primitives/                 # Base UI components (atomic)
│   │   ├── index.ts
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Checkbox/
│   │   ├── Radio/
│   │   ├── Switch/
│   │   ├── Badge/
│   │   ├── Chip/
│   │   ├── Avatar/
│   │   ├── IconButton/
│   │   ├── Card/
│   │   ├── Dialog/
│   │   ├── Drawer/
│   │   ├── Menu/
│   │   ├── Tooltip/
│   │   ├── Snackbar/
│   │   ├── Skeleton/
│   │   ├── Spinner/
│   │   ├── Divider/
│   │   ├── Paper/
│   │   └── Typography/
│   │
│   ├── components/                 # Composite/shared components
│   │   ├── index.ts
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Sidebar/
│   │   ├── SearchBar/
│   │   ├── ProductCard/
│   │   ├── FitmentSelector/
│   │   ├── CategoryCard/
│   │   ├── DataTable/
│   │   ├── Pagination/
│   │   ├── EmptyState/
│   │   ├── LoadingState/
│   │   ├── ErrorBoundary/
│   │   ├── QuantitySelector/
│   │   ├── PriceDisplay/
│   │   ├── RatingStars/
│   │   ├── Breadcrumbs/
│   │   └── StatCard/
│   │
│   ├── layouts/                    # Page layouts
│   │   ├── index.ts
│   │   ├── MainLayout/             # Customer-facing layout
│   │   ├── DashboardLayout/        # Manager/Admin layout
│   │   └── AuthLayout/             # Login/Register layout
│   │
│   ├── features/                   # Feature modules (pages)
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── home/
│   │   ├── catalog/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── account/
│   │   ├── orders/
│   │   ├── dashboard/
│   │   ├── inventory/
│   │   ├── products/
│   │   ├── users/
│   │   ├── settings/
│   │   └── reports/
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── index.ts
│   │   ├── useAuth.ts
│   │   ├── useFeatureConfig.ts
│   │   ├── useCart.ts
│   │   ├── useApi.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   └── useNotification.ts
│   │
│   ├── state/                      # Recoil state management
│   │   ├── index.ts
│   │   ├── atoms/
│   │   │   ├── authAtom.ts
│   │   │   ├── cartAtom.ts
│   │   │   ├── themeAtom.ts
│   │   │   ├── featureConfigAtom.ts
│   │   │   └── notificationAtom.ts
│   │   └── selectors/
│   │       ├── authSelectors.ts
│   │       └── cartSelectors.ts
│   │
│   ├── services/                   # API services
│   │   ├── index.ts
│   │   ├── api.ts                  # Axios instance & interceptors
│   │   ├── authService.ts
│   │   ├── catalogService.ts
│   │   ├── cartService.ts
│   │   ├── orderService.ts
│   │   ├── userService.ts
│   │   └── inventoryService.ts
│   │
│   ├── types/                      # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   ├── cart.types.ts
│   │   ├── user.types.ts
│   │   └── featureConfig.types.ts
│   │
│   └── utils/                      # Utility functions
│       ├── index.ts
│       ├── formatters.ts           # Number, currency, date formatting
│       ├── validators.ts           # Form validation helpers
│       ├── storage.ts              # LocalStorage helpers
│       ├── constants.ts            # App constants
│       └── helpers.ts              # General helpers
│
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── .env
├── .env.example
└── React_UI_guideline.md           # This file
```

---

## 3. Theme System

### 3.1 Design Tokens (from Stitch designs)

```typescript
// Colors
const palette = {
  primary: {
    main: '#f97415',      // Orange - brand color
    dark: '#d85e0b',      // Darker orange for hover states
    light: '#ffb380',     // Light orange
    contrastText: '#ffffff',
  },
  background: {
    default: '#f8f7f5',   // Light cream background
    paper: '#ffffff',      // White surfaces
    dark: '#23170f',       // Dark brown (dark mode)
    header: '#1a1a2e',     // Dark header background
  },
  text: {
    primary: '#181411',    // Near-black
    secondary: '#8c725f',  // Muted brown
    disabled: '#bba89b',   // Light muted
  },
  border: {
    light: '#e6dfdb',      // Light border
    dark: '#55453a',       // Dark mode border
  },
  status: {
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#dc2626',
    info: '#0284c7',
  },
};

// Typography
const typography = {
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  h1: { fontSize: '3rem', fontWeight: 900, lineHeight: 1.2 },
  h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
  h3: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.4 },
  h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
  h6: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.5 },
  body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5 },
  body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
  caption: { fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.5 },
};

// Spacing (8px base)
const spacing = 8; // 1 unit = 8px

// Border Radius
const borderRadius = {
  xs: '0.25rem',   // 4px
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  full: '9999px',  // Pill shape
};

// Shadows
const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
};
```

### 3.2 Multi-Theme Support

The app supports multiple themes switchable at runtime:

1. **Light Theme** - Default customer-facing theme
2. **Dark Theme** - Dark mode variant
3. **High Contrast** - Accessibility theme (optional)

Theme is stored in Recoil state and persisted to localStorage.

```typescript
// Theme atom
export const themeAtom = atom<'light' | 'dark'>({
  key: 'theme',
  default: 'light',
  effects: [localStorageEffect('theme')],
});
```

---

## 4. Component Architecture

### 4.1 Component Categories

1. **Primitives** - Atomic UI elements (Button, Input, Card)
   - Highly reusable
   - Props-driven variants
   - No business logic
   
2. **Components** - Composite/shared components (ProductCard, Header)
   - Combine primitives
   - May have some domain knowledge
   - Reusable across features

3. **Feature Components** - Page-specific components
   - Feature/domain specific
   - May use hooks for data fetching
   - Located in feature folders

### 4.2 Component Template

```typescript
// primitives/Button/Button.tsx
import { forwardRef } from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'text' | 'danger';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, disabled, children, ...props }, ref) => {
    // Map custom variants to MUI variants
    const muiVariant = variant === 'text' ? 'text' : 
                       variant === 'outlined' ? 'outlined' : 'contained';
    
    const color = variant === 'danger' ? 'error' : 
                  variant === 'secondary' ? 'secondary' : 'primary';

    return (
      <MuiButton
        ref={ref}
        variant={muiVariant}
        color={color}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? <CircularProgress size={20} /> : children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';
```

### 4.3 Props Design Principles

1. **Sensible defaults** - Components work out of the box
2. **Composition over configuration** - Use children prop for flexibility
3. **Forward refs** - Allow parent components to access DOM elements
4. **Spread remaining props** - Allow all native HTML attributes
5. **Consistent naming** - Use `on*` for event handlers, `is*`/`has*` for booleans

---

## 5. Primitive Components

### 5.1 Component List with Props

| Component | Key Props |
|-----------|-----------|
| **Button** | `variant`, `size`, `loading`, `startIcon`, `endIcon`, `fullWidth` |
| **IconButton** | `variant`, `size`, `color` |
| **Input** | `label`, `error`, `helperText`, `startAdornment`, `endAdornment` |
| **Select** | `label`, `options`, `multiple`, `error`, `helperText` |
| **Checkbox** | `label`, `checked`, `indeterminate`, `error` |
| **Radio** | `label`, `value`, `checked` |
| **Switch** | `label`, `checked`, `size` |
| **Badge** | `variant`, `color`, `content`, `max`, `invisible` |
| **Chip** | `variant`, `color`, `size`, `onDelete`, `avatar`, `icon` |
| **Avatar** | `src`, `alt`, `size`, `variant`, `fallback` |
| **Card** | `variant`, `elevation`, `hover` |
| **Dialog** | `open`, `title`, `actions`, `maxWidth`, `fullScreen` |
| **Drawer** | `open`, `anchor`, `variant` |
| **Menu** | `anchorEl`, `open`, `items` |
| **Tooltip** | `title`, `placement`, `arrow` |
| **Snackbar** | `open`, `message`, `severity`, `autoHideDuration` |
| **Skeleton** | `variant`, `width`, `height`, `animation` |
| **Spinner** | `size`, `color` |
| **Typography** | `variant`, `color`, `align`, `noWrap`, `gutterBottom` |
| **Divider** | `orientation`, `variant`, `textAlign` |
| **Paper** | `elevation`, `variant`, `square` |

### 5.2 Button Variants (from designs)

```typescript
// Primary - Main CTA (orange)
<Button variant="primary">Shop Now</Button>

// Secondary - Secondary actions
<Button variant="secondary">View Deals</Button>

// Outlined - Tertiary actions
<Button variant="outlined">Return to Shop</Button>

// Text - Minimal emphasis
<Button variant="text">Learn More</Button>

// Danger - Destructive actions
<Button variant="danger">Delete</Button>
```

### 5.3 Input Variants

```typescript
// Standard input with label
<Input label="Email Address" placeholder="name@example.com" />

// With validation error
<Input label="Password" error helperText="Password is required" />

// With icons/adornments
<Input 
  label="Search" 
  startAdornment={<SearchIcon />}
  placeholder="Search parts..."
/>

// Dark variant (for dark backgrounds)
<Input variant="dark" label="Email" />
```

---

## 6. Layout Components

### 6.1 MainLayout (Customer-facing)

```
┌─────────────────────────────────────────────┐
│                  Header                      │
│  [Logo]  [Search]  [Nav Links]  [Cart][User]│
├─────────────────────────────────────────────┤
│                                             │
│                 Content                      │
│              (Outlet/children)               │
│                                             │
├─────────────────────────────────────────────┤
│                  Footer                      │
│   [Links]  [Social]  [Newsletter]  [Legal]  │
└─────────────────────────────────────────────┘
```

### 6.2 DashboardLayout (Manager/Admin)

```
┌────────┬────────────────────────────────────┐
│        │            Top Bar                 │
│        │  [Search]  [Date]  [User Menu]     │
│  Side  ├────────────────────────────────────┤
│  bar   │                                    │
│        │           Content                  │
│ [Nav]  │        (Outlet/children)           │
│ [Nav]  │                                    │
│ [Nav]  │                                    │
│        │                                    │
├────────┤                                    │
│[Profile]                                    │
└────────┴────────────────────────────────────┘
```

### 6.3 AuthLayout (Login/Register)

```
┌─────────────────────────────────────────────┐
│              [Logo]  [Back to Shop]         │
├─────────────────┬───────────────────────────┤
│                 │                           │
│   Hero Image    │      Auth Form            │
│   with overlay  │   [Form Fields]           │
│   and text      │   [Submit Button]         │
│                 │   [Social Login]          │
│                 │   [Links]                 │
│                 │                           │
└─────────────────┴───────────────────────────┘
```

---

## 7. Styling Guidelines

### 7.1 CSS Strategy

| Level | Where | Purpose |
|-------|-------|---------|
| **Global CSS** | `styles/globals.css` | CSS variables, base styles, resets |
| **Theme** | MUI theme | Component defaults, palette, typography |
| **Utility CSS** | `styles/utilities.css` | Common utility classes (Tailwind-like) |
| **Page CSS** | `styles/pages/*.css` | Page-specific reusable classes |
| **Component CSS** | Inline sx prop | Component-specific overrides (**LAST RESORT**) |

### 7.2 Rules

1. **Global First** - Put common styles in global CSS
2. **Use Theme** - Leverage MUI theme for consistency
3. **Use Primitives** - Use primitive components instead of raw MUI + sx
4. **Minimal sx Props** - Only for truly one-off positioning (mt, mb, gap)
5. **CSS Variables** - Use for dynamic values (theme switching)
6. **No Inline Colors** - Use theme colors or CSS variables
7. **No Magic Numbers** - Use spacing scale (1, 2, 3...) not pixels

### 7.3 SVG Icons

**SVG icons MUST be in separate files, NOT inline in components.**

```
src/assets/icons/
├── logo.svg
├── google.svg  
├── apple.svg
├── lock.svg
├── verified.svg
├── shipping.svg
└── index.ts     # Re-exports all icons
```

```typescript
// assets/icons/index.ts
export { ReactComponent as LogoIcon } from './logo.svg';
export { ReactComponent as GoogleIcon } from './google.svg';
// OR use as img src:
export { default as logoUrl } from './logo.svg';
```

**Usage:**
```tsx
// ✅ Good - Import from assets
import { GoogleIcon } from '@/assets/icons';
<GoogleIcon className="icon-md" />

// ❌ Bad - Inline SVG in component
<svg viewBox="0 0 24 24">...</svg>
```

### 7.4 Design Reference Usage

**UX mockups (Stitch designs) are REFERENCE ONLY - do not exactly replicate.**

- ✅ Use mockups for layout structure and flow
- ✅ Use mockups for feature requirements  
- ✅ Take best guess for colors, spacing
- ❌ Don't copy exact pixel values
- ❌ Don't replicate every visual detail
- ❌ Don't add unnecessary decorative elements

**Keep pages simple and functional first. Polish later.**

### 7.5 Global CSS Structure

```css
/* globals.css */

/* CSS Custom Properties (Theme Variables) */
:root {
  /* Colors */
  --color-primary: #f97415;
  --color-primary-dark: #d85e0b;
  --color-background: #f8f7f5;
  --color-surface: #ffffff;
  --color-text-primary: #181411;
  --color-text-secondary: #8c725f;
  --color-border: #e6dfdb;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}

/* Dark Theme Variables */
[data-theme="dark"] {
  --color-background: #23170f;
  --color-surface: #181411;
  --color-text-primary: #ffffff;
  --color-text-secondary: #bba89b;
  --color-border: #55453a;
}

/* Base Styles */
*, *::before, *::after {
  box-sizing: border-box;
}

html {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  background-color: var(--color-background);
  color: var(--color-text-primary);
}
```

---

## 8. State Management

### 8.1 Recoil Atoms

```typescript
// Auth State
export const authAtom = atom<AuthState>({
  key: 'auth',
  default: {
    isAuthenticated: false,
    user: null,
    featureConfig: null,
  },
});

// Cart State
export const cartAtom = atom<CartState>({
  key: 'cart',
  default: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  },
});

// Theme State
export const themeAtom = atom<'light' | 'dark'>({
  key: 'theme',
  default: 'light',
  effects: [localStorageEffect('sn-theme')],
});

// Notification State
export const notificationAtom = atom<Notification | null>({
  key: 'notification',
  default: null,
});
```

### 8.2 When to Use What

| State Type | Where |
|------------|-------|
| Server state | React Query / SWR (future) or component state |
| Global UI state | Recoil (theme, notifications) |
| Auth state | Recoil (persisted) |
| Cart state | Recoil (persisted) |
| Form state | Component local state / react-hook-form |
| URL state | React Router (searchParams) |

---

## 9. API Integration

### 9.1 API Service Structure

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true, // For session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 9.2 Service Example

```typescript
// services/catalogService.ts
import api from './api';
import { Product, ProductListParams, PaginatedResponse } from '@/types';

export const catalogService = {
  getProducts: (params: ProductListParams) => 
    api.get<PaginatedResponse<Product>>('/products', { params }),
  
  getProduct: (id: string) => 
    api.get<Product>(`/products/${id}`),
  
  searchProducts: (query: string) => 
    api.get<Product[]>('/products/search', { params: { q: query } }),
};
```

---

## 10. Utility Functions

### 10.1 Formatters

```typescript
// utils/formatters.ts
import dayjs from 'dayjs';

// Currency formatting
export const formatCurrency = (
  amount: number, 
  currency = 'USD'
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Date formatting
export const formatDate = (
  date: string | Date, 
  format = 'MMM D, YYYY'
): string => {
  return dayjs(date).format(format);
};

// Relative time
export const formatRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

// Number formatting
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Phone formatting
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

// SKU formatting
export const formatSku = (sku: string): string => {
  return sku.toUpperCase().trim();
};
```

### 10.2 Validators

```typescript
// utils/validators.ts
export const validators = {
  email: (value: string): boolean => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  
  phone: (value: string): boolean =>
    /^\+?[\d\s-()]{10,}$/.test(value),
  
  password: (value: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (value.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(value)) errors.push('One uppercase letter');
    if (!/[a-z]/.test(value)) errors.push('One lowercase letter');
    if (!/[0-9]/.test(value)) errors.push('One number');
    return { valid: errors.length === 0, errors };
  },
  
  required: (value: unknown): boolean => 
    value !== null && value !== undefined && value !== '',
  
  minLength: (value: string, min: number): boolean => 
    value.length >= min,
  
  maxLength: (value: string, max: number): boolean => 
    value.length <= max,
};
```

### 10.3 Helpers

```typescript
// utils/helpers.ts

// Class name utility (like clsx)
export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Debounce function
export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Deep clone
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Truncate text
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Get initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
```

---

## 11. Design Tokens

### Color Usage Guidelines

| Use Case | Color Token |
|----------|-------------|
| Primary CTA buttons | `primary.main` (#f97415) |
| Primary button hover | `primary.dark` (#d85e0b) |
| Page backgrounds | `background.default` (#f8f7f5) |
| Card/surface backgrounds | `background.paper` (#ffffff) |
| Header/sidebar backgrounds | `background.header` (#1a1a2e) |
| Primary text | `text.primary` (#181411) |
| Secondary/muted text | `text.secondary` (#8c725f) |
| Success states | `success.main` (#16a34a) |
| Error states | `error.main` (#dc2626) |
| Warning states | `warning.main` (#f59e0b) |
| Borders | `border.light` (#e6dfdb) |

### Spacing Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `spacing(0.5)` | 4px | Tight spacing (icon gaps) |
| `spacing(1)` | 8px | Default small spacing |
| `spacing(2)` | 16px | Medium spacing |
| `spacing(3)` | 24px | Section padding |
| `spacing(4)` | 32px | Large spacing |
| `spacing(5)` | 40px | Extra large spacing |
| `spacing(6)` | 48px | Page sections |
| `spacing(8)` | 64px | Major sections |

---

## 12. Accessibility

### Requirements

1. **Keyboard Navigation** - All interactive elements focusable
2. **Color Contrast** - Minimum 4.5:1 for normal text
3. **Focus Indicators** - Visible focus rings
4. **Screen Reader Support** - Proper ARIA labels
5. **Reduced Motion** - Respect `prefers-reduced-motion`

### Implementation

```typescript
// All buttons must have accessible text
<Button aria-label="Add to cart">
  <CartIcon />
</Button>

// Form inputs must have labels
<Input 
  id="email"
  label="Email Address"
  aria-describedby="email-helper"
/>
<FormHelperText id="email-helper">We'll never share your email</FormHelperText>

// Icons should be decorative or have alt text
<Icon aria-hidden="true" /> // Decorative
<Icon aria-label="Settings" role="img" /> // Meaningful
```

---

## Appendix: File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `Button.tsx`, `ProductCard.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts`, `useCart.ts` |
| Utils | camelCase | `formatters.ts`, `helpers.ts` |
| Types | PascalCase with `.types.ts` | `product.types.ts` |
| Constants | SCREAMING_SNAKE_CASE | `API_ENDPOINTS` |
| CSS files | kebab-case | `globals.css` |

---

*Last updated: January 2026*
