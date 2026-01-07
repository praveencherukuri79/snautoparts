# 02. Features Documentation

This document provides comprehensive documentation of all features available in the SN Auto Parts application, organized by user role.

## Feature Matrix

| Feature | Customer | Manager | Admin |
|---------|----------|---------|-------|
| Browse Catalog | ✅ | ✅ | ✅ |
| View Products | ✅ | ✅ | ✅ |
| Search Products | ✅ | ✅ | ✅ |
| Shopping Cart | ✅ | ❌ | ❌ |
| Checkout | ✅ | ❌ | ❌ |
| Order History | ✅ (own) | ✅ (all) | ✅ (all) |
| Profile Management | ✅ | ✅ | ✅ |
| Address Management | ✅ | ❌ | ❌ |
| Order Fulfillment | ❌ | ✅ | ✅ |
| Inventory Management | ❌ | ✅ | ✅ |
| Product Management | ❌ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |
| Role Management | ❌ | ❌ | ✅ |
| System Settings | ❌ | ❌ | ✅ |
| Audit Logs | ❌ | ❌ | ✅ |

---

## Customer Features

### Home Page

**Purpose:** Landing page showcasing featured products and categories

**Features:**
- Featured product carousel
- Category navigation
- Promotional banners
- Quick access to popular categories

**Access:** Public (no authentication required)

**Related Routes:**
- Frontend: `/` (HomeComponent)
- Backend: `/api/v1/public/catalog/*`

---

### Category Browsing

**Purpose:** Browse products organized by category

**Features:**
- Hierarchical category navigation
- Category pages with product listings
- Category descriptions and images
- Product count per category
- Subcategory support

**Access:** Public

**Related Routes:**
- Frontend: `/category/:slug` (CategoryListingComponent)
- Backend: `GET /api/v1/public/catalog/categories`
- Backend: `GET /api/v1/public/catalog/categories/:slug`

**Example Flow:**
1. User clicks on a category from navigation
2. Category page loads with products
3. Products can be filtered and sorted
4. User can navigate to product detail pages

---

### Product Listing

**Purpose:** Display paginated list of products with filtering

**Features:**
- Pagination (configurable page size)
- Filtering by:
  - Category
  - Brand
  - Price range
  - Stock availability
  - Featured products
- Sorting by:
  - Price (low to high, high to low)
  - Name (A-Z, Z-A)
  - Newest first
- Search functionality
- Product cards with:
  - Product image
  - Product name
  - Price
  - Compare at price (if available)
  - Stock status
  - Quick add to cart

**Access:** Public

**Related Routes:**
- Frontend: `/products` (ProductListingComponent)
- Backend: `GET /api/v1/public/catalog/products`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `category` - Filter by category slug
- `brand` - Filter by brand slug
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Search query
- `sort` - Sort field and direction

---

### Product Detail

**Purpose:** Detailed product information page

**Features:**
- Product images (gallery)
- Product name and SKU
- Price and compare at price
- Product description
- Stock quantity display
- Add to cart functionality
- Quantity selector
- Related products
- Product specifications
- Vehicle fitment information (if available)

**Access:** Public

**Related Routes:**
- Frontend: `/products/:slug` (ProductDetailComponent)
- Backend: `GET /api/v1/public/catalog/products/:slug`

**User Actions:**
- Add product to cart
- Change quantity
- View related products
- Navigate back to listing

---

### Shopping Cart

**Purpose:** Manage items before checkout

**Features:**
- View all cart items
- Update item quantities
- Remove items from cart
- View cart subtotal
- See item count badge
- Stock validation
- Persistent cart (saved per user)
- Empty cart state

**Access:** Authenticated (Customer role)

**Related Routes:**
- Frontend: `/cart` (CartComponent)
- Backend: `GET /api/v1/customer/cart`
- Backend: `POST /api/v1/customer/cart/items`
- Backend: `PATCH /api/v1/customer/cart/items/:id`
- Backend: `DELETE /api/v1/customer/cart/items/:id`
- Backend: `DELETE /api/v1/customer/cart` (clear cart)

**Cart Behavior:**
- Cart is created automatically on first item add
- Cart persists across sessions
- Stock is validated before adding items
- Quantities can be updated or set to 0 to remove

---

### Checkout Flow

**Purpose:** Complete purchase with multi-step process

**Steps:**

#### 1. Shipping Address
- Select existing address or enter new address
- Address validation
- Save address for future use (optional)

#### 2. Shipping Method
- Select shipping method:
  - Standard Shipping (5-7 business days) - $9.99 (free over $50)
  - Express Shipping (2-3 business days) - $19.99
  - Overnight Shipping (next business day) - $29.99
- Display shipping cost
- Calculate estimated delivery date

#### 3. Review & Confirmation
- Review order summary
- Review shipping address
- Review shipping method
- Review order totals:
  - Subtotal
  - Shipping
  - Tax (7.5%)
  - Total
- Order notes (optional)

#### 4. Payment
- Stripe payment integration
- Secure card entry
- Payment intent creation
- Payment processing
- Order creation after successful payment

**Access:** Authenticated (Customer role)

**Related Routes:**
- Frontend: `/checkout/*` (CheckoutLayoutComponent with child routes)
- Backend: `GET /api/v1/customer/checkout/shipping-methods`
- Backend: `POST /api/v1/customer/checkout/create-payment-intent`
- Backend: `POST /api/v1/customer/checkout/create-order`

**Idempotency:**
- Checkout uses idempotency keys to prevent duplicate orders
- Payment intents are idempotent
- Order creation is idempotent

---

### Order History

**Purpose:** View past orders and track current orders

**Features:**
- List of all user orders
- Order details:
  - Order number
  - Order date
  - Order status
  - Payment status
  - Total amount
  - Items ordered
- Order tracking
- Order timeline
- Filter by status
- Pagination

**Access:** Authenticated (Customer role - own orders only)

**Related Routes:**
- Frontend: `/orders` (OrderHistoryComponent)
- Backend: `GET /api/v1/customer/orders`
- Backend: `GET /api/v1/customer/orders/:id`
- Backend: `GET /api/v1/customer/orders/track/:orderNumber`

**Order Statuses:**
- PENDING - Order placed, awaiting payment
- CONFIRMED - Payment confirmed
- PROCESSING - Order being prepared
- SHIPPED - Order shipped
- DELIVERED - Order delivered
- CANCELLED - Order cancelled
- REFUNDED - Order refunded

---

### Account & Profile Management

**Purpose:** Manage user account information

**Features:**
- View profile information:
  - Name
  - Email
  - Phone
  - Account creation date
- Update profile:
  - First name
  - Last name
  - Phone number
- Change password (future)
- Account settings

**Access:** Authenticated

**Related Routes:**
- Frontend: `/account/profile` (ProfileComponent)
- Backend: `GET /api/v1/customer/profile`
- Backend: `PATCH /api/v1/customer/profile`

---

### Address Management

**Purpose:** Manage shipping addresses

**Features:**
- List saved addresses
- Add new address
- Edit existing address
- Delete address
- Set default address
- Address labels (Home, Work, etc.)

**Access:** Authenticated (Customer role)

**Related Routes:**
- Frontend: `/account/addresses` (AddressesComponent)
- Backend: `GET /api/v1/customer/profile/addresses`
- Backend: `POST /api/v1/customer/profile/addresses`
- Backend: `PATCH /api/v1/customer/profile/addresses/:id`
- Backend: `DELETE /api/v1/customer/profile/addresses/:id`

**Address Fields:**
- Label (optional)
- First name
- Last name
- Street address
- Apartment/Unit (optional)
- City
- State
- ZIP code
- Country (default: US)
- Phone (optional)
- Default address flag

---

## Manager Features

### Orders Dashboard

**Purpose:** Overview of all orders with statistics

**Features:**
- Order statistics:
  - New orders today
  - Pending shipment count
  - Today's revenue
  - Orders by status
- Order list with filters:
  - Status filter
  - Date range filter
  - Search by order number or customer
- Order details view
- Order status updates
- Order fulfillment
- Charts and visualizations (ngx-charts)

**Access:** Authenticated (Manager or Admin role)

**Related Routes:**
- Frontend: `/manager/orders` (OrdersDashboardComponent)
- Backend: `GET /api/v1/manager/orders`
- Backend: `GET /api/v1/manager/orders/stats`
- Backend: `GET /api/v1/manager/orders/:id`
- Backend: `PATCH /api/v1/manager/orders/:id/status`
- Backend: `POST /api/v1/manager/orders/:id/cancel`

**Manager Actions:**
- View all orders
- Update order status
- Add tracking information
- Cancel orders (with inventory restoration)
- View order details and timeline

---

### Order Detail & Fulfillment

**Purpose:** Detailed order view and fulfillment workflow

**Features:**
- Complete order information
- Customer details
- Shipping address
- Order items with quantities
- Order timeline
- Payment events
- Status update interface
- Tracking number entry
- Shipping carrier selection
- Order notes
- Cancel order functionality

**Access:** Authenticated (Manager or Admin role)

**Related Routes:**
- Frontend: `/manager/orders/:id` (OrderDetailComponent)
- Backend: `GET /api/v1/manager/orders/:id`
- Backend: `PATCH /api/v1/manager/orders/:id/status`

**Fulfillment Workflow:**
1. Order status: PENDING → CONFIRMED (after payment)
2. Order status: CONFIRMED → PROCESSING (when preparing)
3. Order status: PROCESSING → SHIPPED (when shipped)
   - Add tracking number
   - Add shipping carrier
4. Order status: SHIPPED → DELIVERED (when delivered)

---

### Inventory Management

**Purpose:** Monitor and manage product inventory levels

**Features:**
- Inventory list with:
  - Product SKU
  - Product name
  - Current stock quantity
  - Low stock threshold
  - Stock status indicators
- Low stock alerts
- Search and filter:
  - Search by name or SKU
  - Filter by low stock
- Inventory history per product
- Stock level indicators:
  - In stock (green)
  - Low stock (yellow)
  - Out of stock (red)

**Access:** Authenticated (Manager or Admin role)

**Related Routes:**
- Frontend: `/manager/inventory` (InventoryListComponent)
- Backend: `GET /api/v1/manager/inventory`
- Backend: `GET /api/v1/manager/inventory/alerts`
- Backend: `GET /api/v1/manager/inventory/:productId/history`

---

### Inventory Adjustments

**Purpose:** Adjust product stock quantities

**Features:**
- Create inventory adjustments
- Adjustment types:
  - RECEIVED - New stock received
  - SOLD - Stock sold (auto-created on order)
  - RETURNED - Stock returned
  - DAMAGED - Stock damaged/lost
  - ADJUSTMENT - Manual correction
  - TRANSFER - Stock transfer
- Adjustment reason/notes
- Reference ID (PO number, order ID, etc.)
- View adjustment history
- Automatic inventory log creation

**Access:** Authenticated (Manager or Admin role)

**Related Routes:**
- Frontend: `/manager/inventory/adjustments` (InventoryAdjustmentsComponent)
- Backend: `POST /api/v1/manager/inventory/adjustments`
- Backend: `GET /api/v1/manager/inventory/:productId/history`

**Adjustment Process:**
1. Select product
2. Enter adjustment quantity (positive or negative)
3. Select adjustment type
4. Enter reason/notes
5. Submit adjustment
6. Inventory updated and log created

---

### Product Management

**Purpose:** Manage product catalog

**Features:**
- Product list with filters
- Create new products
- Edit existing products
- Product fields:
  - SKU (unique)
  - Name
  - Slug (unique, URL-friendly)
  - Description
  - Short description
  - Price
  - Compare at price
  - Cost price
  - Category
  - Brand
  - Images (multiple)
  - Weight and unit
  - Stock quantity
  - Low stock threshold
  - Active/inactive status
  - Featured flag
  - SEO metadata
- Bulk operations (future)

**Access:** Authenticated (Manager or Admin role)

**Related Routes:**
- Frontend: `/manager/products` (ProductsComponent)
- Backend: `GET /api/v1/manager/products`
- Backend: `POST /api/v1/manager/products`
- Backend: `GET /api/v1/manager/products/:id`
- Backend: `PATCH /api/v1/manager/products/:id`
- Backend: `DELETE /api/v1/manager/products/:id`

---

## Admin Features

### User Management

**Purpose:** Manage system users and their roles

**Features:**
- List all users
- Filter by role
- Search by email or name
- View user details:
  - Email
  - Name
  - Role
  - Account creation date
  - Last active date
  - Order count
  - Address count
- Create new users
- Update user roles
- Delete users (with safeguards)
- Prevent self-demotion/deletion

**Access:** Authenticated (Admin role only)

**Related Routes:**
- Frontend: `/admin/users` (UsersManagementComponent)
- Backend: `GET /api/v1/admin/users`
- Backend: `POST /api/v1/admin/users`
- Backend: `GET /api/v1/admin/users/:id`
- Backend: `PATCH /api/v1/admin/users/:id/role`
- Backend: `DELETE /api/v1/admin/users/:id`

**Role Management:**
- Assign CUSTOMER, MANAGER, or ADMIN roles
- Role changes are logged in audit log
- Cannot demote or delete yourself

---

### System Settings

**Purpose:** Configure system-wide settings

**Features:**
- View all settings
- Filter by category
- Update individual settings
- Bulk update settings
- Settings categories:
  - General
  - Tax
  - Shipping
  - Email
  - Payment
  - Integration
- Settings stored as JSON values
- All changes logged in audit log

**Access:** Authenticated (Admin role only)

**Related Routes:**
- Frontend: `/admin/settings` (SettingsManagementComponent)
- Backend: `GET /api/v1/admin/settings`
- Backend: `GET /api/v1/admin/settings/:key`
- Backend: `PUT /api/v1/admin/settings/:key`
- Backend: `DELETE /api/v1/admin/settings/:key`
- Backend: `POST /api/v1/admin/settings/bulk`

**Example Settings:**
- Tax rate
- Shipping costs
- Free shipping threshold
- Email templates
- Stripe configuration
- Site name and branding

---

### Audit Logs

**Purpose:** Track all system changes and user actions

**Features:**
- View audit log entries
- Filter by:
  - User
  - Action type
  - Resource type
  - Date range
- Audit log details:
  - User who performed action
  - Action type
  - Resource affected
  - Old data (before change)
  - New data (after change)
  - IP address
  - User agent
  - Timestamp
- Audit statistics:
  - Actions today
  - Actions this week
  - Actions by type
  - Resources by type
- Pagination

**Access:** Authenticated (Admin role only)

**Related Routes:**
- Frontend: `/admin/audit` (AuditLogsComponent)
- Backend: `GET /api/v1/admin/audit`
- Backend: `GET /api/v1/admin/audit/stats`

**Tracked Actions:**
- User creation/updates/deletion
- Role changes
- Order status changes
- Inventory adjustments
- Settings changes
- Product changes

**Audit Log Fields:**
- `userId` - User who performed action
- `action` - Action type (e.g., CREATE_USER, UPDATE_ORDER_STATUS)
- `resource` - Resource type (e.g., User, Order, Setting)
- `resourceId` - ID of affected resource
- `oldData` - Data before change (JSON)
- `newData` - Data after change (JSON)
- `ipAddress` - IP address of request
- `userAgent` - User agent string
- `createdAt` - Timestamp

---

## Feature Dependencies

### Checkout Dependencies
- Requires authenticated user
- Requires non-empty cart
- Requires valid shipping address
- Requires selected shipping method
- Requires valid payment method

### Order Fulfillment Dependencies
- Requires payment confirmation (via Stripe webhook)
- Requires inventory availability
- Requires valid shipping address

### Inventory Adjustment Dependencies
- Requires product exists
- Requires valid adjustment type
- Requires resulting quantity >= 0

### User Management Dependencies
- Requires admin role
- Requires unique email
- Prevents self-modification for critical operations

---

**Next:** [03. Database Schema](03-database.md) | [Back to Index](README.md)

