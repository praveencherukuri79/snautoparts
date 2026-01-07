# SN Auto Parts — Figma AI Mockup Guide

> **Source:** `SN_Auto_Parts_README_v2_inventory_dropship.md`

## Pages to Design

### Customer (Public)
- Home Page (hero, fitment selector, featured products)
- Category Listing
- Product Listing (filters, sort, grid)
- Product Detail (images, specs, fitment, reviews)
- Shopping Cart
- Checkout: Address → Shipping → Payment → Review → Confirmation
- Login / Register / Forgot Password
- Account: Profile, Addresses, Saved Vehicles
- Order History + Order Detail

### Manager (Operations)
- Operations Dashboard (stats, charts, pending orders)
- Orders List + Order Detail (update status)
- Inventory List + Adjustments + Import XLSX + Low Stock Alerts
- Products List + Create/Edit Form + Fitment Editor + Image Manager
- Drop-ship Orders (internal) + Retry failed
- Reports: Sales, Category, Inventory Value

### Admin (All Manager + below)
- Admin Dashboard (GMV, system stats)
- Users List + Create/Edit
- Settings: General, Shipping, Tax, Integrations
- Affiliates Management (internal supplier config)
- Audit Log

---

## Design System

| Token | Value |
|-------|-------|
| Primary | `#f97316` (orange) |
| Dark BG | `#1a1a2e` |
| Light BG | `#ffffff` |
| Text | `#1e293b` |
| Success | `#22c55e` |
| Warning | `#eab308` |
| Error | `#ef4444` |

**Typography:** System font, 16px base
**Spacing:** 4px base unit
**Radius:** 8px cards, 4px inputs

---

## Prompt Examples

**Home:**
```
Auto parts e-commerce home page. Dark header with logo "SN Auto Parts", search bar, nav (Home, Products, Cart). Hero with "Quality Auto Parts You Can Trust". Year/Make/Model fitment selector. Featured products grid. Orange accent #f97316.
```

**Product Listing:**
```
Product listing page for auto parts. Left sidebar with filters (category, brand, price, in-stock toggle). Main area: sort dropdown, 3-column product grid. Each card: image, name, SKU, price, stock badge, Add to Cart. Pagination.
```

**Manager Dashboard:**
```
Operations dashboard for auto parts store manager. Dark sidebar nav (Dashboard, Orders, Inventory, Products, Drop Ship, Reports). Main area: 4 stat cards (orders, pending, revenue, low stock), line chart for orders, recent orders table.
```

**Checkout Payment:**
```
Checkout payment step. Progress bar showing step 3 of 4. Left: card form (number, expiry, CVC), billing same as shipping checkbox. Right: order summary with items, totals. Trust badges. "Continue to Review" button.
```

---

## Components

- Header (customer) / Sidebar (dashboard)
- Footer
- Product Card
- Fitment Selector (3 dropdowns)
- Data Table (sortable, selectable)
- Status Badge (order status, stock status)
- Modal / Toast / Empty State

---

## Export

Save to: `approch1/figma_exports/[page_name]/`
- `design.fig` or screenshot
- Notes on states (hover, empty, error)

---

## Role Coverage ✓

| Role | Key Features |
|------|-------------|
| Customer | Catalog, Cart, Checkout, Orders (own), Profile |
| Manager | Orders (all), Inventory, Products, Drop-ship, Reports |
| Admin | + Users, Settings, Affiliates, Audit, GMV |

*Reference main README for full feature config and API specs.*

