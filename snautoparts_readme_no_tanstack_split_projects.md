# SN Auto Parts — Modern E‑Commerce Rebuild (Angular + Fastify + Postgres)

This repository is a “from zero to production” blueprint for rebuilding the existing WordPress site into a modern, maintainable e‑commerce app.

**Frontend (standalone project):** Angular (standalone APIs) + Angular Signals + **Angular Reactive Forms** + Angular Material + Tailwind  
**Backend (standalone project):** Node.js + Fastify + TypeScript + Pino + Postgres (Neon) + Prisma + Zod + Better Auth + Stripe + Resend

Target: the current static/WordPress presence: `snautoparts.com`.

---

## Non‑negotiables (read this first)

- **NO TanStack Query** in this project (ignore it everywhere).
- **NO monorepo tooling / NO root `package.json`**.
- **NO shared packages** (`/packages/shared`, `/ui`, etc. are not allowed).
- **Backend and Frontend must be independently runnable and buildable**:
  - `frontend/` has its own `package.json`
  - `backend/` has its own `package.json`
  - no cross-folder imports / no shared build pipeline

---

## Goals

### Product goals
- Auto parts catalog browsing + search
- Fitment guidance (optional phase) — e.g., Year/Make/Model
- Cart → Checkout → Order confirmation
- Order history for customers
- Admin/manager inventory & order management
- Email confirmations and operational alerts

### Engineering goals
- Monolith architecture **within backend** (no microservices)
- Checkout correctness: idempotency, transactional writes, webhook safety
- Fast iteration: Cursor IDE-first workflow + Prisma migrations + typed contracts
- UI design acceleration: Google Stitch for rapid screen ideation and variants (design-first workflow)

---

## Roles & authorization model

Three roles:

| Role | Who | Permissions |
|---|---|---|
| **customer** | shoppers | browse catalog, cart, checkout, view own orders, profile |
| **manager** | operations | manage inventory/pricing/product content, view & fulfill orders, limited customer visibility |
| **admin** | owner/IT | all manager actions + manage users/roles + settings + audit logs |

**Rule of thumb**
- **Managers** change business data (products, inventory, orders).
- **Admins** change system data (users, roles, configuration, integrations).

---

## Repository layout (strict)

```
/frontend
  package.json
  angular.json
  src/...
  README.md

/backend
  package.json
  prisma/...
  src/...
  README.md
```

> There is intentionally **no** root workspace, no shared libs, and no root package.json.

---

## Coding guidelines (Cursor prompt — treat as strict rules)

Copy/paste this into Cursor when generating code for this repo:

```
You are an expert senior full-stack engineer.

Read ALL provided README.md files completely before writing any code.
Assume this is a greenfield rebuild of an existing WordPress auto-parts website
into a production-quality shopping cart application.

────────────────────────────────────────
STACK (MANDATORY – DO NOT CHANGE)
────────────────────────────────────────
Frontend:
- Angular (standalone APIs)
- Angular Signals (local/UI state only)
- Angular Material (components)
- Tailwind CSS (layout & utilities only)
- Angular Reactive Forms
- TypeScript

Backend:
- Node.js
- Fastify
- TypeScript
- Pino logging
- Postgres (Neon cloud)
- Prisma
- Zod
- Better Auth
- Stripe
- Resend

────────────────────────────────────────
FUNCTIONAL REQUIREMENTS
────────────────────────────────────────
1. Implement a complete shopping cart system
   - product listing
   - product detail
   - cart (add / update / remove)
   - checkout
   - order creation
   - order history

2. Implement 3 UI modules (dashboards):
   - Customer
   - Manager
   - Admin

3. Enforce role-based access consistently:
   - UI route guards
   - Backend API authorization

4. Implement mock data support on frontend:
   - Central flag: ENABLE_MOCK_DATA
   - All API calls must be easily switchable between:
     - real backend
     - mock adapters
   - Mock data must match real API response shapes exactly

────────────────────────────────────────
ARCHITECTURAL RULES (STRICT)
────────────────────────────────────────
- Monolith architecture (NO microservices)
- Clear module boundaries (catalog, cart, checkout, orders, admin)
- Controllers must be thin
- Business logic must live in services
- All write operations must be transaction-safe (backend)
- Checkout & order creation must be idempotent

────────────────────────────────────────
ANGULAR-SPECIFIC RULES (STRICT)
────────────────────────────────────────
- Use standalone components only
- Every component MUST have:
  - separate .ts
  - separate .html
  - separate .css
- NO inline templates
- NO inline styles
- All forms must use Angular Reactive Forms (FormGroup/FormControl)

State management:
- UI state → Angular Signals ONLY
- NO NgRx / Akita / custom global stores
- NO TanStack Query (do not add it, do not mention it)

────────────────────────────────────────
STYLING & THEMING RULES (STRICT)
────────────────────────────────────────
- NO hardcoded colors, spacing, or animation values
- ALL styling must use:
  - CSS variables
  - CSS functions
  - keyframes
- Define:
  - base theme variables
  - at least one additional theme file
- Theme switching at runtime is NOT required
- App must be theme-ready by design

────────────────────────────────────────
CONTENT & TEXT RULES (STRICT)
────────────────────────────────────────
- NO hardcoded static text in templates
- ALL user-visible text must come from centralized .ts content/config files
- Components must render text dynamically
- This enables easy content changes and future i18n support

────────────────────────────────────────
CODE QUALITY RULES
────────────────────────────────────────
- Use clean, readable TypeScript
- Prefer composition over inheritance
- Avoid overly complex generic typing
- Write reusable, testable utilities
- No dead code
- No magic numbers
- Meaningful naming everywhere

────────────────────────────────────────
OUTPUT EXPECTATIONS
────────────────────────────────────────
- Production-ready code only
- No placeholders like TODO or “mock later”
- Implement all necessary plumbing
- Follow README architecture and recommendations exactly
- If a decision is unclear, choose the simplest correct solution
- Do NOT ask clarifying questions unless absolutely required

Start by:
1. Creating the backend foundation
2. Creating the frontend app shell
3. Implementing mock-data adapters
4. Building customer flow
5. Then manager dashboard
6. Then admin dashboard

---------------------------------------
admin and manager
---------------------------------------
Use ngx-charts for data visualization.

-------------------------------------
database
------------------------------------
Use the connection URL from the backend .env file for Postgres (Neon cloud).

-----------------------------------
svg icons
--------------------------------
All SVG icons must be loaded from assets (no inline svg code in HTML).
```

---

## High-level architecture

### Frontend (Angular)
- Angular standalone APIs
- Angular Signals for local/UI state and view-model composition
- **Angular Reactive Forms** for all forms (login, address, checkout, product admin)
- Angular Material for accessible, consistent components
- Tailwind for layout utilities and responsive structure

### Backend (Fastify)
- Fastify routes + plugins
- Zod validation for requests/responses
- Prisma for DB access + migrations
- Pino logging (Fastify-native)
- Stripe payment intents + webhook processing
- Resend for email delivery
- Better Auth for auth + sessions + RBAC

### Database (Postgres on Neon)
- Postgres is the system of record (orders, payments, inventory)
- Use Neon `DATABASE_URL` from backend `.env`

---

## Functional scope (MVP)

### Customer
- Home
- Category listing
- Product listing
- Product detail
- Cart
- Checkout (address + shipping method + Stripe payment)
- Order confirmation
- Order history
- Account/profile

### Manager
- Orders dashboard (view, filter, fulfill)
- Inventory/products list
- Inventory adjustments
- Basic reports charts via **ngx-charts**

### Admin
- Users & roles management
- All manager features
- Settings (tax/shipping later)
- Audit logs (optional)
- Charts via **ngx-charts**

---

## Backend API (contract principles)

### Route conventions
- `/api/v1/public/*` — catalog browse, search
- `/api/v1/customer/*` — cart, checkout, orders
- `/api/v1/manager/*` — inventory, orders fulfillment
- `/api/v1/admin/*` — users/roles/settings/audit

### Validation + errors
- Every endpoint validates with Zod
- Error format is consistent:
  - `400` validation
  - `401/403` auth/role
  - `404` not found
  - `409` conflict (optimistic lock, inventory)
  - `500` unhandled

### Idempotency (checkout)
- `POST /checkout/create-payment-intent` must accept `Idempotency-Key`
- `POST /orders` must accept `Idempotency-Key`
- Stripe webhook handler must be idempotent:
  - unique constraint on `stripeEventId`
  - ignore duplicates safely

---

## Payments (Stripe)

Recommended flow:
1. Customer creates/updates cart
2. Checkout calls backend to create Stripe **PaymentIntent**
3. Customer pays in frontend
4. Stripe sends webhook → backend verifies + finalizes order
5. Send Resend emails

**Important**
- Never mark an order paid from frontend success alone
- Webhook is the source of truth

---

## Email (Resend)

Customer emails:
- Order confirmation
- Shipment confirmation (later)
- Refund notification (later)

Ops emails:
- New order notification (optional)
- Low inventory warning (optional)

---

## Observability (Pino)

Logging rules:
- One line per request: method, path, status, duration, requestId
- Never log secrets (tokens, keys, card data)
- Include (when available):
  - `requestId`
  - `userId`
  - `role`
  - `orderId` (for order endpoints)

---

## Database & Prisma rules

### Migration strategy
- Prisma migrate for dev/staging
- Controlled migration plan for prod (review diffs)
- Seed minimal data:
  - roles
  - an admin user
  - sample categories/brands

### Constraints (must-have)
- Unique `(cartId, productId)` in `CartItem`
- Unique `stripeEventId` in `PaymentEvent` (or similar)
- Foreign keys for all relations
- Check constraints for positive quantities and totals

---

## Frontend: state + mock data

### Mock data toggle
- Add `ENABLE_MOCK_DATA` in `frontend/src/environments/*`
- API layer must route through a single abstraction:
  - real HTTP implementation OR
  - mock adapter implementation

**Rule:** mocks must match real API response shapes exactly.

### Forms
- All forms use Reactive Forms.
- Build reusable form components where it reduces duplication.
- Validation messages must come from centralized text/config `.ts` files.

---

## UI design workflow with Google Stitch

Use Stitch for:
- rapid page ideation (home, listings, detail, cart, checkout, dashboards)
- layout variants (Material-ish vs branded)
- exporting as reference (optionally into Figma) for refinement

Store Stitch artifacts under:
- `docs/stitch/prompts/`
- `docs/stitch/exports/`
- `docs/stitch/decisions.md`

---

## SVG icon policy (strict)

- All SVG icons must live in `frontend/src/assets/icons/`
- No inline SVG markup in templates
- Components reference icons via `mat-icon` registry or `<img>` / `background-image` depending on usage

---

## Notes
- This README is the root spec. Each project folder (`frontend/`, `backend/`) should also have its own `README.md` containing the exact run/build commands and environment variables for that project.
