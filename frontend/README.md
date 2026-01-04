# SN Auto Parts - Frontend

Modern Angular e-commerce frontend for SN Auto Parts built with Angular 17+, standalone components, Signals, and Tailwind CSS.

## Tech Stack

- **Angular 17+** - Standalone APIs, Signals for state management
- **Tailwind CSS** - Utility-first CSS framework
- **Angular Material** - UI components (optional)
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Core services, guards, interceptors
│   │   │   ├── content/             # Text/content configuration
│   │   │   ├── guards/              # Route guards
│   │   │   ├── interceptors/        # HTTP interceptors
│   │   │   ├── models/              # TypeScript interfaces
│   │   │   └── services/            # API and state services
│   │   │       └── mock-data/       # Mock data for development
│   │   ├── features/                # Feature modules
│   │   │   ├── admin/               # Admin panel
│   │   │   ├── auth/                # Authentication pages
│   │   │   ├── account/             # User account management
│   │   │   ├── cart/                # Shopping cart
│   │   │   ├── catalog/             # Products and categories
│   │   │   ├── checkout/            # Checkout flow
│   │   │   ├── home/                # Home page
│   │   │   ├── manager/             # Manager dashboard
│   │   │   └── orders/              # Order history
│   │   └── shared/                  # Shared components
│   │       ├── components/          # Reusable components
│   │       └── layouts/             # Layout components
│   ├── assets/                      # Static assets
│   │   └── icons/                   # SVG icons
│   ├── environments/                # Environment configs
│   └── styles.css                   # Global styles
├── angular.json                     # Angular CLI config
├── package.json                     # Dependencies
├── tailwind.config.js              # Tailwind config
└── tsconfig.json                   # TypeScript config
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The application runs at `http://localhost:4200` by default.

## Environment Configuration

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  stripePublishableKey: 'pk_test_...',
  enableMockData: true, // Toggle mock data
};
```

## Mock Data Mode

The frontend includes a complete mock data layer for development without the backend:

1. Set `enableMockData: true` in environment config
2. All API calls will use in-memory mock data
3. Perfect for UI development and testing

## Features

### Customer Features
- Browse products and categories
- Search and filter products
- Product detail with specifications
- Shopping cart with persistence
- Multi-step checkout flow
- Order history and tracking
- Account management

### Manager Features
- Orders dashboard with statistics
- Order management and fulfillment
- Inventory management
- Stock adjustments

### Admin Features
- User and role management
- System settings
- Audit logs

## Styling

### Theme Variables

CSS custom properties are defined in `src/styles.css`:

```css
:root {
  --color-primary: #137fec;
  --color-primary-hover: #0f6bd0;
  /* ... more variables */
}
```

### Tailwind Configuration

Custom colors and utilities in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        // ... more colors
      },
    },
  },
};
```

## Content Management

All user-facing text is centralized in `src/app/core/content/app.content.ts`. This makes it easy to:

- Maintain consistent copy
- Support internationalization
- Update text without touching templates

## State Management

The app uses Angular Signals for local/UI state:

```typescript
// In a service
private cartState = signal<Cart | null>(null);
readonly cart = this.cartState.asReadonly();
readonly itemCount = computed(() => this.cartState()?.itemCount ?? 0);
```

## API Services

Services are organized by domain:

- `AuthService` - Authentication and user management
- `CatalogService` - Products and categories
- `CartService` - Shopping cart operations
- `CheckoutService` - Checkout flow state
- `OrderService` - Order management
- `AdminService` - Admin operations

## Route Guards

- `authGuard` - Requires authentication
- `roleGuard` - Requires specific role(s)

## Interceptors

- `authInterceptor` - Adds JWT token to requests
- `errorInterceptor` - Global error handling

## Building for Production

```bash
npm run build
```

Output is in the `dist/` folder, ready for deployment.

## Testing

```bash
# Unit tests
npm test

# E2E tests (if configured)
npm run e2e
```

## License

Private - SN Auto Parts

