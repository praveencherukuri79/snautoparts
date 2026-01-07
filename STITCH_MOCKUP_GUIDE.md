# SN Auto Parts — Mockup Design Guide with Google Stitch

> **Tool:** [Google Stitch](https://stitch.withgoogle.com/)  
> **Purpose:** Generate UI mockups and prototypes using AI-assisted design

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Design Workflow](#design-workflow)
4. [Page Mockups to Create](#page-mockups-to-create)
5. [Prompt Templates](#prompt-templates)
6. [Export & Handoff](#export--handoff)
7. [Design System Reference](#design-system-reference)

---

## Overview

Google Stitch is an AI-powered design tool that generates UI mockups from text prompts. We use it to rapidly prototype screens for the SN Auto Parts e-commerce platform before implementation.

### Why Stitch?

- **Speed** — Generate complete page layouts in seconds
- **Iteration** — Quickly explore multiple design directions
- **Consistency** — Reference existing designs to maintain visual coherence
- **Export** — Get production-ready HTML/CSS output

---

## Getting Started

### Access

1. Navigate to [https://stitch.withgoogle.com/](https://stitch.withgoogle.com/)
2. Sign in with your Google account
3. Create a new project: "SN Auto Parts"

### Project Setup

Create folders to organize mockups:

```
SN Auto Parts/
├── Customer/
│   ├── Home
│   ├── Product Listing
│   ├── Product Detail
│   ├── Cart
│   ├── Checkout
│   └── Account
├── Manager/
│   ├── Dashboard
│   ├── Orders
│   ├── Inventory
│   └── Products
├── Admin/
│   ├── Users
│   ├── Settings
│   └── Audit
└── Components/
    ├── Header
    ├── Footer
    ├── Product Card
    └── Forms
```

---

## Design Workflow

### Step 1: Define the Screen

Before generating, document:
- **Screen name** (e.g., "Product Listing Page")
- **User role** (Customer, Manager, Admin)
- **Key features** (filters, search, pagination)
- **Data to display** (product cards, prices, stock)

### Step 2: Write the Prompt

Use detailed prompts that include:
- Layout structure
- Color scheme
- Component types
- Functionality hints

### Step 3: Generate & Iterate

1. Generate initial mockup
2. Review and note issues
3. Refine prompt or edit directly
4. Generate variations
5. Select best version

### Step 4: Export

- Export as HTML for developer reference
- Screenshot for documentation
- Save to project folder

---

## Page Mockups to Create

### Customer-Facing Pages (Public)

| Page | Priority | Status | Notes |
|------|----------|--------|-------|
| Home Page | P0 | ⏳ TODO | Hero, fitment selector, featured products, categories |
| Category Listing | P0 | ⏳ TODO | Category cards grid, breadcrumb |
| Product Listing (Grid) | P0 | ⏳ TODO | Filters sidebar, sort, pagination |
| Product Listing (with Fitment Filter) | P0 | ⏳ TODO | Year/Make/Model active filter bar |
| Product Detail | P0 | ⏳ TODO | Images, specs, fitment table, reviews |
| Shopping Cart | P0 | ⏳ TODO | Items table, summary, empty state |
| Checkout - Shipping Address | P0 | ⏳ TODO | Address form, saved addresses |
| Checkout - Shipping Method | P0 | ⏳ TODO | Shipping options with prices |
| Checkout - Payment | P0 | ⏳ TODO | Card form, billing address |
| Checkout - Review & Confirm | P0 | ⏳ TODO | Order summary, place order |
| Order Confirmation | P0 | ⏳ TODO | Thank you, order number, email sent |
| Order Tracking (Public) | P1 | ⏳ TODO | Track by order number (no login) |

### Authentication Pages

| Page | Priority | Status | Notes |
|------|----------|--------|-------|
| Login | P0 | ⏳ TODO | Email/password, social login, forgot link |
| Register | P0 | ⏳ TODO | Registration form with validation |
| Forgot Password | P1 | ⏳ TODO | Email input, success message |
| Reset Password | P1 | ⏳ TODO | New password form |

### Customer Account Pages

| Page | Priority | Status | Notes |
|------|----------|--------|-------|
| Customer Dashboard | P1 | ⏳ TODO | Welcome, recent orders, saved vehicles |
| Account - Profile | P1 | ⏳ TODO | Edit name, email, phone, password |
| Account - Addresses | P1 | ⏳ TODO | Address list, add/edit modal, set default |
| Account - Saved Vehicles | P1 | ⏳ TODO | Vehicle list, add modal, set default |
| Order History | P1 | ⏳ TODO | Orders table with status, pagination |
| Order Detail (Customer) | P1 | ⏳ TODO | Items, timeline, tracking info |

### Manager Dashboard Pages

| Page | Priority | Status | Notes |
|------|----------|--------|-------|
| Operations Dashboard | P1 | ⏳ TODO | Stats cards, charts, pending orders |
| Orders List (All) | P1 | ⏳ TODO | Filters, status badges, bulk actions |
| Order Detail (Manager) | P1 | ⏳ TODO | Update status, timeline, notes |
| Order Statistics | P2 | ⏳ TODO | Charts, date range picker |

### Inventory Management Pages

| Page | Priority | Status | Notes |
|------|----------|--------|-------|
| Inventory List | P1 | ⏳ TODO | Stock levels, search, filters |
| Inventory Detail | P2 | ⏳ TODO | Product stock info, history |
| Inventory Adjustments | P1 | ⏳ TODO | Adjustment form modal |
| Inventory Import (XLSX) | P2 | ⏳ TODO | File upload, preview, confirm |
| Low Stock Alerts | P1 | ⏳ TODO | Alert list with thresholds |

### Product Management Pages

| Page | Priority | Status | Notes |
|------|----------|--------|-------|
| Products List | P1 | ⏳ TODO | Editable grid, search, filters |
| Product Form (Create) | P1 | ⏳ TODO | All product fields, category, brand |
| Product Form (Edit) | P1 | ⏳ TODO | Same as create with existing data |
| Fitment Editor | P2 | ⏳ TODO | Add/remove vehicle fitments |
| Image Manager | P2 | ⏳ TODO | Upload, reorder, delete images |

### Drop-Ship Management Pages (Manager/Admin Only — Internal)

> ⚠️ **Important:** Supplier names (A-Premium, BuyAutoParts, TRQ) are **internal only**.  
> **Customers never see supplier info** — they only see their order.  
> These screens are for operations staff to manage fulfillment behind the scenes.

| Page | Priority | Status | Notes |
|------|----------|--------|-------|
| Affiliate Orders List | P2 | ⏳ TODO | Internal view: status, supplier name, retry |
| Affiliate Order Detail | P2 | ⏳ TODO | Request/response payload, retry |
| Affiliates Management | P2 | ⏳ TODO | Supplier config (Admin only) |
| Affiliate Detail | P2 | ⏳ TODO | API config, product mappings |
| Product Mapping | P3 | ⏳ TODO | Map internal SKUs to supplier SKUs |

### Admin Pages

| Page | Priority | Status | Notes |
|------|----------|--------|-------|
| Admin Dashboard | P2 | ⏳ TODO | System stats, GMV, user activity |
| Users List | P2 | ⏳ TODO | User grid, role filter, status |
| User Form (Create) | P2 | ⏳ TODO | Create user with role |
| User Form (Edit) | P2 | ⏳ TODO | Edit user, change role |
| User Detail | P2 | ⏳ TODO | User info, orders, activity |

### Settings Pages

| Page | Priority | Status | Notes |
|------|----------|--------|-------|
| General Settings | P2 | ⏳ TODO | Store name, contact, timezone |
| Shipping Settings | P2 | ⏳ TODO | Shipping methods, rates |
| Tax Settings | P2 | ⏳ TODO | Tax rates by region |
| Integration Settings | P2 | ⏳ TODO | Stripe, Resend, supplier API keys |

### Audit & Compliance Pages

| Page | Priority | Status | Notes |
|------|----------|--------|-------|
| Audit Log | P2 | ⏳ TODO | Activity log, filters, export |
| Audit Statistics | P3 | ⏳ TODO | Charts by action type |

### Reports Pages

| Page | Priority | Status | Notes |
|------|----------|--------|-------|
| Sales Report | P2 | ⏳ TODO | Revenue by day/week, chart + table |
| Category Report | P2 | ⏳ TODO | Sales by category, pie chart |
| Inventory Value Report | P2 | ⏳ TODO | Stock value, cost vs retail |
| GMV Report (Admin) | P2 | ⏳ TODO | Gross merchandise value dashboard |
| Top Products Report | P3 | ⏳ TODO | Best sellers list |
| Low Performing Report | P3 | ⏳ TODO | Products with no sales |

### Shared Components

| Component | Priority | Status | Notes |
|-----------|----------|--------|-------|
| Header (Customer) | P0 | ⏳ TODO | Logo, search, nav, cart, account |
| Header (Dashboard) | P1 | ⏳ TODO | Simplified with user menu |
| Footer | P0 | ⏳ TODO | Links, newsletter, copyright |
| Sidebar (Dashboard) | P1 | ⏳ TODO | Navigation with badges |
| Product Card | P0 | ⏳ TODO | Image, name, price, add to cart |
| Search Dropdown | P1 | ⏳ TODO | Autocomplete with products |
| Fitment Selector | P0 | ⏳ TODO | Year/Make/Model dropdowns |
| Pagination | P1 | ⏳ TODO | Page numbers, prev/next |
| Data Table | P1 | ⏳ TODO | Sortable, selectable rows |
| Modal/Dialog | P1 | ⏳ TODO | Confirmation, forms |
| Toast Notifications | P1 | ⏳ TODO | Success, error, info |
| Empty State | P1 | ⏳ TODO | No results, empty cart |
| Loading Spinner | P1 | ⏳ TODO | Page and inline loading |
| Status Badge | P1 | ⏳ TODO | Order status, stock status |
| Form Field | P1 | ⏳ TODO | Input with label, error |

### Mobile Responsive Views

| Page | Priority | Status | Notes |
|------|----------|--------|-------|
| Home (Mobile) | P1 | ⏳ TODO | Stacked layout, hamburger menu |
| Product Listing (Mobile) | P1 | ⏳ TODO | Filter drawer, 2-column grid |
| Product Detail (Mobile) | P1 | ⏳ TODO | Sticky add to cart |
| Cart (Mobile) | P1 | ⏳ TODO | Full width items |
| Checkout (Mobile) | P1 | ⏳ TODO | Single column, collapsible summary |
| Dashboard (Mobile) | P2 | ⏳ TODO | Bottom nav or drawer |

---

**Total Pages: 65+**

---

## Role-Feature Coverage Matrix

Cross-reference to ensure all features have corresponding UI mockups:

### CUSTOMER Role

| Feature | UI Pages | Covered |
|---------|----------|---------|
| catalog.browse | Home, Category Listing, Product Listing | ✅ |
| catalog.search | Product Listing (search bar), Search Dropdown | ✅ |
| catalog.viewDetail | Product Detail | ✅ |
| catalog.fitmentFilter | Fitment Selector, Product Listing (with filter) | ✅ |
| cart.view | Shopping Cart | ✅ |
| cart.modify | Shopping Cart (qty, remove) | ✅ |
| cart.checkout | Checkout (4 steps) + Confirmation | ✅ |
| orders.viewOwn | Order History, Order Detail (Customer) | ✅ |
| profile | Account - Profile | ✅ |
| addresses | Account - Addresses | ✅ |
| savedVehicles | Account - Saved Vehicles | ✅ |

### MANAGER Role

| Feature | UI Pages | Covered |
|---------|----------|---------|
| orders.viewAll | Orders List (All) | ✅ |
| orders.updateStatus | Order Detail (Manager) | ✅ |
| orders.cancel | Order Detail (Manager) | ✅ |
| orders.viewStatistics | Order Statistics | ✅ |
| inventory.view | Inventory List | ✅ |
| inventory.adjust | Inventory Adjustments (modal) | ✅ |
| inventory.import | Inventory Import (XLSX) | ✅ |
| inventory.viewHistory | Inventory Detail | ✅ |
| inventory.viewAlerts | Low Stock Alerts | ✅ |
| products.create | Product Form (Create) | ✅ |
| products.update | Product Form (Edit), Products List | ✅ |
| products.delete | Products List (action) | ✅ |
| products.manageFitment | Fitment Editor | ✅ |
| products.manageImages | Image Manager | ✅ |
| dropship.viewOrders | Affiliate Orders List | ✅ |
| dropship.retryPush | Affiliate Order Detail | ✅ |
| reports.salesByDay | Sales Report | ✅ |
| reports.salesByCategory | Category Report | ✅ |
| reports.inventoryValue | Inventory Value Report | ✅ |
| dashboard | Operations Dashboard | ✅ |

### ADMIN Role (Manager features + below)

| Feature | UI Pages | Covered |
|---------|----------|---------|
| dropship.manageAffiliates | Affiliates Management, Affiliate Detail | ✅ |
| users.viewAll | Users List | ✅ |
| users.create | User Form (Create) | ✅ |
| users.updateRole | User Form (Edit) | ✅ |
| users.delete | Users List (action) | ✅ |
| settings.view | General, Shipping, Tax, Integration Settings | ✅ |
| settings.update | All Settings pages | ✅ |
| audit.view | Audit Log | ✅ |
| audit.export | Audit Log (export button) | ✅ |
| reports.gmv | GMV Report | ✅ |
| dashboard | Admin Dashboard | ✅ |

### Navigation Coverage by Role

| Nav Item | Customer | Manager | Admin | UI Page |
|----------|----------|---------|-------|---------|
| Home | ✅ | - | - | Home Page |
| Products | ✅ | ✅ | ✅ | Product Listing / Products List |
| Cart | ✅ | - | - | Shopping Cart |
| Dashboard | - | ✅ | ✅ | Operations/Admin Dashboard |
| Orders | ✅ (own) | ✅ (all) | ✅ (all) | Order History / Orders List |
| Inventory | - | ✅ | ✅ | Inventory List |
| Drop Ship | - | ✅ | ✅ | Affiliate Orders |
| Reports | - | ✅ | ✅ | Reports pages |
| Users | - | - | ✅ | Users List |
| Settings | - | - | ✅ | Settings pages |
| Affiliates | - | - | ✅ | Affiliates Management |
| Audit Log | - | - | ✅ | Audit Log |
| Profile | ✅ | ✅ | ✅ | Account - Profile |
| Addresses | ✅ | - | - | Account - Addresses |

**All features covered!** ✅

---

## Prompt Templates

### Home Page

```
Design an auto parts e-commerce home page with:

Header:
- Logo "SN Auto Parts" on the left
- Search bar in center with placeholder "Search parts by name, SKU, or vehicle..."
- Navigation: Home, Products, Categories, Deals
- Icons: Cart (with badge), Account dropdown
- Dark background (#1a1a2e)

Hero Section:
- Large hero image of auto parts
- Headline: "Quality Auto Parts You Can Trust"
- Subheadline: "Find the perfect parts for your vehicle with our extensive catalog"
- Two buttons: "Shop Now" (primary orange #f97316), "View Deals" (outline)

Vehicle Fitment Selector:
- Horizontal bar with 3 dropdowns: Year, Make, Model
- "Find Parts" button
- Text: "Select your vehicle for guaranteed fitment"

Featured Products:
- Section title: "Featured Products"
- Grid of 4 product cards
- Each card: image, product name, price, "Add to Cart" button, star rating

Categories Grid:
- Section title: "Shop by Category"
- 6 category cards with icons: Engine Parts, Brakes, Suspension, Electrical, Body Parts, Filters

Footer:
- 4 columns: Company, Support, Legal, Newsletter signup
- Dark background matching header

Style: Modern, professional, automotive theme with dark grays and orange accents
```

### Product Listing Page

```
Design an auto parts product listing page with:

Header: Same as home page (dark, logo, search, nav, cart)

Breadcrumb: Home > Category > Subcategory

Page Title: "Engine Parts" with product count "(234 products)"

Left Sidebar (250px):
- "Filters" heading with "Clear All" link
- Collapsible filter sections:
  - Category (checkboxes)
  - Brand (checkboxes with search)
  - Price Range (min/max inputs)
  - Availability (In Stock Only toggle)
- "Apply Filters" button

Main Content:
- Sort dropdown: "Sort by: Newest, Price Low-High, Price High-Low, Best Selling"
- View toggle: Grid / List icons
- Product grid (3 columns):
  - Product image
  - Product name
  - SKU in gray
  - Price (bold)
  - Original price with strikethrough if on sale
  - Stock status badge (green "In Stock" or red "Low Stock")
  - "Add to Cart" button
  - Quick view icon on hover

Pagination: Page numbers with Previous/Next

Style: Clean white background, cards with subtle shadows, orange accent buttons
```

### Product Detail Page

```
Design an auto parts product detail page with:

Header: Same as other pages

Breadcrumb: Home > Category > Subcategory > Product Name

Two-column layout:

Left Column (50%):
- Main product image (large)
- Thumbnail gallery below (4-5 images)
- Zoom on hover indicator

Right Column (50%):
- Product name (large heading)
- SKU: "SKU-12345" in gray
- Star rating with review count
- Price: "$149.99" large and bold
- Original price strikethrough if discounted
- Stock status: Green badge "In Stock" or "Only 3 left!"
- Quantity selector (minus, number, plus)
- "Add to Cart" button (large, orange)
- "Buy Now" button (outline)
- Shipping info: "Free shipping on orders over $75"

Tabs below:
- Description (active)
- Specifications (table format)
- Vehicle Compatibility (year/make/model table)
- Reviews (with rating breakdown)

Related Products section at bottom

Style: White background, plenty of whitespace, trust badges near add to cart
```

### Shopping Cart

```
Design a shopping cart page with:

Header: Same as other pages

Page Title: "Shopping Cart" with item count "(3 items)"

Two-column layout:

Left Column (65%):
- Cart items table:
  - Product image (thumbnail)
  - Product name and SKU
  - Unit price
  - Quantity selector
  - Line total
  - Remove button (trash icon)
- Each row with subtle border
- "Continue Shopping" link at bottom

Right Column (35%):
- Order Summary card with shadow:
  - Subtotal
  - Shipping: "Calculated at checkout" or amount
  - Tax: "Calculated at checkout"
  - Divider line
  - Order Total (large, bold)
  - "Proceed to Checkout" button (full width, orange)
  - Accepted payment icons (Visa, MC, Amex, PayPal)
  - "Secure checkout" text with lock icon

Empty cart state (alternative):
- Cart icon
- "Your cart is empty"
- "Continue Shopping" button

Style: Clean, minimal, focus on checkout CTA
```

### Checkout - Payment

```
Design a checkout payment step page with:

Header: Simplified checkout header with logo and "Secure Checkout" text

Progress steps bar: 
1. Shipping Address ✓
2. Shipping Method ✓  
3. Payment (active, highlighted)
4. Review

Two-column layout:

Left Column (60%):
- "Payment Information" heading
- Card payment form:
  - Card number input with card type icons
  - Expiry date (MM/YY) and CVC side by side
  - Cardholder name
- Billing address:
  - Checkbox: "Same as shipping address" (checked)
  - Address fields (hidden when checked)
- "Continue to Review" button
- "Back to Shipping" link
- Security badges: SSL, PCI Compliant

Right Column (40%):
- Order Summary (collapsible on mobile):
  - Item thumbnails with names and qty
  - Subtotal
  - Shipping (amount)
  - Tax (amount)
  - Total (large)
- Shipping to: Address preview
- Shipping method: Selected method

Style: Trust-focused, secure feeling, minimal distractions
```

### Manager Dashboard

```
Design a manager dashboard for an auto parts e-commerce backend:

Sidebar Navigation (dark, 250px):
- Logo "SN Auto Parts" with "Manager" badge
- Navigation items with icons:
  - Dashboard (active)
  - Orders (with pending count badge)
  - Inventory (with alert dot)
  - Products
  - Drop Ship
  - Reports
- Bottom: Profile avatar and logout

Main Content:

Top Stats Row (4 cards):
- Today's Orders: 24 (+12% vs yesterday)
- Pending Orders: 8 (orange highlight)
- Revenue Today: $4,521.00
- Low Stock Items: 12 (red highlight)

Charts Section (2 columns):
- Orders Chart: Line chart showing last 7 days
- Revenue Chart: Bar chart showing last 7 days

Recent Orders Table:
- Columns: Order #, Customer, Items, Total, Status, Date
- Status badges: Pending (yellow), Processing (blue), Shipped (green)
- "View All Orders" link

Low Stock Alerts:
- List of 5 products below threshold
- Product name, current stock, threshold
- "View Inventory" link

Style: Professional dashboard, dark sidebar, white content area, data-focused
```

### Inventory List (Manager)

```
Design an inventory management page:

Sidebar: Same as dashboard

Page Header:
- Title: "Inventory Management"
- Tabs: All Products | Low Stock | Out of Stock
- Search input: "Search by SKU or name..."
- Filters: Category dropdown, Brand dropdown
- "Import XLSX" button, "Export" button

Data Table:
- Columns:
  - Checkbox
  - Product Image (small)
  - Product Name
  - SKU
  - Category
  - Current Stock (number)
  - Low Stock Threshold
  - Status (badge: In Stock/Low/Out)
  - Last Updated
  - Actions (adjust, history icons)
- Sortable column headers
- Row hover highlight

Bulk Actions Bar (when items selected):
- "X items selected"
- "Adjust Stock" button
- "Export Selected" button

Pagination: Showing 1-20 of 234 items

Quick Adjust Modal (show as overlay):
- Product name
- Current stock: 5
- Adjustment type: Received/Sold/Returned/Damaged/Adjustment
- Quantity: +/- input
- Reason: text input
- "Save Adjustment" button

Style: Clean data table, easy to scan, actionable
```

### Category Listing Page

```
Design an auto parts category listing page:

Header: Same dark header with logo, search, nav, cart

Hero Banner:
- "Shop by Category" heading
- Subtitle: "Browse our extensive catalog of quality auto parts"

Category Grid (3 columns):
- 12 category cards
- Each card:
  - Category icon or image
  - Category name (e.g., "Engine Parts", "Brakes", "Suspension")
  - Product count (e.g., "234 products")
  - Hover effect with slight scale

Categories to include:
- Engine Parts
- Brakes & Rotors
- Suspension & Steering
- Electrical & Lighting
- Body & Exterior
- Filters & Fluids
- Exhaust Systems
- Cooling System
- Transmission
- Fuel System
- Interior Accessories
- Wheels & Tires

Footer: Same as home page

Style: Clean grid layout, consistent card styling, easy navigation
```

### Order History (Customer)

```
Design a customer order history page:

Header: Same customer header

Page Title: "Order History"

Tabs: All Orders | Processing | Shipped | Delivered

Orders List (cards or table):
Each order shows:
- Order number: "#ORD-2026-0042"
- Date: "January 5, 2026"
- Items count: "3 items"
- Total: "$247.99"
- Status badge: Pending (yellow), Processing (blue), Shipped (green), Delivered (gray)
- "View Details" link

Expandable order preview:
- Product thumbnails
- Product names
- Quantities

Empty state:
- Package icon
- "No orders yet"
- "Start Shopping" button

Pagination at bottom

Style: Clean list, clear status indicators, easy to scan
```

### Order Detail (Customer)

```
Design a customer order detail page:

Header: Customer header

Breadcrumb: Orders > Order #ORD-2026-0042

Order Header:
- Order number large
- Order date
- Status badge (large)

Order Timeline (vertical):
- Order Placed ✓ - Jan 5, 2026 2:30 PM
- Payment Confirmed ✓ - Jan 5, 2026 2:31 PM
- Processing ✓ - Jan 5, 2026 3:00 PM
- Shipped (current) - Jan 6, 2026 10:00 AM
- Delivered (pending) - Estimated Jan 8, 2026

Two columns:

Left Column:
- Items Ordered:
  - Product image, name, SKU
  - Quantity, unit price, line total
  - For each item

Right Column:
- Order Summary:
  - Subtotal
  - Shipping
  - Tax
  - Total (bold)
- Shipping Address card
- Shipping Method: "Standard Shipping"

Tracking Section (if shipped):
- Carrier: UPS
- Tracking Number: 1Z999AA10123456784 (link)
- "Track Package" button

Actions:
- "Need Help?" link
- "Reorder" button (if delivered)

Style: Clean timeline, clear information hierarchy
```

### Affiliate Orders (Internal — Manager/Admin Only)

```
Design a drop-ship affiliate orders management page (internal operations view - customers never see this):

Sidebar: Dark manager sidebar

Page Header:
- Title: "Drop-ship Orders"
- Tabs: All | Pending | Sent | Confirmed | Failed
- Filter: Supplier dropdown (A-Premium, BuyAutoParts, TRQ)
- Date range picker

Summary Cards:
- Pending: 5
- Awaiting Confirmation: 12
- Failed (needs retry): 3 (red)
- Confirmed Today: 24

Data Table:
Columns:
- Order # (link)
- Customer Order #
- Supplier (with logo/icon)
- Items
- Total
- Status (badge)
- External Order ID
- Created
- Actions

Status badges:
- PENDING (gray)
- SENT (blue)
- CONFIRMED (green)
- FAILED (red with retry icon)

Row actions:
- View details
- Retry (if failed)
- View request/response

Bulk actions:
- Retry all failed
- Export

Style: Data-focused, clear status, easy retry access
```

### Affiliate Order Detail (Internal — Manager/Admin Only)

```
Design a drop-ship affiliate order detail page (internal operations view):

Sidebar: Manager sidebar

Breadcrumb: Drop-ship > Orders > AFF-2026-0042

Header:
- Affiliate Order ID
- Status badge (large)
- Retry button (if failed)

Two columns:

Left Column:
- Customer Order Info:
  - Customer order number (link)
  - Customer name
  - Shipping address
  
- Order Items:
  - Product name
  - Internal SKU → Supplier SKU
  - Quantity
  - Price

- Timeline:
  - Created
  - Sent to supplier
  - Confirmed/Failed
  - Last retry attempt

Right Column:
- Supplier Info:
  - Supplier name (A-Premium)
  - External Order ID (if confirmed)
  - Estimated ship date

- Request Payload (collapsible JSON):
  - Show formatted JSON sent to supplier

- Response Payload (collapsible JSON):
  - Show formatted JSON response

- Error Details (if failed):
  - Error message
  - Retry count: 3 of 5
  - Next retry: in 15 minutes

Actions:
- Retry Now
- Cancel Order
- View Customer Order

Style: Technical but readable, JSON viewers, clear error display
```

### Settings - General

```
Design a general settings page for admin:

Sidebar: Admin sidebar with Settings active

Page Title: "Settings"

Settings Navigation (horizontal tabs or vertical list):
- General (active)
- Shipping
- Tax
- Integrations

General Settings Form:

Store Information Section:
- Store Name: text input
- Store Email: email input
- Support Phone: phone input
- Store Address: textarea

Business Settings:
- Currency: dropdown (USD, CAD)
- Timezone: dropdown
- Date Format: dropdown
- Weight Unit: dropdown (lb, kg)

Order Settings:
- Order Number Prefix: text (e.g., "ORD-")
- Low Stock Threshold (default): number input
- Cart Expiry Days: number input

Email Settings:
- From Name: text input
- Reply-To Email: email input

Save button at bottom

Style: Clean form layout, grouped sections, clear labels
```

### Settings - Integrations (Admin Only)

```
Design an integrations settings page for admin (internal use only - never shown to customers):

Settings tabs with Integrations active

Integrations Grid:

Payment - Stripe:
- Status: Connected (green badge)
- Last verified: Jan 5, 2026
- "Configure" button
- Fields (hidden by default):
  - Public Key
  - Secret Key (masked)
  - Webhook Secret (masked)

Email - Resend:
- Status: Connected
- "Configure" button

Suppliers Section:

A-Premium:
- Status: Active (green) / Inactive (gray)
- API URL: text input
- API Key: masked input
- Timeout: number input
- Test Connection button
- Enable/Disable toggle

BuyAutoParts:
- Same structure

TRQ:
- Same structure

"Add Supplier" button

Each integration card has:
- Logo/icon
- Name
- Status badge
- Configure/Connect button
- Test Connection button

Style: Card-based layout, clear connection status
```

### Reports - Sales Report

```
Design a sales report page:

Sidebar: Manager/Admin sidebar

Page Title: "Sales Report"

Date Range Controls:
- Preset buttons: Today, 7 Days, 30 Days, This Month, Custom
- Date pickers for custom range
- "Apply" button

Summary Cards:
- Total Revenue: $24,521.00
- Orders: 142
- Average Order Value: $172.68
- Compared to previous period: +12.5%

Main Chart:
- Line chart showing daily revenue
- X-axis: dates
- Y-axis: revenue
- Hover tooltips with exact values

Secondary Chart:
- Bar chart showing orders by day

Data Table:
Columns:
- Date
- Orders
- Revenue
- Avg Order Value
- Top Category

Export button: "Export CSV"

Style: Dashboard-style with charts, data-rich but scannable
```

### Reports - GMV Report (Admin)

```
Design a GMV (Gross Merchandise Value) dashboard:

Sidebar: Admin sidebar

Page Title: "GMV Dashboard"

Date Controls: Same as sales report

Hero Metrics (large cards):
- Total GMV: $1,245,678.00
- vs Last Period: +15.2%
- Projected Monthly: $1,450,000

Breakdown Cards:
- Local Inventory GMV: $845,000 (68%)
- Drop-ship GMV: $400,678 (32%)

Charts Section:

GMV Trend:
- Line chart: Last 12 months
- GMV by month

GMV by Channel:
- Pie chart: Inventory vs Drop-ship

GMV by Supplier:
- Bar chart: A-Premium, BuyAutoParts, TRQ

GMV by Category:
- Horizontal bar chart: Top 10 categories

Tables:

Top Products by GMV:
- Product name, units sold, GMV, % of total

Supplier Performance:
- Supplier, orders, GMV, avg order value, fulfillment rate

Style: Executive dashboard, big numbers, comparative data
```

### User Management

```
Design a user management page for admin:

Sidebar: Admin sidebar

Page Title: "Users & Roles"

Controls:
- Search: "Search by name or email..."
- Filter: Role dropdown (All, Customer, Manager, Admin)
- Filter: Status (Active, Inactive)
- "Add User" button

Stats:
- Total Users: 1,234
- Customers: 1,200
- Managers: 28
- Admins: 6

Data Table:
Columns:
- Checkbox
- Avatar
- Name
- Email
- Role (badge: Customer blue, Manager orange, Admin purple)
- Status (Active green, Inactive gray)
- Last Login
- Created
- Actions

Actions dropdown:
- View Profile
- Edit
- Change Role
- Deactivate
- Delete

Bulk actions:
- Deactivate Selected
- Export Selected

Add User Modal:
- First Name
- Last Name
- Email
- Phone
- Role dropdown
- Send invitation email checkbox
- "Create User" button

Style: Clean user grid, role differentiation, easy management
```

---

## Export & Handoff

### Exporting from Stitch

1. **HTML Export**
   - Click Export → HTML
   - Save to `approch1/stitch_snautoparts/[page_name]/code.html`

2. **Screenshot**
   - Take full-page screenshot
   - Save as `approch1/stitch_snautoparts/[page_name]/screen.png`

### Folder Structure for Exports

```
approch1/stitch_snautoparts/
├── home_page/
│   ├── code.html
│   └── screen.png
├── product_listing_page/
│   ├── code.html
│   └── screen.png
├── product_detail_page/
│   ├── code.html
│   └── screen.png
├── shopping_cart_page/
│   ├── code.html
│   └── screen.png
├── checkout_-_payment/
│   ├── code.html
│   └── screen.png
└── manager_orders_dashboard/
    ├── code.html
    └── screen.png
```

### Developer Handoff Notes

When exporting, include:
- Component breakdown
- Interactive states (hover, active, disabled)
- Responsive behavior notes
- Animation/transition suggestions

---

## Design System Reference

### Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary Orange | `#f97316` | CTAs, highlights |
| Dark Background | `#1a1a2e` | Header, footer, sidebar |
| Dark Surface | `#16213e` | Cards on dark |
| Light Background | `#ffffff` | Main content |
| Light Surface | `#f8fafc` | Alternate sections |
| Text Primary | `#1e293b` | Headings, body |
| Text Secondary | `#64748b` | Labels, hints |
| Success | `#22c55e` | In stock, success states |
| Warning | `#eab308` | Low stock, pending |
| Error | `#ef4444` | Out of stock, errors |

### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | System | 36px | Bold |
| H2 | System | 28px | Semibold |
| H3 | System | 22px | Semibold |
| Body | System | 16px | Regular |
| Small | System | 14px | Regular |
| Caption | System | 12px | Regular |

### Spacing

- Base unit: 4px
- Component padding: 16px
- Section padding: 32px
- Card gap: 24px

### Shadows

```css
/* Card shadow */
box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);

/* Elevated shadow */
box-shadow: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
```

---

## Tips for Better Results

1. **Be Specific** — Include exact text, colors, and layout details
2. **Reference Existing** — Mention "same header as home page"
3. **Include States** — Describe hover, active, empty, error states
4. **Specify Responsive** — Note mobile/tablet behavior if needed
5. **Iterate** — Generate 2-3 variations and combine best elements



*Last updated: January 2026*

