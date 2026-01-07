# SN Auto Parts — Feature-Config Driven E-Commerce Platform

This repository is a **from-zero-to-production** rebuild of the existing WordPress auto-parts site into a modern, maintainable e-commerce application that supports:

- **Local inventory** (stock we physically control)
- **Drop-shipping / affiliates** (e.g., partners like a-premium.com)
- **Feature-config driven UI** — UI loads features dynamically based on user role configuration
- **Generic APIs** — No role-based API segmentation; backend validates authorization per request
- **Pluggable database adapters** for **Postgres** and **SQL Server**

> This README is the **single source of truth** for architecture, stack, folder layout, API specifications, and feature configuration. Do **not** create additional README files unless absolutely necessary.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Architecture Philosophy](#2-architecture-philosophy)
3. [Runtime Configuration](#3-runtime-configuration)
4. [Feature Configuration System](#4-feature-configuration-system)
5. [Roles & Permissions](#5-roles--permissions)
6. [Inventory & Drop-Shipping Model](#6-inventory--drop-shipping-model)
7. [Supplier Integrations](#7-supplier-integrations)
8. [Repository Layout](#8-repository-layout)
9. [Database Schema](#9-database-schema)
10. [API Specification](#10-api-specification)
11. [OpenAPI Specification](#11-openapi-specification)
12. [Frontend Architecture](#12-frontend-architecture)
13. [Background Jobs & Webhooks](#13-background-jobs--webhooks)
14. [Content & Localization](#14-content--localization)
15. [Caching Strategy](#15-caching-strategy)
16. [Implementation Order](#16-implementation-order)

**Appendices**
- [A: Inventory XLSX Format](#appendix-a-inventory-xlsx-format)
- [B: Error Codes](#appendix-b-error-codes)
- [C: Environment Variables Reference](#appendix-c-environment-variables-reference)
- [D: Testing Strategy](#appendix-d-testing-strategy)
- [E: Deployment Checklist](#appendix-e-deployment-checklist)
- [F: Development Commands](#appendix-f-development-commands)

---

## 1. Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| Angular 19 (Standalone APIs) | Component framework |
| Angular Signals | Local/UI state management |
| Angular Reactive Forms | All form handling |
| Angular Material 19 | UI components |
| Angular CDK | Utilities and primitives |
| Tailwind CSS | Layout & utilities |
| SCSS | Component styling |
| TypeScript | Type safety |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js + Fastify 4 | HTTP server |
| TypeScript | Type safety |
| MikroORM 6 | ORM with native multi-DB support |
| Passport.js + @fastify/passport | Authentication |
| @fastify/secure-session | Session management |
| Zod | Schema validation |
| Stripe | Payment processing |
| Resend | Transactional email |
| Pino | Structured logging |
| @fastify/swagger | OpenAPI documentation |

### Database

| Database | Purpose |
|----------|---------|
| PostgreSQL (Neon) | Primary - system of record |
| SQL Server | Secondary - supported via config switch |

> **Why MikroORM over Prisma?**
> 
> | Aspect | Prisma | MikroORM |
> |--------|--------|----------|
> | Multi-DB Schema | Requires separate `.prisma` files per DB | Single TypeScript entity works for all DBs |
> | Runtime DB Switching | Need separate generated clients | Native - just change `type` in config |
> | SQL Server Support | Preview/limited | Full production support |
> | Entity Definition | Prisma DSL (custom language) | TypeScript decorators (native TS) |
> 
> MikroORM allows **one entity definition** that works across PostgreSQL and SQL Server with a simple config switch at runtime.

> **Why Passport.js?**
> 
> We use Passport.js with the local strategy for session-based authentication:
> - **@fastify/passport** - Passport.js integration for Fastify
> - **@fastify/secure-session** - Secure cookie-based sessions
> - **passport-local** - Username/password authentication strategy
> 
> Benefits:
> - Battle-tested authentication library
> - Session-based auth (no JWT complexity)
> - Easy to extend with additional strategies (OAuth, etc.)
> - Secure session cookies with encryption

---

## 2. Architecture Philosophy

### Generic APIs (Not Role-Based)

❌ **Old Approach** — Role-based API routes:
```
/api/v1/customer/orders
/api/v1/manager/orders
/api/v1/admin/orders
```

✅ **New Approach** — Generic APIs with backend authorization:
```
/api/v1/orders
/api/v1/products
/api/v1/inventory
/api/v1/users
```

**How it works:**

1. All authenticated requests include a session cookie
2. Backend extracts user role from the session via Passport.js
3. Authorization middleware validates if the user can perform the requested action
4. Same endpoint, different behavior based on role permissions

```typescript
// Example: GET /api/v1/orders
// - CUSTOMER: Returns only their own orders
// - MANAGER: Returns all orders (can filter)
// - ADMIN: Returns all orders (can filter)

// Example: PATCH /api/v1/orders/:id/status
// - CUSTOMER: 403 Forbidden
// - MANAGER: Allowed
// - ADMIN: Allowed
```

### Feature-Config Driven UI

The frontend is **role-agnostic**. Features are loaded dynamically based on the user's feature configuration:

```typescript
// On login:
// 1. Authenticate user via Passport.js
// 2. Session established with user role
// 3. Fetch feature config for that role
// 4. Load features and menu based on config

interface FeatureConfig {
  role: string;
  version: number;
  features: Record<string, Record<string, boolean>>;
  navigation: {
    primary: NavigationItem[];
    secondary?: NavigationItem[];
    account: NavigationItem[];
  };
  ui: {
    dashboardLayout: 'customer' | 'operations' | 'admin';
    showPriceHistory: boolean;
    showCostPrice: boolean;
    showAuditInfo: boolean;
  };
}
```

### Single Source of Truth

- **Backend** owns all authorization logic
- **Frontend** renders what the backend permits
- **Feature config** is stored in database, cacheable, and editable by admins

---

## 3. Runtime Configuration

### Backend `.env`

```bash
NODE_ENV=development
PORT=3000

# Database Configuration (MikroORM)
# Switch between databases by changing DB_TYPE
DB_TYPE=postgresql          # or: mssql (SQL Server)

# Database Connection
DB_HOST=localhost
DB_PORT=5432                # PostgreSQL: 5432, SQL Server: 1433
DB_NAME=snautoparts
DB_USER=postgres
DB_PASSWORD=your-password

# Auth (Session Secret)
BETTER_AUTH_SECRET=your-secret-key-min-32-chars

# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Resend
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@snautoparts.com

# Feature Config
FEATURE_CONFIG_CACHE_TTL=300  # seconds

# Logging
LOG_LEVEL=info
```

### MikroORM Configuration

```typescript
// mikro-orm.config.ts
import { Options } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { MsSqlDriver } from '@mikro-orm/mssql';

const DB_TYPE = (process.env.DB_TYPE ?? 'postgresql') as 'postgresql' | 'mssql';

const config: Options = {
  // Runtime database switching
  driver: DB_TYPE === 'mssql' ? MsSqlDriver : PostgreSqlDriver,

  // Use TsMorphMetadataProvider to read types from source files
  metadataProvider: TsMorphMetadataProvider,

  entities: ['./dist/src/entities/**/*.js'],
  entitiesTs: ['./src/entities/**/*.ts'],

  dbName: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? (DB_TYPE === 'postgresql' ? 5432 : 1433)),

  // Recommended settings
  debug: process.env.NODE_ENV === 'development',
  allowGlobalContext: true,

  // Schema generation
  schemaGenerator: {
    disableForeignKeys: false,
    createForeignKeyConstraints: true,
  },

  // Migrations
  migrations: {
    path: './dist/src/migrations',
    pathTs: './src/migrations',
  },

  // Seeders
  seeder: {
    path: './dist/src/seeders',
    pathTs: './src/seeders',
    defaultSeeder: 'DatabaseSeeder',
  },
};

export default config;
```

### Frontend `environment.ts`

```typescript
export const environment = {
  production: false,
  apiBaseUrl: '/api/v1',
  enableMockData: false,
  featureConfigRefreshInterval: 300000, // 5 minutes
};
```

---

## 4. Feature Configuration System

### 4.1 Feature Config Database Schema (MikroORM Entities)

```typescript
// src/entities/Role.ts
import { Entity, PrimaryKey, Property, OneToMany, OneToOne, Collection } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity({ tableName: 'roles' })
export class Role {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  name!: string;  // CUSTOMER, MANAGER, ADMIN

  @Property()
  displayName!: string;

  @Property({ nullable: true })
  description?: string;

  @Property({ default: true })
  isActive: boolean = true;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => User, user => user.role)
  users = new Collection<User>(this);

  @OneToOne(() => RoleFeatureConfig, config => config.role, { nullable: true })
  featureConfig?: RoleFeatureConfig;
}

// src/entities/RoleFeatureConfig.ts
@Entity({ tableName: 'role_feature_configs' })
export class RoleFeatureConfig {
  @PrimaryKey()
  id: string = uuid();

  @OneToOne(() => Role, { owner: true })
  role!: Role;

  @Property({ type: 'json' })
  config!: Record<string, unknown>;  // Full feature configuration

  @Property({ default: 1 })
  version: number = 1;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

// src/entities/Feature.ts
@Entity({ tableName: 'features' })
export class Feature {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  code!: string;  // e.g., "catalog.browse", "orders.manage"

  @Property()
  name!: string;

  @Property({ nullable: true })
  description?: string;

  @Property()
  category!: string;  // catalog, orders, inventory, admin

  @Property({ default: true })
  isActive: boolean = true;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
```

### 4.2 Feature Config JSON Structure

```typescript
interface RoleFeatureConfig {
  role: string;
  version: number;
  
  // Features this role can access
  features: {
    catalog: {
      browse: boolean;
      search: boolean;
      viewDetail: boolean;
      fitmentFilter: boolean;
    };
    cart: {
      view: boolean;
      modify: boolean;
      checkout: boolean;
    };
    orders: {
      viewOwn: boolean;
      viewAll: boolean;
      updateStatus: boolean;
      cancel: boolean;
      viewStatistics: boolean;
    };
    inventory: {
      view: boolean;
      adjust: boolean;
      import: boolean;
      viewHistory: boolean;
      viewAlerts: boolean;
    };
    products: {
      create: boolean;
      update: boolean;
      delete: boolean;
      manageFitment: boolean;
      manageImages: boolean;
    };
    dropship: {
      viewOrders: boolean;
      retryPush: boolean;
      manageAffiliates: boolean;
    };
    users: {
      viewAll: boolean;
      create: boolean;
      updateRole: boolean;
      delete: boolean;
    };
    settings: {
      view: boolean;
      update: boolean;
    };
    audit: {
      view: boolean;
      export: boolean;
    };
    reports: {
      salesByDay: boolean;
      salesByCategory: boolean;
      inventoryValue: boolean;
      gmv: boolean;
    };
  };

  // Navigation menu items for this role
  navigation: {
    primary: NavigationItem[];
    secondary?: NavigationItem[];
    account: NavigationItem[];
  };

  // UI customization
  ui: {
    dashboardLayout: 'customer' | 'operations' | 'admin';
    showPriceHistory: boolean;
    showCostPrice: boolean;
    showAuditInfo: boolean;
  };
}

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  children?: NavigationItem[];
  badge?: {
    type: 'count' | 'dot';
    source: string;  // API endpoint for badge data
  };
}
```

### 4.3 Default Role Configurations

#### CUSTOMER Config

```json
{
  "role": "CUSTOMER",
  "version": 1,
  "features": {
    "catalog": { "browse": true, "search": true, "viewDetail": true, "fitmentFilter": true },
    "cart": { "view": true, "modify": true, "checkout": true },
    "orders": { "viewOwn": true, "viewAll": false, "updateStatus": false, "cancel": false, "viewStatistics": false },
    "inventory": { "view": false, "adjust": false, "import": false, "viewHistory": false, "viewAlerts": false },
    "products": { "create": false, "update": false, "delete": false, "manageFitment": false, "manageImages": false },
    "dropship": { "viewOrders": false, "retryPush": false, "manageAffiliates": false },
    "users": { "viewAll": false, "create": false, "updateRole": false, "delete": false },
    "settings": { "view": false, "update": false },
    "audit": { "view": false, "export": false },
    "reports": { "salesByDay": false, "salesByCategory": false, "inventoryValue": false, "gmv": false }
  },
  "navigation": {
    "primary": [
      { "id": "home", "label": "Home", "icon": "home", "route": "/" },
      { "id": "products", "label": "Products", "icon": "grid_view", "route": "/products" },
      { "id": "cart", "label": "Cart", "icon": "shopping_cart", "route": "/cart", "badge": { "type": "count", "source": "/api/v1/cart/count" } }
    ],
    "account": [
      { "id": "orders", "label": "My Orders", "icon": "package", "route": "/orders" },
      { "id": "profile", "label": "Profile", "icon": "person", "route": "/account/profile" },
      { "id": "addresses", "label": "Addresses", "icon": "location_on", "route": "/account/addresses" }
    ]
  },
  "ui": {
    "dashboardLayout": "customer",
    "showPriceHistory": false,
    "showCostPrice": false,
    "showAuditInfo": false
  }
}
```

#### MANAGER Config

```json
{
  "role": "MANAGER",
  "version": 1,
  "features": {
    "catalog": { "browse": true, "search": true, "viewDetail": true, "fitmentFilter": true },
    "cart": { "view": false, "modify": false, "checkout": false },
    "orders": { "viewOwn": false, "viewAll": true, "updateStatus": true, "cancel": true, "viewStatistics": true },
    "inventory": { "view": true, "adjust": true, "import": true, "viewHistory": true, "viewAlerts": true },
    "products": { "create": true, "update": true, "delete": true, "manageFitment": true, "manageImages": true },
    "dropship": { "viewOrders": true, "retryPush": true, "manageAffiliates": false },
    "users": { "viewAll": false, "create": false, "updateRole": false, "delete": false },
    "settings": { "view": false, "update": false },
    "audit": { "view": false, "export": false },
    "reports": { "salesByDay": true, "salesByCategory": true, "inventoryValue": true, "gmv": false }
  },
  "navigation": {
    "primary": [
      { "id": "dashboard", "label": "Dashboard", "icon": "dashboard", "route": "/dashboard" },
      { "id": "orders", "label": "Orders", "icon": "package", "route": "/orders", "badge": { "type": "count", "source": "/api/v1/orders/pending-count" } },
      { "id": "inventory", "label": "Inventory", "icon": "inventory_2", "route": "/inventory", "badge": { "type": "dot", "source": "/api/v1/inventory/has-alerts" } },
      { "id": "products", "label": "Products", "icon": "category", "route": "/products-manage" },
      { "id": "dropship", "label": "Drop Ship", "icon": "local_shipping", "route": "/dropship" },
      { "id": "reports", "label": "Reports", "icon": "bar_chart", "route": "/reports" }
    ],
    "account": [
      { "id": "profile", "label": "Profile", "icon": "person", "route": "/account/profile" }
    ]
  },
  "ui": {
    "dashboardLayout": "operations",
    "showPriceHistory": true,
    "showCostPrice": true,
    "showAuditInfo": false
  }
}
```

#### ADMIN Config

```json
{
  "role": "ADMIN",
  "version": 1,
  "features": {
    "catalog": { "browse": true, "search": true, "viewDetail": true, "fitmentFilter": true },
    "cart": { "view": false, "modify": false, "checkout": false },
    "orders": { "viewOwn": false, "viewAll": true, "updateStatus": true, "cancel": true, "viewStatistics": true },
    "inventory": { "view": true, "adjust": true, "import": true, "viewHistory": true, "viewAlerts": true },
    "products": { "create": true, "update": true, "delete": true, "manageFitment": true, "manageImages": true },
    "dropship": { "viewOrders": true, "retryPush": true, "manageAffiliates": true },
    "users": { "viewAll": true, "create": true, "updateRole": true, "delete": true },
    "settings": { "view": true, "update": true },
    "audit": { "view": true, "export": true },
    "reports": { "salesByDay": true, "salesByCategory": true, "inventoryValue": true, "gmv": true }
  },
  "navigation": {
    "primary": [
      { "id": "dashboard", "label": "Dashboard", "icon": "dashboard", "route": "/dashboard" },
      { "id": "orders", "label": "Orders", "icon": "package", "route": "/orders" },
      { "id": "inventory", "label": "Inventory", "icon": "inventory_2", "route": "/inventory" },
      { "id": "products", "label": "Products", "icon": "category", "route": "/products-manage" },
      { "id": "dropship", "label": "Drop Ship", "icon": "local_shipping", "route": "/dropship" },
      { "id": "reports", "label": "Reports", "icon": "bar_chart", "route": "/reports" }
    ],
    "secondary": [
      { "id": "users", "label": "Users", "icon": "group", "route": "/users" },
      { "id": "settings", "label": "Settings", "icon": "settings", "route": "/settings" },
      { "id": "audit", "label": "Audit Log", "icon": "history", "route": "/audit" }
    ],
    "account": [
      { "id": "profile", "label": "Profile", "icon": "person", "route": "/account/profile" }
    ]
  },
  "ui": {
    "dashboardLayout": "admin",
    "showPriceHistory": true,
    "showCostPrice": true,
    "showAuditInfo": true
  }
}
```

### 4.4 Feature Config API

```
GET /api/v1/auth/feature-config
```

Returns the feature configuration for the authenticated user's role. Called on login and cached in frontend.

---

## 5. Roles & Permissions

### 5.1 Role Definitions

| Role | Purpose | Default |
|------|---------|---------|
| CUSTOMER | Regular shoppers, end users | Yes (new registrations) |
| MANAGER | Operations staff, warehouse, fulfillment | No |
| ADMIN | System administrators, owners | No |

### 5.2 Permission Matrix

| Feature | CUSTOMER | MANAGER | ADMIN |
|---------|----------|---------|-------|
| **Catalog** |
| Browse products | ✅ | ✅ | ✅ |
| Search products | ✅ | ✅ | ✅ |
| View product details | ✅ | ✅ | ✅ |
| Fitment filters | ✅ | ✅ | ✅ |
| **Cart & Checkout** |
| View/modify cart | ✅ | ❌ | ❌ |
| Checkout | ✅ | ❌ | ❌ |
| **Orders** |
| View own orders | ✅ | ❌ | ❌ |
| View all orders | ❌ | ✅ | ✅ |
| Update order status | ❌ | ✅ | ✅ |
| Cancel orders | ❌ | ✅ | ✅ |
| View order statistics | ❌ | ✅ | ✅ |
| **Inventory** |
| View inventory levels | ❌ | ✅ | ✅ |
| Adjust inventory | ❌ | ✅ | ✅ |
| Import from XLSX | ❌ | ✅ | ✅ |
| View history | ❌ | ✅ | ✅ |
| **Products** |
| Create/update/delete | ❌ | ✅ | ✅ |
| Manage fitment | ❌ | ✅ | ✅ |
| Manage images | ❌ | ✅ | ✅ |
| **Drop Shipping** |
| View affiliate orders | ❌ | ✅ | ✅ |
| Retry failed pushes | ❌ | ✅ | ✅ |
| Manage affiliates | ❌ | ❌ | ✅ |
| **Users** |
| View all users | ❌ | ❌ | ✅ |
| Create/update/delete | ❌ | ❌ | ✅ |
| Assign roles | ❌ | ❌ | ✅ |
| **Settings** |
| View/update settings | ❌ | ❌ | ✅ |
| **Audit** |
| View audit logs | ❌ | ❌ | ✅ |
| **Reports** |
| Sales reports | ❌ | ✅ | ✅ |
| Inventory value | ❌ | ✅ | ✅ |
| GMV dashboard | ❌ | ❌ | ✅ |

---

## 6. Inventory & Drop-Shipping Model

### 6.1 Inventory (Local Stock)

Master data originates from the **Inventory XLSX file**. Required columns:

| Column | Description | Maps To |
|--------|-------------|---------|
| `SN Part Number` | SKU identifier | `Product.sku` |
| `Description` | Product name/description | `Product.name`, `Product.description` |
| `Make` | Vehicle make | `ProductFitment.make` |
| `Model` | Vehicle model | `ProductFitment.model` |
| `Master Category` | Top-level category | `Category.name` |
| `Sub Category` | Child category | `Category.name` (with parent) |
| `From Year` | Fitment start year | `ProductFitment.yearStart` |
| `To Year` | Fitment end year | `ProductFitment.yearEnd` |
| `QTY Ordered` | Initial stock quantity | `Product.stockQuantity` |
| `UPC Code` | UPC barcode | `Product.upc` |
| `Length` | Package length | `Product.length` |
| `Width` | Package width | `Product.width` |
| `Height` | Package height | `Product.height` |
| `Weight` | Package weight | `Product.weight` |

#### Import Flow

```
XLSX File → Parse → Validate → Upsert Products → Create Fitments → Log Inventory
```

#### Product Stock Statuses

```typescript
enum StockStatus {
  IN_STOCK = 'in_stock',        // qty > lowStockThreshold
  LOW_STOCK = 'low_stock',      // qty > 0 && qty <= lowStockThreshold
  OUT_OF_STOCK = 'out_of_stock' // qty === 0
}
```

### 6.2 Drop-Shipping / Affiliates

A product can have one of three fulfillment types:

```typescript
enum FulfillmentType {
  INVENTORY = 'inventory',   // Local stock only
  DROPSHIP = 'dropship',     // Affiliate only
  MIXED = 'mixed'            // Can be fulfilled either way
}
```

#### Drop-Ship Order Flow

```
1. Customer places order (items may include inventory + drop-ship products)
2. Single unified Order created in local DB
3. For each affiliate with items in the order:
   a. Create AffiliateOrder record (status = PENDING)
   b. Background job posts order to affiliate API
4. On success: status = SENT → CONFIRMED, store externalOrderId
5. On failure: status = FAILED, log error, schedule retry
6. Manager can manually retry failed pushes from dashboard

Important: Customer sees ONE order; affiliate orders are internal implementation.
```

---

## 7. Supplier Integrations

The system supports multiple supplier/affiliate integrations for drop-shipping. Each supplier is implemented as a **pluggable integration module**.

### 7.1 Supplier Integration Architecture

```
backend2/src/
└── integrations/
    ├── supplier.interface.ts     # Common interface for all suppliers
    ├── supplier.router.ts        # Routes orders to correct supplier
    ├── a-premium/                # A-Premium integration
    │   ├── apremium.types.ts
    │   ├── apremium.client.ts
    │   ├── apremium.service.ts
    │   ├── apremium.mapper.ts
    │   └── index.ts
    ├── buyautoparts/             # BuyAutoParts integration
    │   ├── buyautoparts.types.ts
    │   ├── buyautoparts.client.ts
    │   ├── buyautoparts.service.ts
    │   ├── buyautoparts.mapper.ts
    │   └── index.ts
    ├── trq/                      # TRQ integration
    │   ├── trq.types.ts
    │   ├── trq.client.ts
    │   ├── trq.service.ts
    │   ├── trq.mapper.ts
    │   └── index.ts
    ├── email/                    # Email integration (Resend)
    │   ├── email.types.ts
    │   ├── email.client.ts
    │   ├── email.service.ts
    │   ├── index.ts
    │   └── templates/
    │       ├── base.template.ts
    │       ├── order-confirmation.template.ts
    │       ├── order-shipped.template.ts
    │       ├── password-reset.template.ts
    │       ├── welcome.template.ts
    │       └── low-stock-alert.template.ts
    └── payments/                 # Stripe integration
        ├── stripe.types.ts
        ├── stripe.client.ts
        ├── stripe.service.ts
        ├── stripe.webhooks.ts
        └── index.ts
```

### 7.2 Supplier Interface

```typescript
// src/integrations/supplier.interface.ts
export interface SupplierOffer {
  supplierId: string;
  supplierSku: string;
  description: string;
  brand: string;
  price: number;
  currency: string;
  availableQty: number;
  leadTimeDays?: number;
}

export interface SupplierOrderRequest {
  purchaseOrderNumber: string;   // Your internal order reference
  shipTo: SupplierAddress;
  lines: SupplierOrderLine[];
  shipMethod: string;
}

export interface SupplierOrderResult {
  supplierId: string;
  supplierOrderId: string;
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  estimatedShipDate?: string;
  errorMessage?: string;
}

export interface SupplierStatusResult {
  supplierOrderId: string;
  status: string;
  shipped: boolean;
  trackingNumbers: TrackingInfo[];
}

export interface SupplierIntegration {
  readonly supplierId: string;
  
  searchOffers(params: SupplierSearchParams): Promise<SupplierOffer[]>;
  createOrder(request: SupplierOrderRequest): Promise<SupplierOrderResult>;
  getOrderStatus(supplierOrderId: string): Promise<SupplierStatusResult>;
}
```

---

## 8. Repository Layout

No monorepo tooling. Frontend and backend are **independent projects**.

```
/
├── frontend2/                    # Angular application
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── proxy.conf.json          # Dev proxy to backend
│   └── src/
│       ├── main.ts
│       ├── index.html
│       ├── styles.scss
│       ├── styles/
│       │   ├── _tokens.scss      # CSS custom properties
│       │   ├── _components.scss  # Component styles
│       │   ├── _utilities.scss   # Utility classes
│       │   ├── _breakpoints.scss # Responsive breakpoints
│       │   └── _globals.scss     # Global styles
│       ├── assets/
│       │   └── images/           # Static images
│       ├── environments/
│       │   ├── environment.ts
│       │   └── environment.prod.ts
│       └── app/
│           ├── app.component.ts
│           ├── app.component.html
│           ├── app.component.scss
│           ├── app.config.ts
│           ├── app.routes.ts
│           ├── core/              # Singleton services, guards, interceptors
│           ├── shared/            # Reusable components, directives, pipes
│           └── features/          # Feature modules (lazy-loaded)
│
├── backend2/                     # Fastify API
│   ├── package.json
│   ├── tsconfig.json
│   ├── mikro-orm.config.ts       # MikroORM configuration (runtime DB switching)
│   └── src/
│       ├── index.ts              # Server entry point
│       ├── config/               # Configuration
│       ├── entities/             # MikroORM entities (single definition for all DBs)
│       ├── migrations/           # Database migrations
│       ├── seeders/              # Database seeding
│       ├── plugins/              # Fastify plugins
│       ├── routes/               # API routes
│       ├── services/             # Business logic
│       ├── schemas/              # Zod schemas
│       ├── integrations/         # External integrations
│       ├── jobs/                 # Background jobs
│       ├── middleware/           # Request middleware
│       └── utils/                # Utilities
│
├── docs/                         # Documentation
│   ├── README.md
│   ├── 01-overview.md
│   ├── ...
│   └── openapi.yaml              # OpenAPI specification
│
└── snautoparts.md                # This file
```

### 8.1 Frontend Detailed Structure

```
frontend2/src/app/
├── core/
│   ├── content/
│   │   └── app.content.ts         # Centralized UI text/labels
│   ├── directives/
│   │   ├── feature-visible.directive.ts  # Show/hide by feature config
│   │   └── index.ts
│   ├── guards/
│   │   ├── auth.guard.ts          # Authentication check
│   │   └── feature.guard.ts       # Feature-config based access
│   ├── interceptors/
│   │   ├── auth.interceptor.ts    # Add credentials to requests
│   │   └── error.interceptor.ts   # Global error handling
│   ├── models/
│   │   ├── api.types.ts           # API response types
│   │   ├── user.model.ts          # User interfaces
│   │   ├── product.model.ts       # Product interfaces
│   │   ├── order.model.ts         # Order interfaces
│   │   ├── cart.model.ts          # Cart interfaces
│   │   ├── feature-config.model.ts # Feature config interfaces
│   │   ├── admin.model.ts         # Admin interfaces
│   │   └── index.ts
│   ├── services/
│   │   ├── api.service.ts         # Base HTTP client with error handling
│   │   ├── auth.service.ts        # Authentication + session management
│   │   ├── feature-config.service.ts # Feature configuration + caching
│   │   ├── cart.service.ts        # Cart operations
│   │   ├── catalog.service.ts     # Product catalog + categories + brands
│   │   ├── checkout.service.ts    # Checkout flow + Stripe integration
│   │   ├── order.service.ts       # Order management + tracking
│   │   ├── inventory.service.ts   # Inventory operations (manager)
│   │   ├── admin.service.ts       # Admin operations (users, settings, audit)
│   │   ├── product.service.ts     # Product management
│   │   ├── user.service.ts        # User management
│   │   ├── notification.service.ts # Toast notifications
│   │   ├── mock-data.service.ts   # Mock API responses for development
│   │   ├── mock-data/
│   │   │   ├── catalog.mock.ts
│   │   │   ├── orders.mock.ts
│   │   │   ├── inventory.mock.ts
│   │   │   ├── users.mock.ts
│   │   │   ├── settings.mock.ts
│   │   │   ├── affiliates.mock.ts
│   │   │   ├── reports.mock.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   └── utils/
│
├── shared/
│   ├── components/
│   │   ├── header/                # App header with navigation
│   │   ├── footer/                # App footer with links
│   │   ├── product-card/          # Reusable product card for listings
│   │   ├── search-dropdown/       # Search with autocomplete dropdown
│   │   ├── fitment-selector/      # Year/Make/Model cascading filter
│   │   ├── pagination/            # Pagination component
│   │   ├── data-table/            # Reusable data table
│   │   ├── empty-state/           # Empty state placeholder
│   │   ├── quantity-selector/     # Quantity input with +/- buttons
│   │   └── index.ts
│   ├── primitives/
│   │   ├── badge/                 # Status badges
│   │   ├── button/                # Button component
│   │   ├── card/                  # Card component
│   │   ├── checkbox/              # Checkbox component
│   │   ├── dialog/                # Modal dialog
│   │   ├── form-field/            # Form field wrapper
│   │   ├── icon/                  # SVG icon component
│   │   ├── input/                 # Input component
│   │   ├── select/                # Select dropdown
│   │   ├── spinner/               # Loading spinner
│   │   ├── toast/                 # Toast notifications
│   │   └── index.ts
│   ├── layouts/
│   │   ├── main-layout/           # Customer-facing layout
│   │   ├── dashboard-layout/      # Manager/Admin dashboard layout
│   │   ├── auth-layout/           # Login/register layout
│   │   └── index.ts
│   └── utils/
│       ├── form.utils.ts          # Form validation utilities
│       └── index.ts
│
└── features/
    ├── auth/
    │   ├── login/
    │   ├── register/
    │   ├── forgot-password/
    │   ├── reset-password/
    │   └── auth.routes.ts
    │
    ├── home/
    │   └── home.component.ts      # Landing page
    │
    ├── catalog/
    │   ├── category-listing/      # Category browse page
    │   ├── product-listing/       # Product grid/list with filters
    │   └── product-detail/        # Product page with fitment info
    │
    ├── cart/
    │   └── cart.component.ts      # Shopping cart
    │
    ├── checkout/
    │   ├── checkout.routes.ts
    │   ├── checkout-layout/       # Checkout wrapper
    │   ├── shipping-address/      # Step 1: Address
    │   ├── shipping-method/       # Step 2: Shipping
    │   ├── payment/               # Step 3: Payment
    │   ├── review/                # Step 4: Review
    │   └── confirmation/          # Step 5: Confirmation
    │
    ├── account/
    │   ├── account.routes.ts
    │   ├── profile/               # User profile
    │   ├── addresses/             # Address management
    │   ├── vehicles/              # Saved vehicles
    │   └── change-password/       # Password change
    │
    ├── orders/
    │   ├── orders.routes.ts
    │   ├── order-list/            # Order list (customer/manager)
    │   ├── order-detail/          # Order details
    │   └── order-tracking/        # Public order tracking
    │
    ├── dashboard/
    │   └── dashboard.component.ts # Dashboard (layout based on role)
    │
    ├── admin/
    │   ├── admin.routes.ts
    │   ├── orders/                # Admin order management
    │   ├── inventory/             # Inventory management
    │   │   ├── inventory-detail/
    │   │   └── low-stock/
    │   ├── products/              # Product management
    │   │   ├── products-list/
    │   │   └── product-edit/
    │   ├── dropship/              # Drop-ship orders
    │   ├── affiliates/            # Affiliate management
    │   │   ├── affiliate-detail/
    │   │   └── affiliate-form/
    │   ├── users/                 # User management
    │   │   └── user-form/
    │   ├── settings/              # Settings management
    │   │   ├── general-settings/
    │   │   ├── shipping-settings/
    │   │   ├── tax-settings/
    │   │   ├── payment-settings/
    │   │   └── integration-settings/
    │   ├── reports/               # Reports
    │   │   ├── sales-report/
    │   │   ├── inventory-report/
    │   │   └── gmv-report/
    │   └── audit/                 # Audit log
    │
    ├── inventory/
    │   └── inventory.routes.ts
    │
    ├── products-management/
    │   └── products.routes.ts
    │
    ├── dropship/
    │   └── dropship.routes.ts
    │
    ├── reports/
    │   └── reports.routes.ts
    │
    ├── users/
    │   └── users.routes.ts
    │
    ├── settings/
    │   └── settings.routes.ts
    │
    └── audit/
        └── audit.routes.ts
```

### 8.2 Backend Detailed Structure

```
backend2/src/
├── index.ts                      # Fastify server bootstrap
│
├── config/
│   ├── index.ts                  # Configuration loader
│   ├── env.ts                    # Environment validation (Zod)
│   └── logger.ts                 # Pino logger instance
│
├── entities/                     # MikroORM entities
│   ├── index.ts                  # Entity exports
│   ├── User.ts
│   ├── Session.ts
│   ├── Account.ts
│   ├── Verification.ts
│   ├── Role.ts
│   ├── RoleFeatureConfig.ts
│   ├── Feature.ts
│   ├── Address.ts
│   ├── SavedVehicle.ts
│   ├── Category.ts
│   ├── Brand.ts
│   ├── Product.ts
│   ├── ProductFitment.ts
│   ├── Cart.ts
│   ├── CartItem.ts
│   ├── Order.ts
│   ├── OrderItem.ts
│   ├── OrderTimeline.ts
│   ├── Shipment.ts
│   ├── PaymentEvent.ts
│   ├── InventoryLog.ts
│   ├── Affiliate.ts
│   ├── AffiliateProductMapping.ts
│   ├── AffiliateOrder.ts
│   ├── Setting.ts
│   ├── AuditLog.ts
│   └── Webhook.ts
│
├── migrations/                   # Database migrations
│
├── seeders/
│   ├── DatabaseSeeder.ts         # Main seeder
│   ├── RoleSeeder.ts             # Seed roles and feature configs
│   ├── CategorySeeder.ts         # Seed categories
│   ├── ProductSeeder.ts          # Seed sample products
│   └── InventorySeeder.ts        # Seed inventory
│
├── plugins/
│   ├── mikro-orm.ts              # MikroORM Fastify plugin
│   ├── passport-auth.ts          # Passport.js authentication plugin
│   ├── error-handler.ts          # Global error handler
│   ├── cors.ts                   # CORS configuration
│   ├── rate-limit.ts             # Rate limiting
│   └── swagger.ts                # OpenAPI/Swagger documentation
│
├── routes/
│   ├── index.ts                  # Route registration
│   ├── auth/
│   │   └── index.ts              # Auth routes (login, register, logout, session)
│   ├── catalog/
│   │   └── index.ts              # Public catalog routes
│   ├── cart/
│   │   └── index.ts              # Cart routes
│   ├── checkout/
│   │   └── index.ts              # Checkout routes
│   ├── orders/
│   │   └── index.ts              # Order routes
│   ├── products/
│   │   └── index.ts              # Product management routes
│   ├── inventory/
│   │   └── index.ts              # Inventory routes
│   ├── dropship/
│   │   └── index.ts              # Drop-ship routes
│   ├── profile/
│   │   └── index.ts              # User profile routes
│   ├── users/
│   │   └── index.ts              # User management routes
│   ├── settings/
│   │   └── index.ts              # Settings routes
│   ├── audit/
│   │   └── index.ts              # Audit log routes
│   ├── reports/
│   │   └── index.ts              # Reports routes
│   └── webhooks/
│       └── index.ts              # Webhook routes
│
├── services/
│   ├── index.ts
│   ├── auth.service.ts           # Authentication logic
│   ├── feature-config.service.ts # Feature config management
│   ├── catalog.service.ts        # Catalog queries
│   ├── cart.service.ts           # Cart operations
│   ├── checkout.service.ts       # Checkout pipeline
│   ├── order.service.ts          # Order management
│   ├── inventory.service.ts      # Inventory operations
│   ├── product.service.ts        # Product CRUD
│   ├── dropship.service.ts       # Drop-ship logic
│   ├── affiliate.service.ts      # Affiliate management
│   ├── user.service.ts           # User management
│   ├── settings.service.ts       # Settings CRUD
│   ├── audit.service.ts          # Audit logging
│   ├── email.service.ts          # Email operations
│   ├── stripe.service.ts         # Stripe integration
│   ├── reports.service.ts        # Report generation
│   └── cache.service.ts          # Caching service
│
├── schemas/
│   ├── index.ts
│   ├── auth.schema.ts
│   ├── product.schema.ts
│   ├── order.schema.ts
│   ├── inventory.schema.ts
│   ├── user.schema.ts
│   ├── profile.schema.ts
│   ├── cart.schema.ts
│   └── common.schema.ts
│
├── middleware/
│   ├── index.ts
│   ├── authenticate.ts           # Auth middleware
│   ├── authorize.ts              # Permission check
│   └── validate.ts               # Request validation
│
├── integrations/                 # External integrations (see Section 7)
│
├── jobs/
│   ├── index.ts
│   ├── job-queue.ts              # Job queue interface
│   ├── affiliate-jobs.ts         # Affiliate order processing
│   ├── email-jobs.ts             # Email sending jobs
│   └── cleanup-jobs.ts           # Cleanup tasks
│
└── utils/
    ├── index.ts
    ├── crypto.ts                 # Password hashing (bcrypt)
    ├── slug.ts                   # Slug generation
    ├── pagination.ts             # Pagination helpers
    ├── xlsx-parser.ts            # Excel import parser
    ├── feature-config.ts         # Feature config utilities
    └── openapi.ts                # OpenAPI helpers
```

---

## 9. Database Schema

### 9.1 Core Entities

See `backend2/src/entities/` for full entity definitions. Key entities:

```
Users & Auth:
├── User.ts
├── Session.ts
├── Account.ts
├── Verification.ts
├── Address.ts
├── SavedVehicle.ts
├── Role.ts
└── RoleFeatureConfig.ts

Catalog:
├── Category.ts
├── Brand.ts
├── Product.ts
└── ProductFitment.ts

Cart:
├── Cart.ts
└── CartItem.ts

Orders:
├── Order.ts
├── OrderItem.ts
├── OrderTimeline.ts
├── Shipment.ts
└── PaymentEvent.ts

Inventory:
└── InventoryLog.ts

Drop-Shipping:
├── Affiliate.ts
├── AffiliateProductMapping.ts
└── AffiliateOrder.ts

Admin:
├── Setting.ts
├── AuditLog.ts
├── Feature.ts
└── Webhook.ts
```

---

## 10. API Specification

### 10.1 Base URL & Authentication

```
Base URL: /api/v1

Authentication: Session-based via Passport.js
- Sessions managed with @fastify/secure-session
- Credentials sent via cookies (withCredentials: true)
```

### 10.2 Generic API Endpoints

All endpoints are generic. Authorization is determined by the authenticated user's role and permissions.

#### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/login | ❌ | User login (Passport.js local strategy) |
| POST | /auth/register | ❌ | Register new user |
| POST | /auth/logout | ✅ | User logout |
| GET | /auth/session | ❌ | Check session status |
| GET | /auth/me | ✅ | Get current user |
| POST | /auth/change-password | ✅ | Change password |
| PATCH | /auth/profile | ✅ | Update profile |
| GET | /auth/feature-config | ✅ | Get feature config for user's role |
| GET | /auth/roles | ✅ | List roles (admin only) |

#### Catalog (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /catalog/categories | ❌ | List all categories |
| GET | /catalog/categories/:slug | ❌ | Get category by slug |
| GET | /catalog/brands | ❌ | List all brands |
| GET | /catalog/products | ❌ | List products (with filters) |
| GET | /catalog/products/featured | ❌ | List featured products |
| GET | /catalog/products/:slug | ❌ | Get product by slug |
| GET | /catalog/search | ❌ | Search products |
| GET | /catalog/fitment/makes | ❌ | Get all makes |
| GET | /catalog/fitment/models | ❌ | Get models for make |
| GET | /catalog/fitment/years | ❌ | Get years for make/model |

#### Cart (Customer)

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /cart | ✅ | cart.view |
| POST | /cart/items | ✅ | cart.modify |
| PATCH | /cart/items/:id | ✅ | cart.modify |
| DELETE | /cart/items/:id | ✅ | cart.modify |
| DELETE | /cart | ✅ | cart.modify |
| GET | /cart/count | ✅ | cart.view |

#### Checkout (Customer)

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /checkout/shipping-methods | ✅ | cart.checkout |
| POST | /checkout/payment-intent | ✅ | cart.checkout |
| POST | /checkout/orders | ✅ | cart.checkout |

#### Orders

| Method | Endpoint | Auth | Feature | Notes |
|--------|----------|------|---------|-------|
| GET | /orders | ✅ | orders.viewOwn OR orders.viewAll | Scoped by role |
| GET | /orders/:id | ✅ | orders.viewOwn OR orders.viewAll | Scoped by role |
| PATCH | /orders/:id/status | ✅ | orders.updateStatus | Manager/Admin |
| POST | /orders/:id/cancel | ✅ | orders.cancel | Manager/Admin |
| GET | /orders/statistics | ✅ | orders.viewStatistics | Manager/Admin |
| GET | /orders/pending-count | ✅ | orders.viewAll | For nav badge |
| GET | /orders/track/:orderNumber | ❌ | - | Public tracking |

#### Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /profile | ✅ | Get own profile |
| PATCH | /profile | ✅ | Update own profile |
| GET | /profile/addresses | ✅ | List own addresses |
| POST | /profile/addresses | ✅ | Create address |
| PATCH | /profile/addresses/:id | ✅ | Update address |
| DELETE | /profile/addresses/:id | ✅ | Delete address |
| GET | /profile/vehicles | ✅ | List saved vehicles |
| POST | /profile/vehicles | ✅ | Save a vehicle |
| DELETE | /profile/vehicles/:id | ✅ | Remove saved vehicle |

#### Products (Manager/Admin)

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /products | ✅ | products.* |
| GET | /products/:id | ✅ | products.* |
| POST | /products | ✅ | products.create |
| PATCH | /products/:id | ✅ | products.update |
| DELETE | /products/:id | ✅ | products.delete |

#### Inventory (Manager/Admin)

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /inventory | ✅ | inventory.view |
| GET | /inventory/alerts | ✅ | inventory.viewAlerts |
| POST | /inventory/adjustments | ✅ | inventory.adjust |
| POST | /inventory/import | ✅ | inventory.import |

#### Drop-Shipping (Manager/Admin)

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /dropship/orders | ✅ | dropship.viewOrders |
| POST | /dropship/orders/:id/retry | ✅ | dropship.retryPush |

#### Users (Admin)

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /users | ✅ | users.viewAll |
| GET | /users/:id | ✅ | users.viewAll |
| POST | /users | ✅ | users.create |
| PATCH | /users/:id | ✅ | users.updateRole |
| DELETE | /users/:id | ✅ | users.delete |

#### Settings (Admin)

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /settings | ✅ | settings.view |
| PUT | /settings/:key | ✅ | settings.update |

#### Audit (Admin)

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /audit | ✅ | audit.view |
| GET | /audit/statistics | ✅ | audit.view |

#### Reports (Manager/Admin)

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /reports/sales | ✅ | reports.salesByDay |
| GET | /reports/categories | ✅ | reports.salesByCategory |
| GET | /reports/inventory-value | ✅ | reports.inventoryValue |
| GET | /reports/gmv | ✅ | reports.gmv |

### 10.3 Response Format

**Success Response:**
```json
{
  "data": { ... }
}
```

**Paginated Response:**
```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation error message"
}
```

---

## 11. OpenAPI Specification

The backend automatically generates OpenAPI 3.0 documentation via `@fastify/swagger`.

Access Swagger UI at: `http://localhost:3000/docs`

---

## 12. Frontend Architecture

### 12.1 Feature-Config Driven Routing

```typescript
// app.routes.ts
export const routes: Routes = [
  // Public routes - always available
  { path: '', loadComponent: () => import('@features/home/home.component') },
  { path: 'products', loadComponent: () => import('@features/catalog/product-listing/product-listing.component') },
  { path: 'products/:slug', loadComponent: () => import('@features/catalog/product-detail/product-detail.component') },
  { path: 'cart', loadComponent: () => import('@features/cart/cart.component') },
  
  // Auth routes
  { path: 'login', loadComponent: () => import('@features/auth/login/login.component') },
  { path: 'register', loadComponent: () => import('@features/auth/register/register.component') },
  
  // Protected routes - guarded by featureGuard
  {
    path: 'checkout',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'cart.checkout' },
    loadChildren: () => import('@features/checkout/checkout.routes'),
  },
  {
    path: 'orders',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'orders.viewOwn|orders.viewAll' },
    loadChildren: () => import('@features/orders/orders.routes'),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('@features/dashboard/dashboard.component'),
  },
  {
    path: 'inventory',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'inventory.view' },
    loadChildren: () => import('@features/inventory/inventory.routes'),
  },
  // ... more routes
];
```

### 12.2 Auth Service (Session-Based)

```typescript
// core/services/auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private featureConfig = inject(FeatureConfigService);

  private currentUser = signal<User | null>(null);
  
  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser());

  async login(credentials: LoginCredentials): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<AuthResponse>('/api/v1/auth/login', credentials, {
        withCredentials: true // Required for session cookies
      })
    );

    this.currentUser.set(response.user);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    
    await this.featureConfig.loadConfig();
  }

  async logout(): Promise<void> {
    await firstValueFrom(
      this.http.post('/api/v1/auth/logout', {}, { withCredentials: true })
    );
    this.clearSession();
  }
}
```

### 12.3 Feature Config Service

```typescript
// core/services/feature-config.service.ts
@Injectable({ providedIn: 'root' })
export class FeatureConfigService {
  private api = inject(ApiService);
  private config = signal<FeatureConfig | null>(null);
  
  readonly navigation = computed(() => this.config()?.navigation);
  readonly features = computed(() => this.config()?.features);
  readonly ui = computed(() => this.config()?.ui);
  readonly dashboardLayout = computed(() => this.config()?.ui?.dashboardLayout ?? 'customer');

  async loadConfig(): Promise<void> {
    const config = await this.api.get<FeatureConfig>('/auth/feature-config');
    this.config.set(config);
  }

  hasFeature(featurePath: string): boolean {
    const features = this.features();
    if (!features) return false;

    const [category, feature] = featurePath.split('.');
    return features[category]?.[feature] === true;
  }
}
```

### 12.4 Feature Guard

```typescript
// core/guards/feature.guard.ts
export const featureGuard: CanActivateFn = (route) => {
  const featureConfigService = inject(FeatureConfigService);
  const router = inject(Router);

  const requiredFeature = route.data['feature'] as string;
  
  // Handle OR conditions (feature1|feature2)
  const features = requiredFeature.split('|');
  const hasAccess = features.some(f => featureConfigService.hasFeature(f));

  if (!hasAccess) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
```

### 12.5 Feature-Visible Directive

```typescript
// core/directives/feature-visible.directive.ts
@Directive({
  selector: '[featureVisible]',
  standalone: true
})
export class FeatureVisibleDirective implements OnInit {
  @Input() featureVisible!: string;

  private featureConfig = inject(FeatureConfigService);
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);

  ngOnInit() {
    const features = this.featureVisible.split('|');
    const hasAccess = features.some(f => this.featureConfig.hasFeature(f));

    if (hasAccess) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

// Usage in template:
// <button *featureVisible="'orders.cancel'">Cancel Order</button>
```

---

## 13. Background Jobs & Webhooks

### 13.1 Background Job Queue

The system uses background jobs for async processing:

```typescript
// src/jobs/job-queue.ts
export enum JobType {
  // Affiliate/Supplier Jobs
  AFFILIATE_ORDER_PUSH = 'affiliate:order:push',
  AFFILIATE_ORDER_RETRY = 'affiliate:order:retry',
  AFFILIATE_STATUS_SYNC = 'affiliate:status:sync',
  
  // Inventory Jobs
  INVENTORY_LOW_STOCK_ALERT = 'inventory:low-stock:alert',
  INVENTORY_IMPORT_PROCESS = 'inventory:import:process',
  
  // Order Jobs
  ORDER_CONFIRMATION_EMAIL = 'order:email:confirmation',
  ORDER_SHIPPED_EMAIL = 'order:email:shipped',
  
  // Cleanup Jobs
  CLEANUP_EXPIRED_CARTS = 'cleanup:carts:expired',
  CLEANUP_EXPIRED_SESSIONS = 'cleanup:sessions:expired',
}
```

### 13.2 Stripe Webhooks

Handle Stripe payment events:

```typescript
// POST /webhooks/stripe
switch (event.type) {
  case 'payment_intent.succeeded':
    await handlePaymentSuccess(event.data.object);
    break;
  case 'payment_intent.payment_failed':
    await handlePaymentFailed(event.data.object);
    break;
  case 'charge.refunded':
    await handleRefund(event.data.object);
    break;
}
```

### 13.3 Email Templates

The email integration includes pre-built templates:

| Template | Trigger |
|----------|---------|
| Welcome | New user registration |
| Order Confirmation | Order placed + payment confirmed |
| Order Shipped | Order status → SHIPPED |
| Order Cancelled | Order cancelled |
| Password Reset | Password reset requested |
| Low Stock Alert | Stock below threshold |

---

## 14. Content & Localization

### 14.1 Centralized Content

All UI text is centralized in `frontend2/src/app/core/content/app.content.ts`:

```typescript
export const APP_CONTENT = {
  brand: {
    name: 'SN Auto Parts',
    tagline: 'Quality Parts. Guaranteed Fitment.',
    phone: '(555) 123-4567',
    email: 'support@snautoparts.com',
  },
  navigation: { ... },
  home: { ... },
  catalog: { ... },
  cart: { ... },
  checkout: { ... },
  auth: { ... },
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {{min}} characters',
  },
} as const;
```

---

## 15. Caching Strategy

### 15.1 Backend Caching

| Data | Cache TTL | Strategy |
|------|-----------|----------|
| Feature Config | 5 min | In-memory + invalidate on update |
| Categories | 10 min | In-memory, invalidate on CRUD |
| Brands | 10 min | In-memory, invalidate on CRUD |
| Product List | 2 min | Query-based cache key |
| Fitment Options | 1 hour | Rarely changes |

### 15.2 Frontend Caching

- Feature config cached in signal, refreshed on login
- User info cached in localStorage
- Categories cached in service with TTL

---

## 16. Implementation Order

### Phase 1: Foundation ✅
1. Backend core setup (Fastify, MikroORM, Passport.js)
2. MikroORM entities for Role and FeatureConfig
3. Feature config service and API
4. Frontend shell with feature-config loading

### Phase 2: Customer Flow ✅
1. Catalog browsing and search
2. Fitment filter (Year/Make/Model)
3. Shopping cart
4. Checkout with Stripe
5. Order history (own orders)
6. Profile and addresses

### Phase 3: Operations Dashboard ✅
1. Orders management (view all, update status)
2. Inventory management (view, adjust)
3. XLSX import
4. Low stock alerts
5. Products management
6. Basic sales reports

### Phase 4: Drop-Shipping ✅
1. Affiliate entity and configuration
2. Product-affiliate mapping
3. Order splitting and affiliate push
4. Retry mechanism
5. Affiliate order dashboard

### Phase 5: Admin Features ✅
1. User management
2. Role assignment
3. Settings management
4. Audit logging
5. GMV and advanced reports

### Phase 6: Polish
1. Test SQL Server by switching `DB_TYPE=mssql`
2. Email notifications
3. Performance optimization
4. Testing and documentation

---

## Appendix A: Inventory XLSX Format

Expected columns in the inventory import file:

| Column | Required | Type | Example |
|--------|----------|------|---------|
| SN Part Number | ✅ | String | "SNP-12345" |
| Description | ✅ | String | "Oil Filter - Premium" |
| Make | ✅ | String | "Chevrolet" |
| Model | ✅ | String | "Silverado" |
| Master Category | ✅ | String | "Engine Parts" |
| Sub Category | ❌ | String | "Filters" |
| From Year | ✅ | Number | 2018 |
| To Year | ✅ | Number | 2024 |
| QTY Ordered | ✅ | Number | 50 |
| UPC Code | ❌ | String | "123456789012" |
| Length | ❌ | Number | 8.5 |
| Width | ❌ | Number | 4.2 |
| Height | ❌ | Number | 4.0 |
| Weight | ❌ | Number | 1.2 |
| Cost Price | ❌ | Number | 12.99 |
| Sell Price | ❌ | Number | 24.99 |

---

## Appendix B: Error Codes

| Code | Name | Description |
|------|------|-------------|
| 400 | Bad Request | Invalid request data or validation error |
| 401 | Unauthorized | Authentication required or invalid session |
| 403 | Forbidden | Insufficient permissions for this action |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate, race condition) |
| 422 | Unprocessable | Business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Unexpected server error |

---

## Appendix C: Environment Variables Reference

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NODE_ENV | ❌ | development | development, production, test |
| PORT | ❌ | 3000 | Server port |
| **Database (MikroORM)** |
| DB_TYPE | ❌ | postgresql | Database type: `postgresql` or `mssql` |
| DB_HOST | ❌ | localhost | Database host |
| DB_PORT | ❌ | 5432/1433 | Database port (auto-detected by DB_TYPE) |
| DB_NAME | ❌ | snautoparts | Database name |
| DB_USER | ❌ | postgres | Database user |
| DB_PASSWORD | ❌ | - | Database password |
| **Auth** |
| BETTER_AUTH_SECRET | ❌ | dev-secret | Session secret (min 32 chars for production) |
| **Stripe** |
| STRIPE_SECRET_KEY | ❌ | - | Stripe secret key |
| STRIPE_WEBHOOK_SECRET | ❌ | - | Stripe webhook secret |
| **Email** |
| RESEND_API_KEY | ❌ | - | Resend API key |
| RESEND_FROM_EMAIL | ❌ | noreply@snautoparts.com | From email address |
| **Supplier Integrations** |
| APREMIUM_API_URL | ❌ | - | A-Premium API URL |
| APREMIUM_API_KEY | ❌ | - | A-Premium API key |
| BUYAUTOPARTS_API_URL | ❌ | - | BuyAutoParts API URL |
| BUYAUTOPARTS_API_KEY | ❌ | - | BuyAutoParts API key |
| TRQ_API_URL | ❌ | - | TRQ API URL |
| TRQ_API_KEY | ❌ | - | TRQ API key |
| **Other** |
| LOG_LEVEL | ❌ | info | Pino log level |
| FEATURE_CONFIG_CACHE_TTL | ❌ | 300 | Feature config cache TTL (seconds) |

### Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| apiBaseUrl | /api/v1 | API base URL |
| production | false | Production mode |
| enableMockData | false | Use mock data |
| featureConfigRefreshInterval | 300000 | Feature config refresh (ms) |

---

## Appendix D: Testing Strategy

### Backend Testing

```bash
cd backend2

# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend2

# Run unit tests
ng test

# Run with coverage
ng test --code-coverage
```

---

## Appendix E: Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhook endpoint configured
- [ ] SSL certificates installed
- [ ] CORS origins configured

### Health Check Endpoint

```
GET /health
```

```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": "connected",
  "timestamp": "2026-01-07T12:00:00Z"
}
```

---

## Appendix F: Development Commands

### Backend

```bash
cd backend2

# Install dependencies
npm install

# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Start production
npm start

# Database
npm run migration:create     # Create migration
npm run migration:up         # Apply migrations
npm run migration:down       # Rollback last migration
npm run seeder:run           # Run seeders
npm run schema:fresh         # Fresh schema (dev only)
```

### Frontend

```bash
cd frontend2

# Install dependencies
npm install

# Development server (port 4200)
npm run dev     # or: ng serve

# Build for production
npm run build:prod

# Run tests
ng test

# Lint
ng lint
```

---

*End of README*
