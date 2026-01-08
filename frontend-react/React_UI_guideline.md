# SN Auto Parts - React UI Guidelines

> **Single source of truth** for React frontend architecture, component design, theming, and implementation standards.

---

## ⚠️ CRITICAL RULES (READ FIRST)

1. **NO INLINE SVGs** - All SVGs must be in `src/assets/icons/` and imported
2. **NO HARDCODED COLORS** - Use theme colors only (`primary.main`, `text.muted`, `background.surfaceDark`, etc.)
3. **USE PRIMITIVES FIRST** - Always check `src/primitives/` before using MUI components directly (e.g., use `Avatar` from primitives, not MUI)
4. **USE MUI COMPONENTS** - Use Box, Stack, Typography, not raw HTML (div, span, p, h1)
5. **USE react-hook-form** - For all forms
6. **IMAGES FROM CONFIG** - All image URLs in `src/config/images.ts`
7. **MINIMAL sx PROPS** - Use theme, primitives first; sx only for layout (spacing, flex)
8. **UX MOCKUPS = REFERENCE ONLY** - Don't replicate exactly, take best guess
9. **KEEP COMPONENTS MINIMAL** - Simple, focused, small files
10. **USE GLOBAL UTILITY CSS** - Use existing utility classes from `globals.css` (flex, gap-4, text-muted, etc.), NOT page-specific CSS classes
11. **NO PAGE-SPECIFIC CSS** - Never create `.auth-*`, `.login-*`, `.dashboard-*` classes. Use MUI + utility classes only
12. **CREATE REUSABLE COMPONENTS** - Extract repetitive patterns into reusable components in `src/components/`. Avoid complex inline `sx` props
13. **MOCK DATA CENTRALIZED** - All mock data in `src/services/mockData.ts` with env toggle `VITE_ENABLE_MOCK_DATA`
14. **ALWAYS USE API SERVICES** - Never use `console.log()` for form submissions. Always call proper API services with loading/error states
15. **UPDATE RECOIL STATE** - After successful auth API calls, MUST update Recoil authAtom with user data
16. **INITIALIZE AUTH FROM LOCALSTORAGE** - App MUST restore auth state from localStorage on load (use AuthInitializer pattern)
17. **USE PROPER MODELS** - ALWAYS use types from `src/models/*.model.ts` (generated from swagger). Never create duplicate custom types
18. **DON'T CREATE UNNECESSARY FILES** - No extra README files. Update this guideline with recommendations only

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

### 5.1 Always Use Primitives First

**CRITICAL:** Before importing any MUI component directly, check if a primitive exists in `src/primitives/`. Primitives provide:
- Consistent styling and theming
- Size presets and variants
- Built-in functionality (e.g., Avatar auto-generates initials)
- Type-safe props
- Project-specific customizations

**Example - DON'T DO THIS:**
```typescript
// ❌ Bad - Using MUI directly
import { Avatar } from '@mui/material';

<Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
  {getUserInitials()}
</Avatar>
```

**DO THIS:**
```typescript
// ✅ Good - Using primitive
import { Avatar } from '@/primitives';

<Avatar size="xl" name={getUserFullName()} />
```

### 5.2 Component List with Props

| Component | Key Props |
|-----------|-----------|
| **Avatar** | `size` ('xs'\|'sm'\|'md'\|'lg'\|'xl'), `name` (auto-generates initials & color) |
| **Button** | `variant`, `size`, `loading`, `startIcon`, `endIcon`, `fullWidth` |
| **IconButton** | `variant`, `size`, `color` |
| **Input** | `label`, `error`, `helperText`, `startAdornment`, `endAdornment` |
| **Select** | `label`, `options`, `multiple`, `error`, `helperText` |
| **Checkbox** | `label`, `checked`, `indeterminate`, `error` |
| **Radio** | `label`, `value`, `checked` |
| **Switch** | `label`, `checked`, `size` |
| **Badge** | `variant`, `color`, `content`, `max`, `invisible` |
| **Chip** | `variant`, `color`, `size`, `onDelete`, `avatar`, `icon` |
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

### 9.1 Mock Data Pattern (REQUIRED)

**All mock data must be centralized in `src/services/mockData.ts` and toggled via environment variable.**

```typescript
// config/env.ts
export const env = {
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' || false,
};

// services/mockData.ts
export const mockRecentOrders = [
  { id: '1', orderNumber: 'ORD-001', status: 'DELIVERED', total: '245.99' },
];

// services/accountService.ts
import { env } from '@/config';
import { mockRecentOrders } from './mockData';

export const accountService = {
  getDashboardData: async () => {
    if (env.enableMockData) {
      return { recentOrders: mockRecentOrders };
    }
    // Real API call
    return await apiGet('/account/dashboard');
  },
};
```

### 9.2 Form API Integration Pattern (REQUIRED)

**Never use `console.log()` for form submissions. Always integrate with real API services and update Recoil state.**

```typescript
import { useSetRecoilState } from 'recoil';
import { authAtom } from '@/state/atoms/authAtom';

// ❌ BAD - Just logging
const onSubmit = (data: LoginFormData) => {
  console.log('Login data:', data);
};

// ❌ BAD - API call but no Recoil update
const onSubmit = async (data: LoginFormData) => {
  const response = await authService.login(data);
  localStorage.setItem('user', JSON.stringify(response.user));
  navigate('/account');
};

// ✅ GOOD - Real API integration + Recoil state update
const setAuthState = useSetRecoilState(authAtom);

const onSubmit = async (data: LoginFormData) => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await authService.login(data);
    
    // Update Recoil auth state (REQUIRED for auth to work)
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      user: response.user,
      featureConfig: null,
    });
    
    // Store in localStorage as backup
    localStorage.setItem('user', JSON.stringify(response.user));
    
    navigate('/account');
  } catch (err: any) {
    setError(err.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};
```

### 9.3 Auth State Initialization (REQUIRED)

**App MUST restore auth state from localStorage on load.**

```typescript
// In App.tsx
import { useSetRecoilState } from 'recoil';
import { authAtom } from '@/state/atoms/authAtom';

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setAuthState = useSetRecoilState(authAtom);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user: AuthUser = JSON.parse(storedUser);
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          featureConfig: null,
        });
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, [setAuthState]);

  return <>{children}</>;
};

// Wrap your app
<AuthInitializer>
  <Routes>...</Routes>
</AuthInitializer>
```

### 9.4 Required Form States

Every form must have:
1. **Loading state** - Show spinner/disable button during API call
2. **Error state** - Display error Alert above form
3. **Success handling** - Navigate or show success message

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// In JSX
{error && (
  <Alert severity="error" onClose={() => setError(null)}>
    {error}
  </Alert>
)}

<Button
  type="submit"
  disabled={loading}
  startIcon={loading ? <CircularProgress size={20} /> : <Icon />}
>
  {loading ? 'Loading...' : 'Submit'}
</Button>
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

## 12. Reusable Component Patterns

### 12.1 When to Create Reusable Components

Create reusable components when you notice:
1. **Repetitive patterns** - Same structure/layout used 3+ times
2. **Complex inline `sx` props** - More than 3-4 style properties
3. **Repeated business logic** - Same data transformation/formatting
4. **Consistent interaction patterns** - Hover states, click handlers, routing

### 12.2 Component Examples

#### ClickableCard
Use for any clickable/linkable card with hover states:

```typescript
// src/components/ClickableCard.tsx
import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, BoxProps } from '@mui/material';

export interface ClickableCardProps extends Omit<BoxProps, 'component'> {
  to?: string;
  onClick?: () => void;
  hoverBg?: string;
}

export const ClickableCard = forwardRef<HTMLDivElement, ClickableCardProps>(
  ({ to, onClick, hoverBg = 'grey.50', children, sx, ...props }, ref) => {
    const Component = to ? RouterLink : 'div';
    const componentProps = to ? { to } : {};

    return (
      <Box
        ref={ref}
        component={Component}
        onClick={onClick}
        className="transition-colors"
        sx={{
          cursor: 'pointer',
          textDecoration: 'none',
          '&:hover': { bgcolor: hoverBg },
          ...sx,
        }}
        {...componentProps}
        {...props}
      >
        {children}
      </Box>
    );
  }
);
```

**Usage:**
```typescript
<ClickableCard to="/account/orders/123" p={3}>
  <Stack direction="row" gap={2}>
    <Typography>Order #123</Typography>
    <Chip label="Delivered" color="success" />
  </Stack>
</ClickableCard>
```

#### StatCard
Use for displaying statistics with icon:

```typescript
// src/components/StatCard.tsx
export interface StatCardProps {
  label: string;
  value: string | number;
  icon: SvgIconComponent;
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
  return (
    <Box
      flex={1}
      bgcolor="background.paper"
      p={3}
      borderRadius={2}
      border={1}
      borderColor="border.light"
      sx={{
        transition: 'all 0.2s',
        '&:hover': { borderColor: color, boxShadow: 2 },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h3" fontWeight={900} color="text.primary" mb={0.5}>
            {value}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {label}
          </Typography>
        </Box>
        <Box sx={{ bgcolor: `${color}15`, p: 1.5, borderRadius: 2, display: 'flex' }}>
          <Icon sx={{ fontSize: 28, color }} />
        </Box>
      </Stack>
    </Box>
  );
};
```

**Usage:**
```typescript
<Stack direction={{ xs: 'column', sm: 'row' }} gap={3}>
  <StatCard label="Total Orders" value={42} icon={Inventory2} color="primary.main" />
  <StatCard label="Cart Items" value={5} icon={ShoppingCart} color="warning.main" />
</Stack>
```

#### OrderListItem
Use for displaying order summaries in lists:

```typescript
// src/components/OrderListItem.tsx
export interface OrderListItemProps {
  id: string;
  orderNumber: string;
  createdAt: string;
  itemCount: number;
  total: string;
  status: OrderStatus;
  statusLabel: string;
  statusColor: 'success' | 'info' | 'warning' | 'error' | 'default';
  onDateFormat: (date: string) => string;
}

export const OrderListItem: React.FC<OrderListItemProps> = ({
  id, orderNumber, createdAt, itemCount, total, statusLabel, statusColor, onDateFormat
}) => {
  return (
    <ClickableCard to={`/account/orders/${id}`} p={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
        <Stack flex={1} gap={0.5}>
          <Typography fontWeight={600}>{orderNumber}</Typography>
          <Typography variant="body2" color="text.secondary">
            {onDateFormat(createdAt)} • {itemCount} items
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={2}>
          <Typography fontWeight={700}>${parseFloat(total).toFixed(2)}</Typography>
          <Chip label={statusLabel} color={statusColor} size="small" />
          <IconButton size="small"><ChevronRight /></IconButton>
        </Stack>
      </Stack>
    </ClickableCard>
  );
};
```

#### ActionCard
Use for quick action items with icon:

```typescript
// src/components/ActionCard.tsx
export interface ActionCardProps {
  label: string;
  description: string;
  icon: SvgIconComponent;
  color: string;
  to: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({ label, description, icon: Icon, color, to }) => {
  return (
    <ClickableCard
      to={to}
      bgcolor="background.paper"
      p={2.5}
      borderRadius={2}
      border={1}
      borderColor="border.light"
      sx={{
        '&:hover': { borderColor: color, boxShadow: 1, transform: 'translateY(-2px)' },
      }}
    >
      <Stack direction="row" alignItems="center" gap={2}>
        <Box sx={{ bgcolor: `${color}15`, p: 1.5, borderRadius: 1.5, display: 'flex' }}>
          <Icon sx={{ fontSize: 24, color }} />
        </Box>
        <Box flex={1}>
          <Typography fontWeight={600}>{label}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </Box>
        <ChevronRight sx={{ color: 'text.disabled' }} />
      </Stack>
    </ClickableCard>
  );
};
```

### 12.3 Benefits of Reusable Components

1. **Smaller page components** - Reduced from 338 lines to 244 lines (28% reduction)
2. **Consistent patterns** - Same hover states, transitions, and interactions
3. **Easier maintenance** - Update once, applies everywhere
4. **Better testability** - Test components in isolation
5. **Improved readability** - Declarative component names vs complex JSX

### 12.4 Guidelines

- Place reusable components in `src/components/`
- Export from `src/components/index.ts`
- Document props with TypeScript interfaces
- Keep components focused on single responsibility
- Use composition (children prop) for flexibility
- Avoid over-abstraction - balance reusability with simplicity

---

## 13. Accessibility

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
