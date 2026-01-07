# 01. Application Overview

## Project Purpose

SN Auto Parts is a modern e-commerce platform designed to replace an existing WordPress site. It provides a complete shopping cart system for auto parts with role-based access for customers, managers, and administrators.

## Goals

### Product Goals
- Auto parts catalog browsing and search
- Shopping cart and checkout functionality
- Order management and tracking
- Inventory management for operations staff
- User and system administration
- Email confirmations and operational alerts

### Engineering Goals
- Monolith architecture within backend (no microservices)
- Checkout correctness: idempotency, transactional writes, webhook safety
- Fast iteration: Cursor IDE-first workflow + Prisma migrations + typed contracts
- UI design acceleration: Google Stitch for rapid screen ideation

## Tech Stack

### Frontend
- **Framework:** Angular (standalone APIs)
- **State Management:** Angular Signals (local/UI state only)
- **UI Components:** Angular Material
- **Styling:** Tailwind CSS (layout & utilities only)
- **Forms:** Angular Reactive Forms
- **Language:** TypeScript
- **Charts:** ngx-charts (for admin/manager dashboards)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Fastify
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon Cloud)
- **ORM:** Prisma
- **Validation:** Zod
- **Authentication:** Better Auth (session-based)
- **Payments:** Stripe
- **Email:** Resend
- **Logging:** Pino

## Architecture Overview

### High-Level Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Angular   │────────▶│   Fastify   │────────▶│  Postgres   │
│  Frontend   │  HTTP   │   Backend   │ Prisma │  (Neon)     │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              ├─────────▶ Stripe (Payments)
                              │
                              └─────────▶ Resend (Email)
```

### Architecture Principles

1. **Monolith Backend** - All backend logic in a single Fastify application
2. **Standalone Projects** - Frontend and backend are independently runnable
3. **No Shared Packages** - No monorepo tooling or shared packages
4. **Clear Module Boundaries** - Catalog, cart, checkout, orders, admin modules
5. **Thin Controllers** - Business logic in services
6. **Transaction Safety** - All write operations use database transactions

## Key Design Decisions

### Non-Negotiables

1. **NO TanStack Query** - Not used anywhere in the project
2. **NO Monorepo Tooling** - No root `package.json` or workspace configuration
3. **NO Shared Packages** - No `/packages/shared` or `/ui` directories
4. **Independent Projects** - Frontend and backend must be independently runnable and buildable

### State Management

- **UI State:** Angular Signals only
- **NO NgRx/Akita** - No global state management libraries
- **NO TanStack Query** - No data fetching libraries
- **Service Layer:** Services handle API communication and local state

### Styling Approach

- **CSS Variables** - All colors, spacing, animations via CSS variables
- **Theme-Ready** - Support for multiple themes (light/dark)
- **Tailwind Utilities** - Layout and utility classes only
- **No Hardcoded Values** - No magic numbers in component styles

### Content Management

- **Centralized Text** - All user-visible text in `.ts` content files
- **No Hardcoded Strings** - Templates reference content objects
- **i18n Ready** - Structure supports future internationalization

### Forms

- **Reactive Forms Only** - All forms use Angular Reactive Forms
- **No Template-Driven** - Template-driven forms not used
- **Validation Messages** - From centralized content files

## Project Structure

```
snautoparts/
├── frontend/              # Angular standalone project
│   ├── package.json
│   ├── angular.json
│   └── src/
│       ├── app/
│       │   ├── core/      # Services, guards, interceptors, models
│       │   ├── features/  # Feature modules
│       │   └── shared/    # Shared components
│       └── assets/        # Icons, images
│
└── backend/               # Fastify standalone project
    ├── package.json
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── routes/        # API routes by role
        ├── plugins/       # Fastify plugins
        ├── services/      # Business logic
        └── schemas/       # Zod validation schemas
```

## Key Features

### Customer Features
- Browse products by category
- Search and filter products
- Product detail pages
- Shopping cart management
- Multi-step checkout (address → shipping → review → payment)
- Order history and tracking
- Account/profile management
- Address management

### Manager Features
- Orders dashboard with statistics
- Order management and fulfillment
- Inventory management
- Stock adjustments
- Product management
- Charts and reports

### Admin Features
- User and role management
- System settings
- Audit logs
- All manager features

## Database

- **Provider:** PostgreSQL (Neon Cloud)
- **ORM:** Prisma
- **Migrations:** Prisma Migrate
- **Connection:** Via `DATABASE_URL` environment variable

## External Services

### Stripe
- Payment processing
- Payment intents for checkout
- Webhook handling for payment confirmation

### Resend
- Email delivery
- Order confirmations
- Operational alerts

## Development Workflow

1. **Frontend Development** - Angular standalone components with Signals
2. **Backend Development** - Fastify routes with Prisma ORM
3. **Database Changes** - Prisma migrations
4. **Mock Data** - Frontend supports mock data mode for UI development
5. **Type Safety** - Shared TypeScript types between frontend and backend

## Security

- **Authentication:** Session-based with secure cookies
- **Authorization:** Role-based access control (RBAC)
- **Password Hashing:** PBKDF2 with salt
- **Input Validation:** Zod schemas for all API endpoints
- **SQL Injection:** Prevented via Prisma ORM
- **XSS Protection:** Angular's built-in sanitization

## Performance Considerations

- **Database Indexing:** Strategic indexes on frequently queried fields
- **Pagination:** All list endpoints support pagination
- **Lazy Loading:** Angular lazy-loaded feature modules
- **Caching:** Browser caching for static assets
- **Optimistic Updates:** Frontend updates UI optimistically where appropriate

## Future Considerations

- Fitment guidance (Year/Make/Model matching) - Optional phase
- Advanced search and filtering
- Product reviews and ratings
- Wishlist functionality
- Multi-currency support
- Internationalization (i18n)

---

**Next:** [02. Features](02-features.md) | [Back to Index](README.md)

