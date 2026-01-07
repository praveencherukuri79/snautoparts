# 04. Roles & Permissions

This document defines the role-based access control (RBAC) system, permissions matrix, and authorization implementation details.

## Role Definitions

### CUSTOMER

**Who:** Regular shoppers and end users

**Purpose:** Browse catalog, make purchases, manage account

**Default Role:** Yes - All new registrations default to CUSTOMER

**Permissions:**
- Browse public catalog
- Search products
- View product details
- Manage shopping cart
- Complete checkout
- View own order history
- Manage own profile
- Manage own addresses

**Restrictions:**
- Cannot access manager or admin features
- Cannot view other users' orders
- Cannot manage inventory
- Cannot manage products
- Cannot access system settings

---

### MANAGER

**Who:** Operations staff, warehouse managers, fulfillment team

**Purpose:** Manage orders, inventory, and products

**Permissions:**
- All CUSTOMER permissions
- View all orders
- Update order status
- Fulfill orders
- Add tracking information
- Cancel orders (with inventory restoration)
- View inventory levels
- Create inventory adjustments
- View inventory history
- Manage products (CRUD)
- View order statistics and charts
- Access manager dashboard

**Restrictions:**
- Cannot manage users
- Cannot change user roles
- Cannot access system settings
- Cannot view audit logs
- Cannot delete users

**Business Data Access:**
- Can modify business data (products, inventory, orders)
- Cannot modify system data (users, roles, settings)

---

### ADMIN

**Who:** System administrators, owners, IT staff

**Purpose:** Full system access and administration

**Permissions:**
- All MANAGER permissions
- All CUSTOMER permissions
- Create users
- Update user roles
- Delete users
- View all users
- Manage system settings
- View audit logs
- Access admin dashboard
- Configure integrations
- Manage all system data

**Restrictions:**
- Cannot demote own role (self-protection)
- Cannot delete own account (self-protection)

**System Data Access:**
- Can modify both business data and system data
- Full administrative control

---

## Permission Matrix

| Feature/Resource | CUSTOMER | MANAGER | ADMIN |
|------------------|----------|---------|-------|
| **Catalog** |
| Browse products | ✅ | ✅ | ✅ |
| Search products | ✅ | ✅ | ✅ |
| View product details | ✅ | ✅ | ✅ |
| **Cart** |
| View cart | ✅ (own) | ❌ | ❌ |
| Add to cart | ✅ | ❌ | ❌ |
| Update cart | ✅ (own) | ❌ | ❌ |
| Remove from cart | ✅ (own) | ❌ | ❌ |
| **Checkout** |
| Create payment intent | ✅ | ❌ | ❌ |
| Create order | ✅ | ❌ | ❌ |
| **Orders** |
| View own orders | ✅ | ❌ | ❌ |
| View all orders | ❌ | ✅ | ✅ |
| Update order status | ❌ | ✅ | ✅ |
| Cancel order | ❌ | ✅ | ✅ |
| View order stats | ❌ | ✅ | ✅ |
| **Inventory** |
| View inventory | ❌ | ✅ | ✅ |
| Adjust inventory | ❌ | ✅ | ✅ |
| View inventory history | ❌ | ✅ | ✅ |
| **Products** |
| Create product | ❌ | ✅ | ✅ |
| Update product | ❌ | ✅ | ✅ |
| Delete product | ❌ | ✅ | ✅ |
| **Users** |
| View own profile | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |
| View all users | ❌ | ❌ | ✅ |
| Create user | ❌ | ❌ | ✅ |
| Update user role | ❌ | ❌ | ✅ |
| Delete user | ❌ | ❌ | ✅ |
| **Settings** |
| View settings | ❌ | ❌ | ✅ |
| Update settings | ❌ | ❌ | ✅ |
| **Audit** |
| View audit logs | ❌ | ❌ | ✅ |

---

## API Route Authorization

### Public Routes (`/api/v1/public`)

**Authentication:** Not required

**Routes:**
- `GET /catalog/categories` - List categories
- `GET /catalog/categories/:slug` - Get category
- `GET /catalog/brands` - List brands
- `GET /catalog/products` - List products
- `GET /catalog/products/:slug` - Get product
- `GET /catalog/search` - Search products
- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

---

### Customer Routes (`/api/v1/customer`)

**Authentication:** Required (any authenticated user)

**Authorization:** All authenticated users can access

**Routes:**
- `GET /cart` - Get cart
- `POST /cart/items` - Add to cart
- `PATCH /cart/items/:id` - Update cart item
- `DELETE /cart/items/:id` - Remove cart item
- `DELETE /cart` - Clear cart
- `GET /checkout/shipping-methods` - Get shipping methods
- `POST /checkout/create-payment-intent` - Create payment intent
- `POST /checkout/create-order` - Create order
- `GET /orders` - Get order history (own orders only)
- `GET /orders/:id` - Get order details (own orders only)
- `GET /orders/track/:orderNumber` - Track order (public with order number)
- `GET /profile` - Get profile
- `PATCH /profile` - Update profile
- `GET /profile/addresses` - Get addresses
- `POST /profile/addresses` - Create address
- `PATCH /profile/addresses/:id` - Update address
- `DELETE /profile/addresses/:id` - Delete address

**Implementation:**
```typescript
// All customer routes require authentication
fastify.addHook('preHandler', fastify.authenticate);
```

**Data Scoping:**
- Users can only access their own cart, orders, and addresses
- Backend enforces user ID matching for data access

---

### Manager Routes (`/api/v1/manager`)

**Authentication:** Required

**Authorization:** MANAGER or ADMIN role required

**Routes:**
- `GET /orders` - List all orders
- `GET /orders/stats` - Get order statistics
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id/status` - Update order status
- `POST /orders/:id/cancel` - Cancel order
- `GET /inventory` - List inventory
- `GET /inventory/alerts` - Get low stock alerts
- `POST /inventory/adjustments` - Create inventory adjustment
- `GET /inventory/:productId/history` - Get inventory history
- `GET /products` - List products (management view)
- `POST /products` - Create product
- `GET /products/:id` - Get product
- `PATCH /products/:id` - Update product
- `DELETE /products/:id` - Delete product

**Implementation:**
```typescript
// All manager routes require MANAGER or ADMIN role
fastify.addHook('preHandler', fastify.requireRole('MANAGER', 'ADMIN'));
```

**Data Access:**
- Managers can view and modify all orders, inventory, and products
- No restrictions on business data access

---

### Admin Routes (`/api/v1/admin`)

**Authentication:** Required

**Authorization:** ADMIN role only

**Routes:**
- `GET /users` - List all users
- `POST /users` - Create user
- `GET /users/:id` - Get user details
- `PATCH /users/:id/role` - Update user role
- `DELETE /users/:id` - Delete user
- `GET /settings` - Get all settings
- `GET /settings/:key` - Get setting
- `PUT /settings/:key` - Update setting
- `DELETE /settings/:key` - Delete setting
- `POST /settings/bulk` - Bulk update settings
- `GET /audit` - Get audit logs
- `GET /audit/stats` - Get audit statistics

**Implementation:**
```typescript
// All admin routes require ADMIN role
fastify.addHook('preHandler', fastify.requireRole('ADMIN'));
```

**Data Access:**
- Admins have full access to all system data
- Can manage users, roles, settings, and audit logs

---

## Frontend Route Guards

### Auth Guard

**Purpose:** Require authentication to access route

**Implementation:** `authGuard` function

**Usage:**
```typescript
{
  path: 'checkout',
  canActivate: [authGuard],
  loadChildren: () => import('./features/checkout/checkout.routes')
}
```

**Behavior:**
- Checks if user is authenticated
- Redirects to `/login` if not authenticated
- Preserves return URL in query params

---

### Role Guard

**Purpose:** Require specific role(s) to access route

**Implementation:** `roleGuard` function

**Usage:**
```typescript
{
  path: 'manager',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['MANAGER', 'ADMIN'] },
  loadChildren: () => import('./features/manager/manager.routes')
}
```

**Behavior:**
- Requires authentication (use with authGuard)
- Checks user role against required roles
- Redirects to home if role doesn't match

---

## Frontend Route Protection

### Public Routes

No guards required:
- `/` - Home
- `/category/:slug` - Category listing
- `/products` - Product listing
- `/products/:slug` - Product detail
- `/cart` - Shopping cart (public, but cart requires auth to persist)
- `/login` - Login
- `/register` - Register
- `/forgot-password` - Forgot password
- `/reset-password` - Reset password

### Customer Routes (Auth Required)

Protected with `authGuard`:
- `/checkout/*` - Checkout flow
- `/account/*` - Account management
- `/orders` - Order history

### Manager Routes (Role Required)

Protected with `authGuard` + `roleGuard` (MANAGER or ADMIN):
- `/manager/*` - Manager dashboard and features

### Admin Routes (Admin Only)

Protected with `authGuard` + `roleGuard` (ADMIN only):
- `/admin/*` - Admin dashboard and features

---

## Authorization Implementation

### Backend Authorization

#### Authentication Plugin

**File:** `backend/src/plugins/auth.ts`

**Features:**
- `fastify.authenticate` - Validates session token
- `fastify.requireRole(...roles)` - Validates role

**Token Sources:**
1. Cookie: `auth-token`
2. Header: `Authorization: Bearer <token>`

**Session Validation:**
- Checks token exists
- Validates token in database
- Checks expiration
- Attaches user to request

#### Route-Level Authorization

**Pattern:**
```typescript
export const customerRoutes = async (fastify: FastifyInstance) => {
  // Require authentication
  fastify.addHook('preHandler', fastify.authenticate);
  
  // Routes...
};

export const managerRoutes = async (fastify: FastifyInstance) => {
  // Require MANAGER or ADMIN role
  fastify.addHook('preHandler', fastify.requireRole('MANAGER', 'ADMIN'));
  
  // Routes...
};

export const adminRoutes = async (fastify: FastifyInstance) => {
  // Require ADMIN role only
  fastify.addHook('preHandler', fastify.requireRole('ADMIN'));
  
  // Routes...
};
```

#### Data-Level Authorization

**Customer Data Scoping:**
```typescript
// Users can only access their own data
const userId = request.user!.id;
const order = await fastify.prisma.order.findFirst({
  where: {
    id: orderId,
    userId, // Enforce user ownership
  },
});
```

**Manager Data Access:**
```typescript
// Managers can access all orders
const orders = await fastify.prisma.order.findMany({
  // No userId filter - access all orders
});
```

---

### Frontend Authorization

#### Auth Service

**File:** `frontend/src/app/core/services/auth.service.ts`

**Methods:**
- `isAuthenticated()` - Check if user is logged in
- `getUserRole()` - Get current user role
- `user` - Signal with current user
- `isLoggedIn` - Computed signal for auth status
- `userRole` - Computed signal for user role

#### Role-Based UI Visibility

**Pattern:**
```typescript
// Component
readonly userRole = this.authService.userRole;
readonly isAdmin = computed(() => this.userRole() === 'ADMIN');
readonly isManager = computed(() => 
  this.userRole() === 'MANAGER' || this.userRole() === 'ADMIN'
);

// Template
@if (isManager()) {
  <a routerLink="/manager/orders">Orders</a>
}

@if (isAdmin()) {
  <a routerLink="/admin/users">Users</a>
}
```

---

## Security Considerations

### Self-Protection

**Admin Self-Demotion Prevention:**
```typescript
// Prevent admin from demoting themselves
if (id === adminId && role !== 'ADMIN') {
  return fastify.httpErrors.badRequest('Cannot demote yourself');
}
```

**Admin Self-Deletion Prevention:**
```typescript
// Prevent admin from deleting themselves
if (id === adminId) {
  return fastify.httpErrors.badRequest('Cannot delete yourself');
}
```

### Session Security

- Sessions expire after 30 days
- Tokens are stored in HTTP-only cookies (prevents XSS)
- Secure flag set in production (HTTPS only)
- SameSite: 'lax' (CSRF protection)

### Password Security

- Passwords hashed with PBKDF2
- Salt: 16 bytes random
- Iterations: 100,000
- Hash length: 64 bytes
- Algorithm: SHA-512

---

## Role Assignment

### Default Role

- New user registrations default to `CUSTOMER`
- Role assigned during user creation

### Role Changes

- Only admins can change user roles
- Role changes logged in audit log
- Cannot demote yourself from admin

### Role Hierarchy

```
ADMIN
  └─ Can do everything MANAGER can do
      └─ Can do everything CUSTOMER can do
```

---

## Audit Logging

All role-related actions are logged:

- `CREATE_USER` - User creation with role
- `UPDATE_USER_ROLE` - Role changes
- `DELETE_USER` - User deletion

Audit log includes:
- User who performed action
- Old role (if changed)
- New role (if changed)
- Timestamp
- IP address
- User agent

---

**Next:** [05. API Reference](05-api-reference.md) | [Back to Index](README.md)

