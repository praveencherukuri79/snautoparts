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
| Angular (Standalone APIs) | Component framework |
| Angular Signals | Local/UI state management |
| Angular Reactive Forms | All form handling |
| Angular Material | UI components |
| Tailwind CSS | Layout & utilities |
| TypeScript | Type safety |
| ngx-charts | Dashboard visualizations |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js + Fastify | HTTP server |
| TypeScript | Type safety |
| MikroORM | ORM with native multi-DB support |
| Zod | Schema validation |
| Better Auth | Authentication + Sessions |
| Stripe | Payment processing |
| Resend | Transactional email |
| Pino | Structured logging |

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

1. All authenticated requests include a session token
2. Backend extracts user role from the session
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
// 1. Authenticate user
// 2. Fetch role from auth response
// 3. Fetch feature config for that role
// 4. Load features and menu based on config

interface FeatureConfig {
  features: FeatureDefinition[];
  navigation: NavigationItem[];
  permissions: PermissionSet;
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
DB_PASS=your-password

# Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000

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
// src/mikro-orm.config.ts
import { defineConfig } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { MsSqlDriver } from '@mikro-orm/mssql';

const DB_TYPE = (process.env.DB_TYPE ?? 'postgresql') as 'postgresql' | 'mssql';

export default defineConfig({
  // Runtime database switching - same entities work for both!
  driver: DB_TYPE === 'postgresql' ? PostgreSqlDriver : MsSqlDriver,
  
  entities: ['./dist/entities/**/*.js'],
  entitiesTs: ['./src/entities/**/*.ts'],
  
  dbName: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? (DB_TYPE === 'postgresql' ? 5432 : 1433)),
  
  // Recommended settings
  debug: process.env.NODE_ENV === 'development',
  allowGlobalContext: true,
  
  // Schema generation
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
  },
});
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
    secondary: NavigationItem[];
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
      { "id": "products", "label": "Products", "icon": "grid", "route": "/products" },
      { "id": "cart", "label": "Cart", "icon": "shopping-cart", "route": "/cart", "badge": { "type": "count", "source": "/api/v1/cart/count" } }
    ],
    "account": [
      { "id": "orders", "label": "My Orders", "icon": "package", "route": "/orders" },
      { "id": "profile", "label": "Profile", "icon": "user", "route": "/account/profile" },
      { "id": "addresses", "label": "Addresses", "icon": "map-pin", "route": "/account/addresses" }
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
      { "id": "dashboard", "label": "Dashboard", "icon": "layout-dashboard", "route": "/dashboard" },
      { "id": "orders", "label": "Orders", "icon": "package", "route": "/orders", "badge": { "type": "count", "source": "/api/v1/orders/pending-count" } },
      { "id": "inventory", "label": "Inventory", "icon": "warehouse", "route": "/inventory", "badge": { "type": "dot", "source": "/api/v1/inventory/has-alerts" } },
      { "id": "products", "label": "Products", "icon": "box", "route": "/products" },
      { "id": "dropship", "label": "Drop Ship", "icon": "truck", "route": "/dropship" },
      { "id": "reports", "label": "Reports", "icon": "bar-chart", "route": "/reports" }
    ],
    "account": [
      { "id": "profile", "label": "Profile", "icon": "user", "route": "/account/profile" }
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
      { "id": "dashboard", "label": "Dashboard", "icon": "layout-dashboard", "route": "/dashboard" },
      { "id": "orders", "label": "Orders", "icon": "package", "route": "/orders" },
      { "id": "inventory", "label": "Inventory", "icon": "warehouse", "route": "/inventory" },
      { "id": "products", "label": "Products", "icon": "box", "route": "/products" },
      { "id": "dropship", "label": "Drop Ship", "icon": "truck", "route": "/dropship" },
      { "id": "reports", "label": "Reports", "icon": "bar-chart", "route": "/reports" }
    ],
    "secondary": [
      { "id": "users", "label": "Users", "icon": "users", "route": "/users" },
      { "id": "settings", "label": "Settings", "icon": "settings", "route": "/settings" },
      { "id": "affiliates", "label": "Affiliates", "icon": "link", "route": "/affiliates" },
      { "id": "audit", "label": "Audit Log", "icon": "file-text", "route": "/audit" }
    ],
    "account": [
      { "id": "profile", "label": "Profile", "icon": "user", "route": "/account/profile" }
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

#### Affiliate Entities (MikroORM)

```typescript
// src/entities/Affiliate.ts
import { Entity, PrimaryKey, Property, OneToMany, Collection, Unique } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity({ tableName: 'affiliates' })
export class Affiliate {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name!: string;

  @Property({ unique: true })
  code!: string;  // e.g., "APREMIUM"

  @Property()
  baseUrl!: string;

  @Property()
  apiKey!: string;  // encrypted

  @Property({ nullable: true })
  apiSecret?: string;  // encrypted

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ type: 'json' })
  retryPolicy!: { maxRetries: number; backoffMs: number[] };

  @Property({ type: 'json', nullable: true })
  mappingRules?: Record<string, unknown>;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @OneToMany(() => AffiliateProductMapping, mapping => mapping.affiliate)
  productMappings = new Collection<AffiliateProductMapping>(this);

  @OneToMany(() => AffiliateOrder, order => order.affiliate)
  orders = new Collection<AffiliateOrder>(this);
}

// src/entities/AffiliateProductMapping.ts
@Entity({ tableName: 'affiliate_product_mappings' })
@Unique({ properties: ['affiliate', 'product'] })
export class AffiliateProductMapping {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Affiliate)
  affiliate!: Affiliate;

  @ManyToOne(() => Product)
  product!: Product;

  @Property()
  affiliateSku!: string;

  @Property({ nullable: true })
  affiliateProductId?: string;

  @Property({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  priceMultiplier?: number;  // e.g., 1.0500 = 5% markup

  @Property({ default: true })
  isActive: boolean = true;
}

// src/entities/AffiliateOrder.ts
export enum AffiliateOrderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

@Entity({ tableName: 'affiliate_orders' })
@Index({ properties: ['order'] })
@Index({ properties: ['affiliate'] })
@Index({ properties: ['status'] })
export class AffiliateOrder {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Order)
  order!: Order;

  @ManyToOne(() => Affiliate)
  affiliate!: Affiliate;

  @Enum(() => AffiliateOrderStatus)
  status: AffiliateOrderStatus = AffiliateOrderStatus.PENDING;

  @Property({ nullable: true })
  externalOrderId?: string;

  @Property({ type: 'json', nullable: true })
  requestPayload?: Record<string, unknown>;

  @Property({ type: 'json', nullable: true })
  responsePayload?: Record<string, unknown>;

  @Property({ nullable: true })
  lastError?: string;

  @Property({ default: 0 })
  retryCount: number = 0;

  @Property({ nullable: true })
  nextRetryAt?: Date;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true })
  completedAt?: Date;
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
backend/src/
└── integrations/
    ├── supplier.interface.ts     # Common interface for all suppliers
    ├── supplier.router.ts        # Routes orders to correct supplier
    ├── a-premium/                # A-Premium integration
    │   ├── apremium.types.ts
    │   ├── apremium.client.ts
    │   ├── apremium.service.ts
    │   └── apremium.mapper.ts
    ├── buyautoparts/             # BuyAutoParts integration
    │   ├── buyautoparts.types.ts
    │   ├── buyautoparts.client.ts
    │   ├── buyautoparts.service.ts
    │   └── buyautoparts.mapper.ts
    └── trq/                      # TRQ integration
        ├── trq.types.ts
        ├── trq.client.ts
        ├── trq.service.ts
        └── trq.mapper.ts
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

### 7.3 A-Premium Integration

> **TODO:** Implement A-Premium supplier integration

**Environment Configuration:**

```bash
# A-Premium
APREMIUM_API_URL=https://api.a-premium.com
APREMIUM_API_KEY=your_api_key
APREMIUM_TIMEOUT_MS=8000
```

**Planned Capabilities:**

| Feature | Status |
|---------|--------|
| Product/Offer Search | ⏳ TODO |
| Order Creation | ⏳ TODO |
| Order Status | ⏳ TODO |
| Shipment Tracking | ⏳ TODO |

---

### 7.4 BuyAutoParts Integration

> **TODO:** Implement BuyAutoParts supplier integration

**Environment Configuration:**

```bash
# BuyAutoParts
BUYAUTOPARTS_API_URL=https://api.buyautoparts.com
BUYAUTOPARTS_API_KEY=your_api_key
BUYAUTOPARTS_TIMEOUT_MS=8000
```

**Planned Capabilities:**

| Feature | Status |
|---------|--------|
| Product/Offer Search | ⏳ TODO |
| Order Creation | ⏳ TODO |
| Order Status | ⏳ TODO |
| Shipment Tracking | ⏳ TODO |

---

### 7.5 TRQ Integration

> **TODO:** Implement TRQ supplier integration

**Environment Configuration:**

```bash
# TRQ
TRQ_API_URL=https://api.trqparts.com
TRQ_API_KEY=your_api_key
TRQ_TIMEOUT_MS=8000
```

**Planned Capabilities:**

| Feature | Status |
|---------|--------|
| Product/Offer Search | ⏳ TODO |
| Order Creation | ⏳ TODO |
| Order Status | ⏳ TODO |
| Shipment Tracking | ⏳ TODO |

### 7.6 Supplier Router

The supplier router directs order lines to the appropriate supplier integration:

```typescript
// src/integrations/supplier.router.ts
export class SupplierRouter {
  private suppliers: Map<string, SupplierIntegration> = new Map();

  register(integration: SupplierIntegration) {
    this.suppliers.set(integration.supplierId, integration);
  }

  async routeOrderLines(
    order: Order,
    lines: OrderLineWithSupplier[],
  ): Promise<SupplierOrderResult[]> {
    // Group lines by supplier
    const linesBySupplier = groupBy(lines, l => l.supplierId);
    
    const results: SupplierOrderResult[] = [];
    
    for (const [supplierId, supplierLines] of Object.entries(linesBySupplier)) {
      const supplier = this.suppliers.get(supplierId);
      if (!supplier) {
        throw new Error(`Unknown supplier: ${supplierId}`);
      }
      
      const result = await supplier.createOrder({
        purchaseOrderNumber: `${order.orderNumber}-${supplierId}`,
        shipTo: order.shippingAddress,
        lines: supplierLines,
        shipMethod: this.mapShipMethod(order.shippingMethod, supplierId),
      });
      
      results.push(result);
    }
    
    return results;
  }
}
```

### 7.7 Adding a New Supplier

To add a new supplier integration:

1. Create folder: `src/integrations/[supplier-name]/`
2. Implement:
   - `[supplier].types.ts` — API types matching supplier's OpenAPI spec
   - `[supplier].client.ts` — HTTP client with auth
   - `[supplier].service.ts` — Implements `SupplierIntegration` interface
   - `[supplier].mapper.ts` — Maps between supplier DTOs and internal models
3. Register in `SupplierRouter`
4. Add `AffiliateProductMapping` records linking products to supplier SKUs
5. Add env vars for credentials

---

## 8. Repository Layout

No monorepo tooling. Frontend and backend are **independent projects**.

```
/
├── frontend/                     # Angular application
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.ts
│       ├── index.html
│       ├── styles.css
│       ├── styles/
│       │   ├── tokens.css        # CSS custom properties
│       │   ├── theme.light.css   # Light theme variables
│       │   ├── theme.dark.css    # Dark theme variables
│       │   ├── components.css    # Component styles
│       │   ├── utilities.css     # Utility classes
│       │   └── globals.css       # Global styles
│       ├── assets/
│       │   ├── icons/            # SVG icons (registered via Material icon registry)
│       │   └── images/           # Static images
│       ├── environments/
│       │   ├── environment.ts
│       │   └── environment.prod.ts
│       └── app/
│           ├── app.component.ts
│           ├── app.component.html
│           ├── app.component.css
│           ├── app.config.ts
│           ├── app.routes.ts
│           ├── core/              # Singleton services, guards, interceptors
│           ├── shared/            # Reusable components, directives, pipes
│           └── features/          # Feature modules (lazy-loaded)
│
├── backend/                      # Fastify API
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
│       └── utils/                # Utilities
│
├── docs/                         # Documentation
│   ├── README.md
│   ├── 01-overview.md
│   ├── ...
│   └── openapi.yaml              # OpenAPI specification
│
└── README.md                     # This file
```

### 8.1 Frontend Detailed Structure

```
frontend/src/app/
├── core/
│   ├── constants/
│   │   └── images.ts              # Image path constants
│   ├── content/
│   │   └── app.content.ts         # Centralized UI text/labels
│   ├── guards/
│   │   ├── auth.guard.ts          # Authentication check
│   │   └── feature.guard.ts       # Feature-config based access
│   ├── interceptors/
│   │   ├── auth.interceptor.ts    # Add auth token to requests
│   │   └── error.interceptor.ts   # Global error handling
│   ├── models/
│   │   ├── api.types.ts           # API response types
│   │   ├── user.model.ts          # User interfaces
│   │   ├── product.model.ts       # Product interfaces
│   │   ├── order.model.ts         # Order interfaces
│   │   ├── cart.model.ts          # Cart interfaces
│   │   ├── feature-config.model.ts # Feature config interfaces
│   │   └── admin.model.ts         # Admin interfaces
│   └── services/
│       ├── api.service.ts         # Base HTTP client with error handling
│       ├── auth.service.ts        # Authentication + session management
│       ├── feature-config.service.ts # Feature configuration + caching
│       ├── cart.service.ts        # Cart operations
│       ├── catalog.service.ts     # Product catalog + categories + brands
│       ├── checkout.service.ts    # Checkout flow + Stripe integration
│       ├── order.service.ts       # Order management + tracking
│       ├── inventory.service.ts   # Inventory operations (manager)
│       ├── admin.service.ts       # Admin operations (users, settings, audit)
│       ├── user.service.ts        # User management
│       ├── notification.service.ts # Toast notifications
│       ├── mock-data.service.ts   # Mock API responses for development
│       └── mock-data/
│           └── index.ts           # Mock data generators
│
├── shared/
│   ├── components/
│   │   ├── header/                # App header with navigation
│   │   │   ├── header.component.ts
│   │   │   ├── header.component.html
│   │   │   └── header.component.css
│   │   ├── footer/                # App footer with links
│   │   │   ├── footer.component.ts
│   │   │   ├── footer.component.html
│   │   │   └── footer.component.css
│   │   ├── icon/                  # SVG icon component (Material icons)
│   │   │   └── icon.component.ts
│   │   ├── loading-spinner/       # Loading indicator
│   │   │   └── loading-spinner.component.ts
│   │   ├── product-card/          # Reusable product card for listings
│   │   │   ├── product-card.component.ts
│   │   │   ├── product-card.component.html
│   │   │   └── product-card.component.css
│   │   ├── search-dropdown/       # Search with autocomplete dropdown
│   │   │   ├── search-dropdown.component.ts
│   │   │   ├── search-dropdown.component.html
│   │   │   └── search-dropdown.component.css
│   │   ├── pagination/            # Pagination component
│   │   ├── data-table/            # Reusable data table
│   │   ├── modal/                 # Modal dialog
│   │   ├── toast/                 # Toast notifications
│   │   ├── badge/                 # Status badges
│   │   ├── empty-state/           # Empty state placeholder
│   │   └── form-field/            # Form field wrapper
│   ├── directives/
│   │   ├── feature-visible.directive.ts  # Show/hide by feature config
│   │   ├── image-fallback.directive.ts   # Fallback image on error
│   │   └── click-outside.directive.ts    # Detect clicks outside element
│   ├── pipes/
│   │   ├── currency.pipe.ts       # Format currency
│   │   └── date-format.pipe.ts    # Format dates
│   └── layouts/
│       ├── main-layout/           # Customer-facing layout
│       │   └── main-layout.component.ts
│       ├── dashboard-layout/      # Manager/Admin dashboard layout
│       └── auth-layout/           # Login/register layout
│
└── features/
    ├── auth/
    │   ├── login/
    │   │   ├── login.component.ts
    │   │   ├── login.component.html
    │   │   └── login.component.css
    │   ├── register/
    │   ├── forgot-password/
    │   └── reset-password/
    │
    ├── home/
    │   └── home.component.ts      # Landing page
    │
    ├── catalog/
    │   ├── category-listing/      # Category browse page
    │   │   ├── category-listing.component.ts
    │   │   ├── category-listing.component.html
    │   │   └── category-listing.component.css
    │   ├── product-listing/       # Product grid/list with filters
    │   │   ├── product-listing.component.ts
    │   │   ├── product-listing.component.html
    │   │   └── product-listing.component.css
    │   ├── product-detail/        # Product page with fitment info
    │   │   ├── product-detail.component.ts
    │   │   ├── product-detail.component.html
    │   │   └── product-detail.component.css
    │   └── fitment-selector/      # Year/Make/Model cascading filter
    │       └── fitment-selector.component.ts
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
    │   └── confirmation/          # Step 4: Review & confirm
    │
    ├── account/
    │   ├── account.routes.ts
    │   ├── profile/               # User profile
    │   └── addresses/             # Address management
    │
    ├── orders/
    │   ├── order-history/         # Order list (customer)
    │   └── order-detail/          # Order details
    │
    ├── dashboard/
    │   ├── customer-dashboard/    # Customer home
    │   ├── operations-dashboard/  # Manager home
    │   └── admin-dashboard/       # Admin home
    │
    ├── orders-management/
    │   ├── orders-list/           # All orders (manager/admin)
    │   ├── order-detail/          # Order detail with actions
    │   └── order-statistics/      # Order charts
    │
    ├── inventory/
    │   ├── inventory-list/        # Inventory grid
    │   ├── inventory-detail/      # Product inventory
    │   ├── inventory-adjustments/ # Adjustment form
    │   ├── inventory-import/      # XLSX import
    │   └── low-stock-alerts/      # Alert list
    │
    ├── products-management/
    │   ├── products-list/         # Product grid (editable)
    │   ├── product-form/          # Create/edit product
    │   ├── fitment-editor/        # Fitment management
    │   └── image-manager/         # Image upload/order
    │
    ├── dropship/
    │   ├── affiliate-orders/      # Drop-ship orders list
    │   ├── affiliate-order-detail/# Order detail + retry
    │   └── affiliates/            # Affiliate management (admin)
    │
    ├── users/
    │   ├── users-list/            # User grid
    │   ├── user-form/             # Create/edit user
    │   └── user-detail/           # User details
    │
    ├── settings/
    │   ├── general-settings/      # General config
    │   ├── shipping-settings/     # Shipping config
    │   ├── tax-settings/          # Tax config
    │   └── integration-settings/  # Stripe, Resend config
    │
    ├── audit/
    │   ├── audit-log/             # Audit log list
    │   └── audit-statistics/      # Audit charts
    │
    └── reports/
        ├── sales-report/          # Sales by day/week
        ├── category-report/       # Sales by category
        ├── inventory-report/      # Inventory value
        └── gmv-report/            # GMV dashboard (admin)
```

### 8.2 Backend Detailed Structure

```
  backend/
├── mikro-orm.config.ts            # MikroORM config (runtime DB switching)
│
└── src/
    ├── index.ts                   # Fastify server bootstrap
    │
    ├── config/
    │   ├── index.ts               # Configuration loader
    │   ├── env.ts                 # Environment validation (Zod)
    │   └── logger.ts              # Pino logger instance
    │
    ├── entities/                  # MikroORM entities (single source for all DBs)
    │   ├── index.ts               # Entity exports
    │   ├── User.ts                # User entity
    │   ├── Session.ts             # Session entity
    │   ├── Role.ts                # Role entity
    │   ├── RoleFeatureConfig.ts   # Feature config entity
    │   ├── Address.ts             # Address entity
    │   ├── Category.ts            # Category entity
    │   ├── Brand.ts               # Brand entity
    │   ├── Product.ts             # Product entity
    │   ├── ProductFitment.ts      # Fitment entity
    │   ├── Cart.ts                # Cart entity
    │   ├── CartItem.ts            # Cart item entity
    │   ├── Order.ts               # Order entity
    │   ├── OrderItem.ts           # Order item entity
    │   ├── OrderTimeline.ts       # Order timeline entity
    │   ├── InventoryLog.ts        # Inventory log entity
    │   ├── Affiliate.ts           # Affiliate entity
    │   ├── AffiliateProductMapping.ts  # Affiliate mapping entity
    │   ├── AffiliateOrder.ts      # Affiliate order entity
    │   ├── Setting.ts             # Setting entity
    │   ├── AuditLog.ts            # Audit log entity
    │   └── Feature.ts             # Feature entity
    │
    ├── migrations/                # Database migrations (auto-generated)
    │   └── Migration20240101000000.ts
    │
    ├── seeders/                   # Database seeders
    │   ├── DatabaseSeeder.ts      # Main seeder
    │   ├── RoleSeeder.ts          # Seed roles and feature configs
    │   ├── CategorySeeder.ts      # Seed categories
    │   └── ProductSeeder.ts       # Seed sample products
    │
    ├── plugins/
    │   ├── mikro-orm.ts           # MikroORM Fastify plugin
    │   ├── auth.ts                # Authentication plugin
    │   ├── error-handler.ts       # Global error handler
    │   ├── cors.ts                # CORS configuration
    │   └── rate-limit.ts          # Rate limiting
    │
    ├── integrations/              # External supplier/service integrations
    │   ├── supplier.interface.ts  # Common supplier interface
    │   ├── supplier.router.ts     # Routes orders to suppliers
    │   ├── a-premium/             # A-Premium integration
    │   │   ├── apremium.types.ts
    │   │   ├── apremium.client.ts
    │   │   ├── apremium.service.ts
    │   │   └── apremium.mapper.ts
    │   ├── buyautoparts/          # BuyAutoParts integration
    │   │   ├── buyautoparts.types.ts
    │   │   ├── buyautoparts.client.ts
    │   │   ├── buyautoparts.service.ts
    │   │   └── buyautoparts.mapper.ts
    │   └── trq/                   # TRQ integration
    │       ├── trq.types.ts
    │       ├── trq.client.ts
    │       ├── trq.service.ts
    │       └── trq.mapper.ts
    │
    ├── jobs/                      # Background job definitions
    │   ├── job-queue.ts           # Job queue interface
    │   ├── affiliate-jobs.ts      # Affiliate order processing
    │   ├── email-jobs.ts          # Email sending jobs
    │   └── cleanup-jobs.ts        # Cleanup tasks
│
├── routes/
│   ├── index.ts                   # Route registration
│   │
│   ├── auth/
│   │   ├── index.ts               # Auth route registration
│   │   ├── login.ts               # POST /auth/login
│   │   ├── register.ts            # POST /auth/register
│   │   ├── logout.ts              # POST /auth/logout
│   │   ├── me.ts                  # GET /auth/me
│   │   ├── forgot-password.ts     # POST /auth/forgot-password
│   │   ├── reset-password.ts      # POST /auth/reset-password
│   │   └── feature-config.ts      # GET /auth/feature-config
│   │
│   ├── catalog/
│   │   ├── index.ts               # Catalog route registration
│   │   ├── categories.ts          # GET /catalog/categories
│   │   ├── brands.ts              # GET /catalog/brands
│   │   ├── products.ts            # GET /catalog/products
│   │   ├── search.ts              # GET /catalog/search
│   │   └── fitment.ts             # GET /catalog/fitment/*
│   │
│   ├── cart/
│   │   ├── index.ts               # Cart route registration
│   │   ├── get.ts                 # GET /cart
│   │   ├── items.ts               # POST/PATCH/DELETE /cart/items
│   │   └── clear.ts               # DELETE /cart
│   │
│   ├── checkout/
│   │   ├── index.ts               # Checkout route registration
│   │   ├── shipping-methods.ts    # GET /checkout/shipping-methods
│   │   ├── payment-intent.ts      # POST /checkout/payment-intent
│   │   └── create-order.ts        # POST /checkout/orders
│   │
│   ├── orders/
│   │   ├── index.ts               # Orders route registration
│   │   ├── list.ts                # GET /orders
│   │   ├── detail.ts              # GET /orders/:id
│   │   ├── status.ts              # PATCH /orders/:id/status
│   │   ├── cancel.ts              # POST /orders/:id/cancel
│   │   ├── statistics.ts          # GET /orders/statistics
│   │   └── track.ts               # GET /orders/track/:orderNumber
│   │
│   ├── products/
│   │   ├── index.ts               # Products route registration
│   │   ├── list.ts                # GET /products
│   │   ├── detail.ts              # GET /products/:id
│   │   ├── create.ts              # POST /products
│   │   ├── update.ts              # PATCH /products/:id
│   │   ├── delete.ts              # DELETE /products/:id
│   │   └── fitment.ts             # Product fitment CRUD
│   │
│   ├── inventory/
│   │   ├── index.ts               # Inventory route registration
│   │   ├── list.ts                # GET /inventory
│   │   ├── alerts.ts              # GET /inventory/alerts
│   │   ├── adjustments.ts         # POST /inventory/adjustments
│   │   ├── history.ts             # GET /inventory/:productId/history
│   │   └── import.ts              # POST /inventory/import
│   │
│   ├── dropship/
│   │   ├── index.ts               # Dropship route registration
│   │   ├── orders.ts              # GET /dropship/orders
│   │   ├── order-detail.ts        # GET /dropship/orders/:id
│   │   ├── retry.ts               # POST /dropship/orders/:id/retry
│   │   └── affiliates.ts          # Affiliate CRUD
│   │
│   ├── users/
│   │   ├── index.ts               # Users route registration
│   │   ├── list.ts                # GET /users
│   │   ├── detail.ts              # GET /users/:id
│   │   ├── create.ts              # POST /users
│   │   ├── update.ts              # PATCH /users/:id
│   │   ├── delete.ts              # DELETE /users/:id
│   │   └── profile.ts             # GET/PATCH /profile
│   │
│   ├── settings/
│   │   ├── index.ts               # Settings route registration
│   │   ├── get.ts                 # GET /settings
│   │   ├── update.ts              # PUT /settings/:key
│   │   └── bulk.ts                # POST /settings/bulk
│   │
│   ├── audit/
│   │   ├── index.ts               # Audit route registration
│   │   ├── list.ts                # GET /audit
│   │   └── statistics.ts          # GET /audit/statistics
│   │
│   ├── reports/
│   │   ├── index.ts               # Reports route registration
│   │   ├── sales.ts               # GET /reports/sales
│   │   ├── categories.ts          # GET /reports/categories
│   │   ├── inventory-value.ts     # GET /reports/inventory-value
│   │   └── gmv.ts                 # GET /reports/gmv
│   │
│   └── webhooks/
│       ├── index.ts               # Webhook route registration
│       ├── stripe.ts              # POST /webhooks/stripe
│       └── supplier.ts            # POST /webhooks/supplier/:id
│
├── services/
│   ├── auth.service.ts            # Authentication logic
│   ├── feature-config.service.ts  # Feature config management
│   ├── catalog.service.ts         # Catalog queries
│   ├── cart.service.ts            # Cart operations
│   ├── checkout.service.ts        # Checkout pipeline
│   ├── order.service.ts           # Order management
│   ├── inventory.service.ts       # Inventory operations
│   ├── product.service.ts         # Product CRUD
│   ├── dropship.service.ts        # Drop-ship logic
│   ├── affiliate.service.ts       # Affiliate API calls
│   ├── user.service.ts            # User management
│   ├── settings.service.ts        # Settings CRUD
│   ├── audit.service.ts           # Audit logging
│   ├── email.service.ts           # Resend integration
│   └── stripe.service.ts          # Stripe integration
│
├── schemas/
│   ├── index.ts                   # Schema exports
│   ├── auth.schema.ts             # Auth validation
│   ├── product.schema.ts          # Product validation
│   ├── order.schema.ts            # Order validation
│   ├── inventory.schema.ts        # Inventory validation
│   ├── user.schema.ts             # User validation
│   └── common.schema.ts           # Shared schemas (pagination, etc.)
│
├── middleware/
│   ├── authenticate.ts            # Auth middleware
│   ├── authorize.ts               # Permission check
│   └── validate.ts                # Request validation
│
└── utils/
    ├── crypto.ts                  # Password hashing
    ├── slug.ts                    # Slug generation
    ├── pagination.ts              # Pagination helpers
    └── xlsx-parser.ts             # Excel import parser
```

---

## 9. Database Schema

### 9.1 Core Entities

See `backend/src/entities/` for full entity definitions. Key entities:

```
Users & Auth:
├── User.ts
├── Session.ts
├── Account.ts
├── Verification.ts
├── Address.ts
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

Customer:
├── Address.ts
└── SavedVehicle.ts

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

### 9.2 Product Entity with Fulfillment (MikroORM)

```typescript
// src/entities/Product.ts
import { 
  Entity, PrimaryKey, Property, ManyToOne, OneToMany, 
  Enum, Index, Collection, Unique 
} from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

export enum FulfillmentType {
  INVENTORY = 'INVENTORY',
  DROPSHIP = 'DROPSHIP',
  MIXED = 'MIXED',
}

@Entity({ tableName: 'products' })
@Index({ properties: ['category'] })
@Index({ properties: ['brand'] })
@Index({ properties: ['sku'] })
@Index({ properties: ['fulfillmentType'] })
export class Product {
  @PrimaryKey()
  id: string = uuid();

  @Property({ unique: true })
  sku!: string;

  @Property()
  name!: string;

  @Property({ unique: true })
  slug!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @Property({ nullable: true })
  shortDescription?: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice?: number;

  @Property({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPrice?: number;

  @ManyToOne(() => Category)
  category!: Category;

  @ManyToOne(() => Brand, { nullable: true })
  brand?: Brand;

  @Property({ nullable: true })
  imageUrl?: string;

  @Property({ type: 'json', default: [] })
  images: string[] = [];

  // Dimensions
  @Property({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weight?: number;

  @Property({ default: 'lb' })
  weightUnit: string = 'lb';

  @Property({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  length?: number;

  @Property({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  width?: number;

  @Property({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  height?: number;

  @Property({ default: 'in' })
  dimensionUnit: string = 'in';

  // Inventory
  @Property({ default: 0 })
  stockQuantity: number = 0;

  @Property({ default: 10 })
  lowStockThreshold: number = 10;

  @Property({ nullable: true })
  upc?: string;

  // Fulfillment
  @Enum(() => FulfillmentType)
  fulfillmentType: FulfillmentType = FulfillmentType.INVENTORY;

  // Status
  @Property({ default: true })
  isActive: boolean = true;

  @Property({ default: false })
  isFeatured: boolean = false;

  // SEO
  @Property({ nullable: true })
  metaTitle?: string;

  @Property({ nullable: true })
  metaDescription?: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Relations
  @OneToMany(() => CartItem, item => item.product)
  cartItems = new Collection<CartItem>(this);

  @OneToMany(() => OrderItem, item => item.product)
  orderItems = new Collection<OrderItem>(this);

  @OneToMany(() => ProductFitment, fitment => fitment.product)
  fitments = new Collection<ProductFitment>(this);

  @OneToMany(() => InventoryLog, log => log.product)
  inventoryLogs = new Collection<InventoryLog>(this);

  @OneToMany(() => AffiliateProductMapping, mapping => mapping.product)
  affiliateMappings = new Collection<AffiliateProductMapping>(this);
}
```

### 9.3 Additional Entities

#### Shipment Entity

```typescript
// src/entities/Shipment.ts
@Entity({ tableName: 'shipments' })
export class Shipment {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Order)
  order!: Order;

  @Property()
  carrier!: string;  // UPS, FedEx, USPS, etc.

  @Property()
  trackingNumber!: string;

  @Property({ nullable: true })
  trackingUrl?: string;

  @Property({ nullable: true })
  shippedAt?: Date;

  @Property({ nullable: true })
  deliveredAt?: Date;

  @Enum(() => ShipmentStatus)
  status: ShipmentStatus = ShipmentStatus.PENDING;

  @Property()
  createdAt: Date = new Date();
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  EXCEPTION = 'EXCEPTION',
}
```

#### OrderTimeline Entity

```typescript
// src/entities/OrderTimeline.ts
@Entity({ tableName: 'order_timeline' })
@Index({ properties: ['order'] })
export class OrderTimeline {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => Order)
  order!: Order;

  @Property()
  status!: string;

  @Property()
  title!: string;  // "Order Placed", "Payment Confirmed", etc.

  @Property({ nullable: true })
  description?: string;

  @Property({ nullable: true })
  metadata?: object;  // Additional context (tracking info, etc.)

  @ManyToOne(() => User, { nullable: true })
  changedBy?: User;  // Who made the change (null if system)

  @Property()
  createdAt: Date = new Date();
}
```

#### SavedVehicle Entity

```typescript
// src/entities/SavedVehicle.ts
@Entity({ tableName: 'saved_vehicles' })
@Index({ properties: ['user'] })
export class SavedVehicle {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user!: User;

  @Property({ nullable: true })
  nickname?: string;  // e.g., "My Truck"

  @Property()
  year!: number;

  @Property()
  make!: string;

  @Property()
  model!: string;

  @Property({ nullable: true })
  submodel?: string;

  @Property({ nullable: true })
  engine?: string;

  @Property({ default: false })
  isDefault: boolean = false;

  @Property()
  createdAt: Date = new Date();
}
```

#### Webhook Entity (Admin)

```typescript
// src/entities/Webhook.ts
@Entity({ tableName: 'webhooks' })
export class Webhook {
  @PrimaryKey()
  id: string = uuid();

  @Property()
  name!: string;

  @Property()
  url!: string;

  @Property({ type: 'json' })
  events!: string[];  // ['order.created', 'order.shipped', etc.]

  @Property({ nullable: true })
  secret?: string;  // For signature verification

  @Property({ default: true })
  isActive: boolean = true;

  @Property({ nullable: true })
  lastTriggeredAt?: Date;

  @Property()
  createdAt: Date = new Date();
}
```

### 9.4 MikroORM Database Commands

```bash
# Generate migration from entity changes
npx mikro-orm migration:create

# Run pending migrations
npx mikro-orm migration:up

# Rollback last migration
npx mikro-orm migration:down

# Generate fresh schema (development only)
npx mikro-orm schema:fresh --run

# Seed the database
npx mikro-orm seeder:run
```

---

## 10. API Specification

### 10.1 Base URL & Authentication

```
Base URL: /api/v1

Authentication: Session token via:
- Cookie: auth-token=<token>
- Header: Authorization: Bearer <token>
```

### 10.2 Generic API Endpoints

All endpoints are generic. Authorization is determined by the authenticated user's role and permissions.

#### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | ❌ | Register new user |
| POST | /auth/login | ❌ | User login |
| POST | /auth/logout | ✅ | User logout |
| GET | /auth/me | ✅ | Get current user |
| POST | /auth/forgot-password | ❌ | Request password reset |
| POST | /auth/reset-password | ❌ | Reset password |
| GET | /auth/feature-config | ✅ | Get feature config for user's role |

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
| GET | /catalog/fitment/search | ❌ | Search by fitment |

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
| GET | /orders/track/:orderNumber | ❌ | - | Public tracking by order number |
| GET | /orders/:id/timeline | ✅ | orders.viewOwn | Order status history timeline |
| GET | /orders/:id/shipments | ✅ | orders.viewOwn | Shipment tracking details |

#### Products

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /products | ✅ | products.* | Manager view with inactive |
| GET | /products/:id | ✅ | products.* | Full product data |
| POST | /products | ✅ | products.create |
| PATCH | /products/:id | ✅ | products.update |
| DELETE | /products/:id | ✅ | products.delete |
| POST | /products/:id/fitments | ✅ | products.manageFitment |
| DELETE | /products/:id/fitments/:fitmentId | ✅ | products.manageFitment |
| POST | /products/:id/images | ✅ | products.manageImages |
| DELETE | /products/:id/images/:imageId | ✅ | products.manageImages |

#### Inventory

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /inventory | ✅ | inventory.view |
| GET | /inventory/alerts | ✅ | inventory.viewAlerts |
| GET | /inventory/has-alerts | ✅ | inventory.viewAlerts | For nav badge |
| GET | /inventory/:productId | ✅ | inventory.view |
| GET | /inventory/:productId/history | ✅ | inventory.viewHistory |
| POST | /inventory/adjustments | ✅ | inventory.adjust |
| POST | /inventory/import | ✅ | inventory.import | XLSX upload |

#### Drop-Shipping

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /dropship/orders | ✅ | dropship.viewOrders |
| GET | /dropship/orders/:id | ✅ | dropship.viewOrders |
| POST | /dropship/orders/:id/retry | ✅ | dropship.retryPush |
| GET | /affiliates | ✅ | dropship.manageAffiliates |
| GET | /affiliates/:id | ✅ | dropship.manageAffiliates |
| POST | /affiliates | ✅ | dropship.manageAffiliates |
| PATCH | /affiliates/:id | ✅ | dropship.manageAffiliates |
| DELETE | /affiliates/:id | ✅ | dropship.manageAffiliates |

#### Users

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /users | ✅ | users.viewAll |
| GET | /users/:id | ✅ | users.viewAll |
| POST | /users | ✅ | users.create |
| PATCH | /users/:id | ✅ | users.updateRole |
| DELETE | /users/:id | ✅ | users.delete |

#### Profile (All authenticated users)

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
| PATCH | /profile/vehicles/:id/default | ✅ | Set as default vehicle |

#### Settings

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /settings | ✅ | settings.view |
| GET | /settings/:key | ✅ | settings.view |
| PUT | /settings/:key | ✅ | settings.update |
| POST | /settings/bulk | ✅ | settings.update |

#### Audit

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /audit | ✅ | audit.view |
| GET | /audit/statistics | ✅ | audit.view |
| POST | /audit/export | ✅ | audit.export |

#### Webhooks (Admin)

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /webhooks | ✅ | admin.manageWebhooks |
| POST | /webhooks | ✅ | admin.manageWebhooks |
| GET | /webhooks/:id | ✅ | admin.manageWebhooks |
| PATCH | /webhooks/:id | ✅ | admin.manageWebhooks |
| DELETE | /webhooks/:id | ✅ | admin.manageWebhooks |
| POST | /webhooks/:id/test | ✅ | admin.manageWebhooks |

#### Affiliates (Admin)

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /affiliates | ✅ | admin.manageAffiliates |
| POST | /affiliates | ✅ | admin.manageAffiliates |
| GET | /affiliates/:id | ✅ | admin.manageAffiliates |
| PATCH | /affiliates/:id | ✅ | admin.manageAffiliates |
| DELETE | /affiliates/:id | ✅ | admin.manageAffiliates |
| GET | /affiliates/:id/products | ✅ | admin.manageAffiliates |
| POST | /affiliates/:id/products | ✅ | admin.manageAffiliates |
| GET | /affiliates/:id/orders | ✅ | admin.manageAffiliates |

#### Reports

| Method | Endpoint | Auth | Feature |
|--------|----------|------|---------|
| GET | /reports/sales | ✅ | reports.sales |
| GET | /reports/sales/export | ✅ | reports.salesExport |
| GET | /reports/categories | ✅ | reports.categories |
| GET | /reports/inventory-value | ✅ | reports.inventoryValue |
| GET | /reports/gmv | ✅ | reports.gmv |
| GET | /reports/gmv/daily | ✅ | reports.gmv |
| GET | /reports/top-products | ✅ | reports.sales |
| GET | /reports/low-performing | ✅ | reports.sales |

#### Reports

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
  "message": "Validation error message",
  "details": { ... }  // Optional validation details
}
```

### 10.4 Authorization Flow

```typescript
// Backend authorization middleware
async function authorize(request: FastifyRequest, requiredFeature: string) {
  const user = request.user;
  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }

  const featureConfig = await getFeatureConfig(user.roleId);
  const hasPermission = checkFeaturePermission(featureConfig, requiredFeature);

  if (!hasPermission) {
    throw new ForbiddenError('Insufficient permissions');
  }

  // For data-scoped endpoints (e.g., orders)
  // Apply additional filtering based on role
  request.dataScope = determineDataScope(user.role, requiredFeature);
}

// Route handler example with MikroORM
fastify.get('/orders', async (request, reply) => {
  await authorize(request, 'orders.viewOwn|orders.viewAll');
  
  const em = request.em; // MikroORM EntityManager from plugin
  
  const whereClause = request.dataScope === 'own' 
    ? { user: request.user.id }
    : {};

  const orders = await em.find(Order, whereClause, {
    populate: ['items', 'user'],
    orderBy: { createdAt: 'DESC' },
  });
  
  return { data: orders };
});
```

### 10.5 MikroORM Fastify Plugin

```typescript
// src/plugins/mikro-orm.ts
import { FastifyPluginAsync } from 'fastify';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import config from '../../mikro-orm.config';

declare module 'fastify' {
  interface FastifyRequest {
    em: MikroORM['em'];
  }
}

export const mikroOrmPlugin: FastifyPluginAsync = async (fastify) => {
  const orm = await MikroORM.init(config);
  
  // Migrate on startup (optional)
  const migrator = orm.getMigrator();
  await migrator.up();

  // Add EntityManager to each request
  fastify.addHook('onRequest', (request, reply, done) => {
    RequestContext.create(orm.em, done);
    request.em = orm.em.fork();
  });

  // Cleanup on shutdown
  fastify.addHook('onClose', async () => {
    await orm.close();
  });
};
```

---

## 11. OpenAPI Specification

See [docs/openapi.yaml](docs/openapi.yaml) for the complete OpenAPI 3.0 specification.

Key sections:
- Authentication endpoints
- Catalog endpoints
- Cart & Checkout endpoints
- Orders endpoints (with role-based data scoping)
- Products management endpoints
- Inventory endpoints
- Drop-ship endpoints
- Users management endpoints
- Settings endpoints
- Audit endpoints
- Reports endpoints

---

## 12. Frontend Architecture

### 12.1 Feature-Config Driven Routing

```typescript
// app.routes.ts
export const routes: Routes = [
  // Public routes - always available
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListingComponent },
  { path: 'products/:slug', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  
  // Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected routes - guarded by featureGuard
  {
    path: 'checkout',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'cart.checkout' },
    loadChildren: () => import('./features/checkout/checkout.routes')
  },
  {
    path: 'orders',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'orders.viewOwn|orders.viewAll' },
    loadComponent: () => import('./features/orders/orders.component')
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component')
    // Dashboard component internally decides which layout to show
  },
  {
    path: 'inventory',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'inventory.view' },
    loadChildren: () => import('./features/inventory/inventory.routes')
  },
  // ... more routes
];
```

### 12.2 Feature Guard Implementation

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

### 12.3 Feature-Visible Directive

```typescript
// shared/directives/feature-visible.directive.ts
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
// <div *featureVisible="'inventory.view|inventory.adjust'">...</div>
```

### 12.4 Dynamic Navigation

```typescript
// core/services/feature-config.service.ts
@Injectable({ providedIn: 'root' })
export class FeatureConfigService {
  private config = signal<RoleFeatureConfig | null>(null);
  
  readonly navigation = computed(() => this.config()?.navigation);
  readonly features = computed(() => this.config()?.features);
  readonly ui = computed(() => this.config()?.ui);

  async loadConfig(): Promise<void> {
    const response = await this.http.get<RoleFeatureConfig>('/api/v1/auth/feature-config');
    this.config.set(response);
  }

  hasFeature(featurePath: string): boolean {
    const features = this.features();
    if (!features) return false;

    // Navigate the feature path (e.g., "orders.viewAll")
    const parts = featurePath.split('.');
    let current: any = features;
    
    for (const part of parts) {
      if (current[part] === undefined) return false;
      current = current[part];
    }

    return current === true;
  }
}
```

### 12.5 Layout Selection

```typescript
// features/dashboard/dashboard.component.ts
@Component({
  selector: 'app-dashboard',
  template: `
    @switch (dashboardLayout()) {
      @case ('customer') {
        <app-customer-dashboard />
      }
      @case ('operations') {
        <app-operations-dashboard />
      }
      @case ('admin') {
        <app-admin-dashboard />
      }
    }
  `
})
export class DashboardComponent {
  private featureConfig = inject(FeatureConfigService);
  
  dashboardLayout = computed(() => 
    this.featureConfig.ui()?.dashboardLayout ?? 'customer'
  );
}
```

### 12.6 Fitment Selector (Year/Make/Model)

Cascading dropdowns for vehicle fitment filtering:

```typescript
// features/catalog/fitment-selector/fitment-selector.component.ts
@Component({
  selector: 'app-fitment-selector',
  template: `
    <div class="fitment-selector">
      <select [formControl]="yearControl" (change)="onYearChange()">
        <option value="">Select Year</option>
        @for (year of years(); track year) {
          <option [value]="year">{{ year }}</option>
        }
      </select>
      
      <select [formControl]="makeControl" (change)="onMakeChange()" [disabled]="!yearControl.value">
        <option value="">Select Make</option>
        @for (make of makes(); track make) {
          <option [value]="make">{{ make }}</option>
        }
      </select>
      
      <select [formControl]="modelControl" [disabled]="!makeControl.value">
        <option value="">Select Model</option>
        @for (model of models(); track model) {
          <option [value]="model">{{ model }}</option>
        }
      </select>
      
      <button (click)="search()" [disabled]="!isComplete()">
        Find Parts
      </button>
    </div>
  `
})
export class FitmentSelectorComponent {
  private catalog = inject(CatalogService);
  
  years = signal<number[]>([]);
  makes = signal<string[]>([]);
  models = signal<string[]>([]);
  
  yearControl = new FormControl('');
  makeControl = new FormControl('');
  modelControl = new FormControl('');

  async ngOnInit() {
    // Load years (current year down to 1990)
    const currentYear = new Date().getFullYear();
    this.years.set(Array.from({ length: currentYear - 1990 + 1 }, (_, i) => currentYear - i));
  }

  async onYearChange() {
    this.makeControl.reset();
    this.modelControl.reset();
    if (this.yearControl.value) {
      const makes = await this.catalog.getFitmentMakes(Number(this.yearControl.value));
      this.makes.set(makes);
    }
  }

  async onMakeChange() {
    this.modelControl.reset();
    if (this.makeControl.value) {
      const models = await this.catalog.getFitmentModels(
        Number(this.yearControl.value),
        this.makeControl.value
      );
      this.models.set(models);
    }
  }

  isComplete = computed(() => 
    this.yearControl.value && this.makeControl.value && this.modelControl.value
  );

  search() {
    const params = {
      year: this.yearControl.value,
      make: this.makeControl.value,
      model: this.modelControl.value,
    };
    this.router.navigate(['/products'], { queryParams: params });
  }
}
```

### 12.7 Saved Vehicles (Customer Feature)

Customers can save vehicles for quick fitment selection:

```typescript
// Entity: SavedVehicle
@Entity({ tableName: 'saved_vehicles' })
export class SavedVehicle {
  @PrimaryKey()
  id: string = uuid();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  nickname?: string;  // e.g., "My Truck"

  @Property()
  year!: number;

  @Property()
  make!: string;

  @Property()
  model!: string;

  @Property({ nullable: true })
  submodel?: string;

  @Property({ nullable: true })
  engine?: string;

  @Property({ default: false })
  isDefault: boolean = false;

  @Property()
  createdAt: Date = new Date();
}

// API Endpoints
// GET    /profile/vehicles         - List saved vehicles
// POST   /profile/vehicles         - Save a vehicle
// DELETE /profile/vehicles/:id     - Remove saved vehicle
// PATCH  /profile/vehicles/:id/default - Set as default
```

### 12.8 Mock Data Service

For development without a backend:

```typescript
// core/services/mock-data.service.ts
@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly useMockData = environment.enableMockData;

  generateProducts(count: number): ProductResponse[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `mock-${i}`,
      sku: `SKU-${1000 + i}`,
      name: `Mock Product ${i}`,
      slug: `mock-product-${i}`,
      price: (Math.random() * 100 + 10).toFixed(2),
      stockQuantity: Math.floor(Math.random() * 50),
      // ... other fields
    }));
  }

  generateCategories(): CategoryResponse[] {
    return [
      { id: '1', name: 'Engine Parts', slug: 'engine-parts', /* ... */ },
      { id: '2', name: 'Brakes', slug: 'brakes', /* ... */ },
      { id: '3', name: 'Suspension', slug: 'suspension', /* ... */ },
      // ...
    ];
  }

  // Used by API service when enableMockData is true
  mockEndpoint<T>(endpoint: string): T | null {
    if (!this.useMockData) return null;
    
    // Map endpoints to mock data
    const mocks: Record<string, () => unknown> = {
      '/catalog/categories': () => this.generateCategories(),
      '/catalog/products': () => ({ data: this.generateProducts(20), meta: { /* ... */ } }),
      // ...
    };
    
    const generator = mocks[endpoint];
    return generator ? generator() as T : null;
  }
}
```

---

## 13. Background Jobs & Webhooks

### 13.1 Background Job Queue

The system uses background jobs for async processing:

```typescript
// src/jobs/job-queue.ts
export interface Job<T = unknown> {
  id: string;
  type: string;
  data: T;
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date;
  processedAt?: Date;
  failedAt?: Date;
  error?: string;
}

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
  ORDER_STATUS_WEBHOOK = 'order:webhook:status',
  
  // Cleanup Jobs
  CLEANUP_EXPIRED_CARTS = 'cleanup:carts:expired',
  CLEANUP_EXPIRED_SESSIONS = 'cleanup:sessions:expired',
}
```

### 13.2 Scheduled Jobs

| Job | Schedule | Description |
|-----|----------|-------------|
| `affiliate:status:sync` | Every 15 min | Poll supplier APIs for order status updates |
| `inventory:low-stock:alert` | Daily 8am | Send low stock alert emails |
| `cleanup:carts:expired` | Daily 2am | Remove carts older than 30 days |
| `cleanup:sessions:expired` | Daily 3am | Clean up expired sessions |

### 13.3 Stripe Webhooks

Handle Stripe payment events:

```typescript
// src/routes/webhooks/stripe.ts
export async function stripeWebhookRoutes(fastify: FastifyInstance) {
  fastify.post('/webhooks/stripe', {
    config: { rawBody: true }, // Need raw body for signature verification
  }, async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string;
    const rawBody = request.rawBody;
    
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      return reply.status(400).send({ error: 'Invalid signature' });
    }

    // Handle events
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

    return { received: true };
  });
}
```

**Supported Stripe Events:**

| Event | Action |
|-------|--------|
| `payment_intent.succeeded` | Confirm order, update payment status, send confirmation email |
| `payment_intent.payment_failed` | Log failure, update order status |
| `charge.refunded` | Update order status to REFUNDED, create inventory adjustment |
| `charge.dispute.created` | Flag order, notify admin |

### 13.4 Internal Webhooks (Order Status)

Notify external systems of order status changes:

```typescript
// src/services/webhook.service.ts
export class WebhookService {
  async notifyOrderStatusChange(order: Order, previousStatus: string) {
    const webhooks = await this.getActiveWebhooks('order.status.changed');
    
    for (const webhook of webhooks) {
      await this.jobQueue.enqueue({
        type: JobType.ORDER_STATUS_WEBHOOK,
        data: {
          webhookId: webhook.id,
          url: webhook.url,
          payload: {
            event: 'order.status.changed',
            orderId: order.id,
            orderNumber: order.orderNumber,
            previousStatus,
            newStatus: order.status,
            timestamp: new Date().toISOString(),
          },
        },
      });
    }
  }
}
```

### 13.5 Email Triggers

| Trigger | Email | Recipient |
|---------|-------|-----------|
| Order created + payment confirmed | Order Confirmation | Customer |
| Order status → SHIPPED | Shipment Notification | Customer |
| Order status → DELIVERED | Delivery Confirmation | Customer |
| Low stock threshold reached | Low Stock Alert | Manager/Admin |
| Affiliate order failed | Supplier Order Failed | Manager |
| New user registration | Welcome Email | Customer |
| Password reset requested | Password Reset | Customer |

---

## 14. Content & Localization

### 14.1 Centralized Content

All UI text is centralized in a single content file for easy updates and future i18n:

```typescript
// frontend/src/app/core/content/app.content.ts
export const APP_CONTENT = {
  brand: {
    name: 'SN Auto Parts',
    tagline: 'Quality Parts. Guaranteed Fitment.',
    description: 'Your trusted source for premium auto parts and accessories.',
    phone: '(555) 123-4567',
    email: 'support@snautoparts.com',
    address: '123 Auto Drive, Detroit, MI 48201',
  },
  navigation: {
    home: 'Home',
    shop: 'Shop',
    categories: 'Categories',
    // ... all navigation labels
  },
  home: {
    hero: {
      title: 'Quality Auto Parts You Can Trust',
      subtitle: 'Find the perfect parts for your vehicle...',
      ctaPrimary: 'Shop Now',
      ctaSecondary: 'View Deals',
    },
    features: [
      { title: 'Guaranteed Fitment', description: '...', icon: 'verified' },
      { title: 'Free Shipping', description: '...', icon: 'local_shipping' },
      { title: 'Expert Support', description: '...', icon: 'support_agent' },
      { title: 'Easy Returns', description: '...', icon: 'autorenew' },
    ],
  },
  catalog: { /* filter labels, sort options, result messages */ },
  product: { /* SKU, brand, price, stock labels */ },
  cart: { /* cart labels, totals, checkout button */ },
  checkout: { /* step labels, form labels, confirmation */ },
  auth: { /* login, register, forgot password text */ },
  account: { /* profile, addresses, orders labels */ },
  orders: { /* order status labels, tracking */ },
  manager: { /* dashboard, inventory, orders management */ },
  admin: { /* users, settings, audit labels */ },
  common: { /* loading, error, buttons */ },
  footer: { /* company info, support, legal, newsletter */ },
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Must be at least {{min}} characters',
    // ...
  },
} as const;
```

### 14.2 Using Content in Components

```typescript
// Component usage
import { APP_CONTENT } from '@core/content/app.content';

@Component({
  template: `
    <h1>{{ content.home.hero.title }}</h1>
    <p>{{ content.home.hero.subtitle }}</p>
    <button>{{ content.home.hero.ctaPrimary }}</button>
  `
})
export class HomeComponent {
  readonly content = APP_CONTENT;
}
```

### 14.3 Validation Messages

Centralized validation messages with interpolation:

```typescript
// Usage with template interpolation
getValidationMessage(key: string, params?: Record<string, string | number>): string {
  let message = APP_CONTENT.validation[key] ?? 'Invalid value';
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      message = message.replace(`{{${k}}}`, String(v));
    });
  }
  return message;
}

// Example: getValidationMessage('minLength', { min: 8 })
// Returns: "Must be at least 8 characters"
```

### 14.4 Future i18n Support

The content structure is designed for easy migration to i18n:

```typescript
// Future: Multiple language files
// content/en.ts, content/es.ts, content/fr.ts

// Content service with language switching
@Injectable({ providedIn: 'root' })
export class ContentService {
  private currentLang = signal<string>('en');
  
  readonly content = computed(() => {
    return CONTENT_BY_LANG[this.currentLang()];
  });
  
  setLanguage(lang: string) {
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);
  }
}
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
| Product Detail | 5 min | Per-product cache |
| Fitment Options | 1 hour | Rarely changes |
| Settings | 5 min | In-memory |

```typescript
// src/services/cache.service.ts
export class CacheService {
  private cache = new Map<string, { data: unknown; expiresAt: number }>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttlSeconds * 1000),
    });
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}
```

### 15.2 Frontend Caching

```typescript
// src/app/core/services/catalog.service.ts
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private categoriesCache = signal<CategoryResponse[] | null>(null);
  private categoriesCacheTime = 0;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  async getCategories(): Promise<CategoryResponse[]> {
    // Return cached if valid
    if (this.categoriesCache() && Date.now() - this.categoriesCacheTime < this.CACHE_TTL) {
      return this.categoriesCache()!;
    }

    // Fetch fresh
    const response = await this.api.get<CategoryResponse[]>('/catalog/categories');
    this.categoriesCache.set(response);
    this.categoriesCacheTime = Date.now();
    return response;
  }

  invalidateCategoriesCache(): void {
    this.categoriesCache.set(null);
  }
}
```

### 15.3 HTTP Caching Headers

```typescript
// Backend: Set cache headers for public data
fastify.get('/catalog/categories', async (request, reply) => {
  const categories = await categoryService.getAll();
  
  reply
    .header('Cache-Control', 'public, max-age=600') // 10 min
    .header('ETag', generateETag(categories))
    .send({ data: categories });
});

// Backend: No cache for authenticated data
fastify.get('/cart', async (request, reply) => {
  reply.header('Cache-Control', 'private, no-cache, no-store');
  // ...
});
```

### 15.4 Feature Config Caching

Feature config is cached aggressively since it rarely changes:

```typescript
// Backend
const FEATURE_CONFIG_CACHE_TTL = Number(process.env.FEATURE_CONFIG_CACHE_TTL ?? 300);

async function getFeatureConfig(roleId: string): Promise<RoleFeatureConfig> {
  const cacheKey = `feature-config:${roleId}`;
  
  const cached = cache.get<RoleFeatureConfig>(cacheKey);
  if (cached) return cached;
  
  const config = await em.findOne(RoleFeatureConfig, { role: roleId });
  if (config) {
    cache.set(cacheKey, config, FEATURE_CONFIG_CACHE_TTL);
  }
  
  return config;
}

// Invalidate on role config update
async function updateRoleFeatureConfig(roleId: string, newConfig: object) {
  await em.nativeUpdate(RoleFeatureConfig, { role: roleId }, { config: newConfig });
  cache.invalidate(`feature-config:${roleId}`);
}
```

---

## 16. Implementation Order

### Phase 1: Foundation
1. Backend core setup (Fastify, MikroORM, auth)
2. MikroORM entities for Role and FeatureConfig
3. Feature config service and API
4. Frontend shell with feature-config loading

### Phase 2: Customer Flow
1. Catalog browsing and search
2. Fitment filter (Year/Make/Model)
3. Shopping cart
4. Checkout with Stripe
5. Order history (own orders)
6. Profile and addresses

### Phase 3: Operations Dashboard
1. Orders management (view all, update status)
2. Inventory management (view, adjust)
3. XLSX import
4. Low stock alerts
5. Products management
6. Basic sales reports

### Phase 4: Drop-Shipping
1. Affiliate entity and configuration
2. Product-affiliate mapping
3. Order splitting and affiliate push
4. Retry mechanism
5. Affiliate order dashboard

### Phase 5: Admin Features
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
| 401 | Unauthorized | Authentication required or invalid token |
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
| NODE_ENV | ✅ | - | development, production |
| PORT | ❌ | 3000 | Server port |
| **Database (MikroORM)** |
| DB_TYPE | ❌ | postgresql | Database type: `postgresql` or `mssql` |
| DB_HOST | ✅ | - | Database host |
| DB_PORT | ❌ | 5432/1433 | Database port (auto-detected by DB_TYPE) |
| DB_NAME | ✅ | - | Database name |
| DB_USER | ✅ | - | Database user |
| DB_PASS | ✅ | - | Database password |
| **Auth** |
| BETTER_AUTH_SECRET | ✅ | - | Auth secret (min 32 chars) |
| BETTER_AUTH_URL | ✅ | - | Auth callback URL |
| **Stripe** |
| STRIPE_SECRET_KEY | ✅ | - | Stripe secret key |
| STRIPE_WEBHOOK_SECRET | ✅ | - | Stripe webhook secret |
| **Email** |
| RESEND_API_KEY | ✅ | - | Resend API key |
| RESEND_FROM_EMAIL | ✅ | - | From email address |
| **Supplier Integrations** |
| APREMIUM_API_URL | ❌ | - | A-Premium API URL |
| APREMIUM_API_KEY | ❌ | - | A-Premium API key |
| APREMIUM_TIMEOUT_MS | ❌ | 8000 | A-Premium request timeout |
| BUYAUTOPARTS_API_URL | ❌ | - | BuyAutoParts API URL |
| BUYAUTOPARTS_API_KEY | ❌ | - | BuyAutoParts API key |
| BUYAUTOPARTS_TIMEOUT_MS | ❌ | 8000 | BuyAutoParts request timeout |
| TRQ_API_URL | ❌ | - | TRQ API URL |
| TRQ_API_KEY | ❌ | - | TRQ API key |
| TRQ_TIMEOUT_MS | ❌ | 8000 | TRQ request timeout |
| **Other** |
| LOG_LEVEL | ❌ | info | Pino log level |
| FEATURE_CONFIG_CACHE_TTL | ❌ | 300 | Feature config cache TTL (seconds) |
| JOB_QUEUE_REDIS_URL | ❌ | - | Redis URL for job queue (optional) |
| WEBHOOK_SECRET | ❌ | - | Secret for validating internal webhooks |

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
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "OrderService"
```

**Test Categories:**

| Type | Location | Coverage |
|------|----------|----------|
| Unit Tests | `src/**/*.spec.ts` | Services, utilities |
| Integration Tests | `test/integration/` | API endpoints |
| E2E Tests | `test/e2e/` | Full flows |

**Mocking External Services:**

```typescript
// test/mocks/supplier.mock.ts
import nock from 'nock';

export function mockSupplierOfferSearch(baseUrl: string, response: unknown) {
  return nock(baseUrl)
    .post('/offers/search')
    .reply(200, response);
}

// In tests
beforeEach(() => {
  mockSupplierOfferSearch(process.env.APREMIUM_API_URL!, { items: [], total: 0 });
  mockSupplierOfferSearch(process.env.BUYAUTOPARTS_API_URL!, { items: [], total: 0 });
  mockSupplierOfferSearch(process.env.TRQ_API_URL!, { items: [], total: 0 });
});

afterEach(() => {
  nock.cleanAll();
});
```

### Frontend Testing

```bash
# Run unit tests
ng test

# Run with coverage
ng test --code-coverage

# Run e2e tests
ng e2e
```

**Component Testing:**

```typescript
// catalog.service.spec.ts
describe('CatalogService', () => {
  let service: CatalogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CatalogService],
    });
    service = TestBed.inject(CatalogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch categories', () => {
    const mockCategories = [{ id: '1', name: 'Engine Parts' }];
    
    service.getCategories().then(categories => {
      expect(categories).toEqual(mockCategories);
    });

    const req = httpMock.expectOne('/api/v1/catalog/categories');
    expect(req.request.method).toBe('GET');
    req.flush({ data: mockCategories });
  });
});
```

### Testing Checklist

- [ ] Unit tests for all services
- [ ] Integration tests for all API endpoints
- [ ] Test authentication and authorization
- [ ] Test role-based feature access
- [ ] Test cart and checkout flow
- [ ] Test inventory adjustments
- [ ] Test order status transitions
- [ ] Test supplier integration error handling
- [ ] Test webhook signature validation
- [ ] Test email sending (mock)
- [ ] Test Stripe payment flow (test mode)

---

## Appendix E: Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhook endpoint configured
- [ ] SSL certificates installed
- [ ] CORS origins configured
- [ ] Rate limiting configured
- [ ] Error monitoring configured (e.g., Sentry)

### Production Environment Variables

```bash
NODE_ENV=production
DB_TYPE=postgresql
DB_HOST=your-production-host
# ... all required env vars
```

### Database Migration

```bash
# Apply migrations
npx mikro-orm migration:up

# Seed initial data (roles, feature configs)
npx mikro-orm seeder:run --class=RoleSeeder
```

### Health Check Endpoint

```typescript
// GET /health
{
  "status": "ok",
  "version": "1.0.0",
  "database": "connected",
  "timestamp": "2026-01-06T12:00:00Z"
}
```

---

## Appendix F: Development Commands

### Backend

```bash
cd backend

# Install dependencies
npm install

# Development (with hot reload)
npm run dev

# Build for production
npm run build

# Start production
npm start

# Run tests
npm test

# Database
npx mikro-orm migration:create     # Create migration
npx mikro-orm migration:up         # Apply migrations
npx mikro-orm migration:down       # Rollback last migration
npx mikro-orm seeder:run           # Run seeders
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Development server (port 4200)
ng serve

# Build for production
ng build --configuration=production

# Run tests
ng test

# E2E tests
ng e2e

# Lint
ng lint
```

### Docker (Optional)

```dockerfile
# backend/Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/snautoparts/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

*End of README*
