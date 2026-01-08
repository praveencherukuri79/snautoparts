# SN Auto Parts - Frontend Feature Checklist

## Standards & Guidelines
- ✅ Use MUI theme palette (no inline colors, no CSS variables in sx)
- ✅ Use primitives from `src/primitives/` for common UI components
- ✅ Use shared hooks from `src/hooks/`
- ✅ Use services from `src/services/` for API calls
- ✅ Use types from `src/types/` for TypeScript interfaces
- ✅ Use utils from `src/utils/` for helpers/formatters
- ✅ No component-level CSS - use theme & sx prop only
- ✅ Cross-check swagger.json for API contracts

---

## Phase 1: Authentication (Public)

### 1.1 Login Page
- [ ] Design: `stitch_home_page_customer_view/login_page_-_customer_view/`
- [ ] API: `POST /auth/login`
- [ ] Features:
  - [ ] Email/password form with validation
  - [ ] Remember me checkbox
  - [ ] Forgot password link
  - [ ] Register link
  - [ ] Error handling (invalid credentials)
  - [ ] Redirect after login
  - [ ] Store auth token (Recoil + localStorage)

### 1.2 Register Page
- [ ] Design: `stitch_home_page_customer_view/register_page_-_customer_view/`
- [ ] API: `POST /auth/register`
- [ ] Features:
  - [ ] First name, Last name, Email, Phone, Password fields
  - [ ] Password confirmation
  - [ ] Form validation
  - [ ] Terms acceptance checkbox
  - [ ] Login link
  - [ ] Auto-login after registration

### 1.3 Forgot Password Page
- [ ] Design: `stitch_home_page_customer_view/forgot_password_-_customer_view/`
- [ ] API: `POST /auth/forgot-password` (if exists)
- [ ] Features:
  - [ ] Email input
  - [ ] Success message
  - [ ] Back to login link

### 1.4 Reset Password Page
- [ ] Design: `stitch_home_page_customer_view/reset_password_-_customer_view/`
- [ ] API: `POST /auth/reset-password` (if exists)
- [ ] Features:
  - [ ] New password input
  - [ ] Confirm password input
  - [ ] Token validation
  - [ ] Success redirect to login

---

## Phase 2: Catalog (Public)

### 2.1 Home Page ✅ (Basic structure done)
- [x] Design: `stitch_home_page_customer_view/home_page_-_customer_view/`
- [ ] APIs:
  - [ ] `GET /catalog/products/featured`
  - [ ] `GET /catalog/categories`
  - [ ] `GET /catalog/fitment/makes`
  - [ ] `GET /catalog/fitment/models`
  - [ ] `GET /catalog/fitment/years`
- [ ] Features:
  - [x] Hero banner with vehicle selector
  - [ ] Connect vehicle selector to API
  - [ ] Featured products carousel (API integration)
  - [ ] Category grid (API integration)
  - [ ] Promotional banners

### 2.2 Product Listing Page
- [ ] Design: `stitch_home_page_customer_view/product_listing_page_-_customer_view/`
- [ ] API: `GET /catalog/products`
- [ ] Features:
  - [ ] Product grid/list view toggle
  - [ ] Pagination
  - [ ] Filters sidebar:
    - [ ] Category filter
    - [ ] Brand filter
    - [ ] Price range slider
    - [ ] Stock availability
  - [ ] Sort dropdown (price, name, newest)
  - [ ] Search integration
  - [ ] Add to cart button
  - [ ] Quick view modal

### 2.3 Product Detail Page
- [ ] Design: `stitch_home_page_customer_view/product_detail_page_-_customer_view/`
- [ ] API: `GET /catalog/products/{slug}`
- [ ] Features:
  - [ ] Image gallery with thumbnails
  - [ ] Product info (name, SKU, price)
  - [ ] Stock status indicator
  - [ ] Quantity selector
  - [ ] Add to cart button
  - [ ] Description tabs
  - [ ] Vehicle fitment info
  - [ ] Related products

### 2.4 Category Listing Page
- [ ] Design: `stitch_home_page_customer_view/category_listing_page_-_customer_view/`
- [ ] APIs:
  - [ ] `GET /catalog/categories`
  - [ ] `GET /catalog/categories/{slug}`
- [ ] Features:
  - [ ] Category hero with image
  - [ ] Subcategory navigation
  - [ ] Product listing (reuse 2.2 components)

### 2.5 Search Results Page
- [ ] API: `GET /catalog/search`
- [ ] Features:
  - [ ] Search query display
  - [ ] Results count
  - [ ] Reuse product listing components
  - [ ] No results state

---

## Phase 3: Shopping Cart (Customer)

### 3.1 Shopping Cart Page
- [ ] Design: `stitch_home_page_customer_view/shopping_cart_page_-_customer_view/`
- [ ] APIs:
  - [ ] `GET /cart/`
  - [ ] `POST /cart/items`
  - [ ] `PATCH /cart/items/{id}`
  - [ ] `DELETE /cart/items/{id}`
- [ ] Features:
  - [ ] Cart items list
  - [ ] Product image, name, price
  - [ ] Quantity selector (update on change)
  - [ ] Remove item button
  - [ ] Cart subtotal
  - [ ] Continue shopping link
  - [ ] Proceed to checkout button
  - [ ] Empty cart state

### 3.2 Mini Cart (Header)
- [ ] API: `GET /cart/count`
- [ ] Features:
  - [ ] Cart icon with item count badge
  - [ ] Dropdown with cart preview
  - [ ] Quick checkout link

---

## Phase 4: Checkout (Customer)

### 4.1 Checkout - Shipping
- [ ] Design: `stitch_home_page_customer_view/checkout_-_payment_-_customer_view/`
- [ ] APIs:
  - [ ] `GET /profile/addresses`
  - [ ] `POST /profile/addresses`
  - [ ] `GET /checkout/shipping-methods`
- [ ] Features:
  - [ ] Select saved address or add new
  - [ ] Address form (inline)
  - [ ] Shipping method selection
  - [ ] Shipping cost display

### 4.2 Checkout - Review & Payment
- [ ] APIs:
  - [ ] `GET /checkout/summary`
  - [ ] `POST /checkout/payment-intent`
  - [ ] `POST /checkout/orders`
- [ ] Features:
  - [ ] Order summary
  - [ ] Stripe card element integration
  - [ ] Place order button
  - [ ] Order total breakdown

### 4.3 Order Confirmation Page
- [ ] Features:
  - [ ] Order number display
  - [ ] Order summary
  - [ ] Estimated delivery
  - [ ] Continue shopping link

---

## Phase 5: Customer Account

### 5.1 Account Dashboard
- [ ] Design: `stitch_home_page_customer_view/customer_dashboard_-_customer_view/`
- [ ] Features:
  - [ ] Welcome message
  - [ ] Quick links (orders, profile, addresses, vehicles)
  - [ ] Recent orders summary

### 5.2 Profile Page
- [ ] Design: `stitch_home_page_customer_view/account_-_profile_-_customer_view/`
- [ ] APIs:
  - [ ] `GET /profile/`
  - [ ] `PATCH /auth/profile`
- [ ] Features:
  - [ ] View profile info
  - [ ] Edit form (first name, last name, phone)
  - [ ] Change password link

### 5.3 Addresses Page
- [ ] Design: `stitch_home_page_customer_view/account_-_addresses_-_customer_view/`
- [ ] APIs:
  - [ ] `GET /profile/addresses`
  - [ ] `POST /profile/addresses`
  - [ ] `PATCH /profile/addresses/{id}`
  - [ ] `DELETE /profile/addresses/{id}`
- [ ] Features:
  - [ ] Address cards list
  - [ ] Default address badge
  - [ ] Add address modal/form
  - [ ] Edit address modal/form
  - [ ] Delete confirmation
  - [ ] Set as default

### 5.4 Saved Vehicles Page
- [ ] Design: `stitch_home_page_customer_view/account_-_saved_vehicles_-_customer_view/`
- [ ] APIs:
  - [ ] `GET /profile/vehicles`
  - [ ] `POST /profile/vehicles`
  - [ ] `DELETE /profile/vehicles/{id}`
  - [ ] `PUT /profile/vehicles/{id}/default`
- [ ] Features:
  - [ ] Vehicle cards list
  - [ ] Add vehicle (Year/Make/Model selector)
  - [ ] Delete vehicle
  - [ ] Set as default

### 5.5 Order History Page
- [ ] Design: `stitch_home_page_customer_view/order_history_page_-_customer_view/`
- [ ] API: `GET /orders/`
- [ ] Features:
  - [ ] Orders table/list
  - [ ] Status badges
  - [ ] Filter by status
  - [ ] Pagination
  - [ ] View details link

### 5.6 Order Detail Page
- [ ] Design: `stitch_home_page_customer_view/order_detail_page_-_customer_view/`
- [ ] APIs:
  - [ ] `GET /orders/{id}`
  - [ ] `GET /orders/{id}/timeline`
- [ ] Features:
  - [ ] Order info (number, date, status)
  - [ ] Order items list
  - [ ] Shipping address
  - [ ] Order timeline
  - [ ] Tracking info (if shipped)

---

## Phase 6: Manager Dashboard

### 6.1 Operations Dashboard
- [ ] Design: `stitch_home_page_customer_view/operations_dashboard_-_manager_view/`
- [ ] APIs:
  - [ ] `GET /orders/statistics`
  - [ ] `GET /orders/pending-count`
  - [ ] `GET /inventory/has-alerts`
- [ ] Features:
  - [ ] KPI cards (orders, revenue, pending)
  - [ ] Low stock alerts widget
  - [ ] Recent orders widget
  - [ ] Charts (order trends)

### 6.2 Orders Management
- [ ] Design: `stitch_home_page_customer_view/orders_list_-_manager_view/`
- [ ] API: `GET /orders/`
- [ ] Features:
  - [ ] Orders table with sorting
  - [ ] Status filter tabs
  - [ ] Date range filter
  - [ ] Search by order number/customer
  - [ ] Bulk actions

### 6.3 Order Detail (Manager)
- [ ] Design: `stitch_home_page_customer_view/order_detail_-_manager_view/`
- [ ] APIs:
  - [ ] `GET /orders/{id}`
  - [ ] `PATCH /orders/{id}/status`
  - [ ] `POST /orders/{id}/cancel`
  - [ ] `POST /orders/{id}/shipments`
- [ ] Features:
  - [ ] Full order details
  - [ ] Status update dropdown
  - [ ] Add tracking number
  - [ ] Cancel order button
  - [ ] Order timeline

### 6.4 Inventory List
- [ ] Design: `stitch_home_page_customer_view/inventory_list_-_manager_view/`
- [ ] APIs:
  - [ ] `GET /inventory/`
  - [ ] `GET /inventory/alerts`
- [ ] Features:
  - [ ] Inventory table
  - [ ] Stock level indicators
  - [ ] Low stock filter
  - [ ] Search by SKU/name
  - [ ] Link to detail page

### 6.5 Inventory Detail
- [ ] Design: `stitch_home_page_customer_view/inventory_detail_-_manager_view/`
- [ ] APIs:
  - [ ] `GET /inventory/{productId}`
  - [ ] `GET /inventory/{productId}/history`
- [ ] Features:
  - [ ] Current stock info
  - [ ] Stock history timeline
  - [ ] Adjust stock button

### 6.6 Inventory Adjustments
- [ ] Design: `stitch_home_page_customer_view/inventory_adjustments_-_manager_view/`
- [ ] API: `POST /inventory/adjustments`
- [ ] Features:
  - [ ] Product selector
  - [ ] Adjustment type dropdown
  - [ ] Quantity input (+/-)
  - [ ] Reason/notes field
  - [ ] Submit adjustment

### 6.7 Products Management
- [ ] Design: `stitch_home_page_customer_view/products_list_-_manager_view/`
- [ ] API: `GET /products/`
- [ ] Features:
  - [ ] Products table
  - [ ] Search/filter
  - [ ] Add product button
  - [ ] Edit/delete actions

### 6.8 Product Form (Create/Edit)
- [ ] Designs:
  - [ ] `stitch_home_page_customer_view/product_form_(create)_-_manager_view/`
  - [ ] `stitch_home_page_customer_view/product_form_(edit)_-_manager_view/`
- [ ] APIs:
  - [ ] `POST /products/`
  - [ ] `PATCH /products/{id}`
- [ ] Features:
  - [ ] Product info form
  - [ ] Image upload
  - [ ] Category/brand selection
  - [ ] Pricing fields
  - [ ] Stock settings
  - [ ] SEO fields

### 6.9 Reports
- [ ] Designs:
  - [ ] `stitch_home_page_customer_view/sales_report_-_manager/`
  - [ ] `stitch_home_page_customer_view/category_report_-_manager/`
  - [ ] `stitch_home_page_customer_view/inventory_value_report_-_manager/`
  - [ ] `stitch_home_page_customer_view/top_products_report_-_manager/`
- [ ] APIs:
  - [ ] `GET /reports/sales`
  - [ ] `GET /reports/categories`
  - [ ] `GET /reports/inventory-value`
  - [ ] `GET /reports/top-products`

---

## Phase 7: Admin Dashboard

### 7.1 Admin Dashboard
- [ ] Design: `stitch_home_page_customer_view/admin_dashboard_-_admin_view/`
- [ ] Features:
  - [ ] System overview KPIs
  - [ ] User statistics
  - [ ] Quick actions

### 7.2 Users Management
- [ ] Design: `stitch_home_page_customer_view/users_list_-_admin_view/`
- [ ] APIs:
  - [ ] `GET /users/`
  - [ ] `GET /users/roles`
- [ ] Features:
  - [ ] Users table
  - [ ] Role filter
  - [ ] Search
  - [ ] Add user button

### 7.3 User Detail
- [ ] Design: `stitch_home_page_customer_view/user_detail_-_admin_view/`
- [ ] APIs:
  - [ ] `GET /users/{id}`
  - [ ] `PATCH /users/{id}/role`
  - [ ] `DELETE /users/{id}`
- [ ] Features:
  - [ ] User info display
  - [ ] Role change dropdown
  - [ ] Delete user button

### 7.4 User Form (Create/Edit)
- [ ] Designs:
  - [ ] `stitch_home_page_customer_view/user_form_(create)_-_admin_view/`
  - [ ] `stitch_home_page_customer_view/user_form_(edit)_-_admin_view/`
- [ ] API: `POST /users/`
- [ ] Features:
  - [ ] User info form
  - [ ] Role selection
  - [ ] Password field (create only)

### 7.5 Settings Pages
- [ ] Designs:
  - [ ] `stitch_home_page_customer_view/general_settings_-_admin_view/`
  - [ ] `stitch_home_page_customer_view/shipping_settings_-_admin_view/`
  - [ ] `stitch_home_page_customer_view/tax_settings_-_admin_view/`
  - [ ] `stitch_home_page_customer_view/integration_settings_-_admin_view/`
- [ ] APIs:
  - [ ] `GET /settings/`
  - [ ] `PATCH /settings/{key}`
  - [ ] `POST /settings/bulk`

### 7.6 Audit Log
- [ ] Design: `stitch_home_page_customer_view/audit_log_-_admin_view/`
- [ ] APIs:
  - [ ] `GET /audit/`
  - [ ] `GET /audit/statistics`
- [ ] Features:
  - [ ] Audit log table
  - [ ] Filter by action type
  - [ ] Date range filter
  - [ ] Search by user
  - [ ] Export functionality

### 7.7 Affiliates Management
- [ ] Designs:
  - [ ] `stitch_home_page_customer_view/affiliates_management_-_admin_view/`
  - [ ] `stitch_home_page_customer_view/affiliate_detail_-_admin_view/`
- [ ] APIs:
  - [ ] `GET /dropship/affiliates`
  - [ ] `GET /dropship/affiliates/{id}`

### 7.8 GMV Report
- [ ] Design: `stitch_home_page_customer_view/gmv_report_-_admin_view/`
- [ ] APIs:
  - [ ] `GET /reports/gmv`
  - [ ] `GET /reports/gmv/daily`

---

## Shared Components Needed

### Already Created (Primitives)
- [x] Button
- [x] Input
- [x] Select
- [x] Checkbox
- [x] RadioGroup
- [x] Card
- [x] Modal
- [x] Table
- [x] Tabs
- [x] Badge
- [x] Alert
- [x] Avatar
- [x] Breadcrumbs
- [x] Skeleton
- [x] Spinner
- [x] Tooltip
- [x] QuantitySelector
- [x] ProductDisplay

### Need to Create
- [ ] AddressCard (reusable address display)
- [ ] AddressForm (reusable address input)
- [ ] OrderCard (reusable order summary)
- [ ] OrderStatusBadge (status with colors)
- [ ] ProductCard (standardized product card)
- [ ] PriceDisplay (price with compare-at)
- [ ] StockIndicator (stock level display)
- [ ] VehicleSelector (Year/Make/Model)
- [ ] FilterSidebar (reusable filters panel)
- [ ] SortDropdown (reusable sort control)
- [ ] Pagination (reusable pagination)
- [ ] EmptyState (reusable empty states)
- [ ] ConfirmDialog (reusable confirmation modal)
- [ ] DataTable (reusable data table with sorting/filtering)
- [ ] FormField (label + input + error wrapper)
- [ ] StatCard (KPI display card)
- [ ] Timeline (order/audit timeline)

---

## API Services Status

### Created
- [x] api.ts (base axios config)
- [x] authService.ts
- [x] cartService.ts
- [x] catalogService.ts
- [x] orderService.ts
- [x] userService.ts

### Need to Create/Update
- [ ] inventoryService.ts
- [ ] reportService.ts
- [ ] settingsService.ts
- [ ] auditService.ts
- [ ] dropshipService.ts

---

## Current Priority: Phase 1 - Authentication

Starting with Login Page as the first complete feature.
