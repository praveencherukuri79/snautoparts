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
19. **CENTRALIZE ICON IMPORTS** - Use barrel export (`src/icons/index.ts`) for all MUI icons. Import from `@/icons` not `@mui/icons-material`
20. **EXTRACT REPETITIVE sx TO STYLED COMPONENTS** - If same `sx` pattern repeats 3+ times, create a styled component in `.styles.ts`
21. **ICON VISIBILITY** - Icons on dark backgrounds need explicit color (use styled components or CSS utility classes, NOT inline sx)
22. **KEEP THIS BIBLE CONCISE** - Short, actionable rules only. No verbose explanations. This is for AI context, not user documentation.

### Auth Page Layout Rules

1. **Social login buttons at BOTTOM** - After the form, after divider, before "Sign up/Sign in" link
2. **NO vertical border/divider** between hero image section and form section
3. **Header "Return to Shop" button** - Use `ArrowBack` icon, styled with `rgba(249, 115, 22, 0.1)` bg and `primary.main` text
4. **Logo must be visible** - Use `color: 'primary.main'` on LogoIcon component

### Theme Color Reference

`background.surfaceDark` #181411 • `background.inputDark` #27201b • `background.dark` #23170f • `text.muted` #bba89b • `text.primary` #181411 • `text.secondary` #8c725f • `border.dark` #55453a • `border.light` #e6dfdb • `primary.main` #f97415 • `error.main` #dc2626 • `success.main` #16a34a

---

## Table of Contents

- [SN Auto Parts - React UI Guidelines](#sn-auto-parts---react-ui-guidelines)
  - [⚠️ CRITICAL RULES (READ FIRST)](#️-critical-rules-read-first)
    - [Auth Page Layout Rules](#auth-page-layout-rules)
    - [Theme Color Reference](#theme-color-reference)
  - [Table of Contents](#table-of-contents)
  - [1. Tech Stack](#1-tech-stack)
  - [2. Project Structure](#2-project-structure)
  - [3. Theme System](#3-theme-system)
  - [4. Component Architecture](#4-component-architecture)
  - [5. Primitive Components](#5-primitive-components)
    - [5.1 Component List](#51-component-list)
  - [6. Layout Components](#6-layout-components)
  - [7. Styling Guidelines](#7-styling-guidelines)
  - [8. State Management](#8-state-management)
  - [9. API Integration](#9-api-integration)
    - [9.1 Mock Data Pattern](#91-mock-data-pattern)
    - [9.2 Form API Integration Pattern](#92-form-api-integration-pattern)
    - [9.3 Auth State Initialization](#93-auth-state-initialization)
    - [9.4 Required Form States](#94-required-form-states)
  - [10. Utility Functions](#10-utility-functions)
  - [11. Design Tokens](#11-design-tokens)
  - [12. Reusable Component Patterns](#12-reusable-component-patterns)
  - [13. Icon Management](#13-icon-management)
  - [14. Styled Components Pattern](#14-styled-components-pattern)
  - [15. Accessibility](#15-accessibility)

---

## 1. Tech Stack

React 18+ • Vite • TypeScript • MUI v5+ • Recoil • React Router v6 • Day.js • Axios

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

**Font:** Inter, -apple-system, BlinkMacSystemFont
**Spacing:** 8px base (1 unit = 8px)
**Border Radius:** xs=4px, sm=6px, md=8px, lg=12px, xl=16px
**Theme:** Light (default), Dark (switchable via Recoil + localStorage)

---

## 4. Component Architecture

**Primitives** - Atomic (Button, Input, Card) - No business logic
**Components** - Composite (ProductCard, Header) - Combine primitives
**Feature Components** - Page-specific - Located in feature folders

**Props Pattern:**
- Sensible defaults, forward refs, spread remaining props
- Use `on*` for handlers, `is*`/`has*` for booleans

---

## 5. Primitive Components

### 5.1 Component List

| Component | Key Props |
|-----------|-----------|
| **Avatar** | `size` ('xs'\|'sm'\|'md'\|'lg'\|'xl'), `name` (auto-generates initials & color) |
| **Button** | `variant`, `size`, `loading`, `startIcon`, `endIcon`, `fullWidth` |
| **Link** | `to`, `variant` ('default'\|'button'\|'button-outlined'\|'unstyled'), `external` |
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

---

## 6. Layout Components

**MainLayout** - Header + Content + Footer (customer-facing)
**DashboardLayout** - Sidebar + TopBar + Content (manager/admin)
**AuthLayout** - Hero Image + Form (login/register)

---

## 7. Styling Guidelines

**Hierarchy:** Global CSS → Theme → Utility CSS → Primitives → sx (last resort)

**Rules:** Use theme colors • Use primitives before MUI+sx • Use spacing scale (1,2,3) not pixels • SVG icons in `src/assets/icons/`

---

## 8. State Management

**Recoil Atoms:** `authAtom`, `cartAtom`, `themeAtom`, `notificationAtom`

**When to Use:**
- Server state → Component state (React Query later)
- Global UI → Recoil (theme, notifications)
- Auth/Cart → Recoil (persisted to localStorage)
- Form → react-hook-form
- URL → React Router searchParams

---

## 9. API Integration

### 9.1 Mock Data Pattern

**All mock data in `src/services/mockData.ts`** • Toggle: `env.enableMockData` from `VITE_ENABLE_MOCK_DATA` • Pattern: `if (env.enableMockData) return mockData; try { api call } catch { fallback mock }`

### 9.2 Form API Integration Pattern

**Never use `console.log()` for form submissions** • Call API service • Update Recoil authAtom with user data • Store in localStorage • Handle loading/error states

### 9.3 Auth State Initialization

**Create `AuthInitializer` component** • Read `localStorage.getItem('user')` in useEffect • Update authAtom with parsed user • Wrap routes with it

### 9.4 Required Form States

Every form needs: **Loading state** (spinner/disable button) • **Error state** (Alert above form) • **Success handling** (navigate or message)

---

## 10. Utility Functions

**Formatters:** `formatCurrency()`, `formatDate()`, `formatPhone()`, `formatNumber()`
**Validators:** `validators.email()`, `validators.phone()`, `validators.password()`
**Helpers:** `cn()`, `generateId()`, `debounce()`, `truncate()`, `getInitials()`

---

## 11. Design Tokens

**Spacing:** `spacing(0.5)` = 4px, `(1)` = 8px, `(2)` = 16px, `(3)` = 24px, `(4)` = 32px, `(6)` = 48px, `(8)` = 64px

---

## 12. Reusable Component Patterns

**When:** Repetitive patterns (3+ times), complex `sx` props, consistent interactions
**Examples:** ClickableCard, StatCard, OrderListItem, ActionCard
**Guidelines:** Place in `src/components/`, TypeScript interfaces, single responsibility

---

## 13. Icon Management

**Import from `@/icons` NOT `@mui/icons-material`** • Icons on dark backgrounds need explicit color (styled component/CSS class/theme)

---

## 14. Styled Components Pattern

**Create `.styles.ts` when same `sx` used 3+ times** • Use for: repeated sx, hardcoded colors, complex hover/focus states • Structure: `Component.tsx` + `Component.styles.ts`

---

## 15. Accessibility

- Keyboard navigation for all interactive elements
- `aria-label` on icon-only buttons
- Labels for all form inputs
- Icons: `aria-hidden="true"` (decorative) or `aria-label` (meaningful)

---

**File Naming:** Components=PascalCase, hooks=useCamelCase, utils=camelCase, constants=SCREAMING_SNAKE_CASE
