# SN Auto Parts - Backend

Node.js + Fastify + Prisma + Postgres backend for the SN Auto Parts e-commerce platform.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Fastify
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon Cloud)
- **ORM:** Prisma
- **Validation:** Zod
- **Payments:** Stripe
- **Email:** Resend
- **Logging:** Pino

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Stripe account (for payments)
- Resend account (for emails)

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database (Neon Postgres)
DATABASE_URL="postgresql://user:password@host:5432/snautoparts?sslmode=require"

# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Auth
AUTH_SECRET="your-super-secret-key-change-in-production"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Resend (Email)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@snautoparts.com"

# Frontend URL
FRONTEND_URL="http://localhost:4200"
```

### Running the Server

```bash
# Development with hot reload
npm run dev

# Production build
npm run build
npm start
```

## API Routes

### Public Routes (`/api/v1/public`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/catalog/categories` | List all categories |
| GET | `/catalog/products` | List products with filters |
| GET | `/catalog/products/:slug` | Get product details |
| GET | `/catalog/search?q=` | Search products |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| GET | `/auth/me` | Get current user |

### Customer Routes (`/api/v1/customer`) - Auth Required

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/cart` | Get user's cart |
| POST | `/cart/items` | Add item to cart |
| PATCH | `/cart/items/:id` | Update cart item |
| DELETE | `/cart/items/:id` | Remove cart item |
| POST | `/checkout/create-payment-intent` | Create Stripe payment |
| POST | `/checkout/create-order` | Create order |
| GET | `/orders` | Get order history |
| GET | `/orders/:id` | Get order details |
| GET | `/profile` | Get user profile |
| PATCH | `/profile` | Update profile |

### Manager Routes (`/api/v1/manager`) - Manager/Admin Required

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders` | List all orders |
| GET | `/orders/stats` | Order statistics |
| PATCH | `/orders/:id/status` | Update order status |
| GET | `/inventory` | Inventory levels |
| POST | `/inventory/adjustments` | Adjust inventory |
| GET | `/products` | Manage products |

### Admin Routes (`/api/v1/admin`) - Admin Required

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| POST | `/users` | Create user |
| PATCH | `/users/:id/role` | Update user role |
| GET | `/settings` | Get settings |
| PUT | `/settings/:key` | Update setting |
| GET | `/audit` | Audit logs |

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

### Key Models

- **User** - Customer, Manager, Admin users
- **Product** - Auto parts catalog
- **Category** / **Brand** - Product organization
- **Cart** / **CartItem** - Shopping cart
- **Order** / **OrderItem** - Customer orders
- **InventoryLog** - Inventory tracking
- **AuditLog** - System audit trail

## Default Users (After Seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@snautoparts.com | Admin123! | ADMIN |
| manager@snautoparts.com | Manager123! | MANAGER |
| customer@example.com | Customer123! | CUSTOMER |

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

