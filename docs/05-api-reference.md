# 05. API Reference

Complete API endpoint documentation with request/response schemas, examples, and error codes.

## Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.snautoparts.com/api/v1
```

## Authentication

### Session-Based Authentication

Most endpoints require authentication via session token:

**Cookie Method (Preferred):**
```
Cookie: auth-token=<session-token>
```

**Header Method:**
```
Authorization: Bearer <session-token>
```

### Response Format

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
  "message": "Error message"
}
```

### Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request data or validation error |
| 401 | Unauthorized | Authentication required or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate email) |
| 500 | Internal Server Error | Server error |

---

## Public Routes (`/api/v1/public`)

### Catalog Endpoints

#### Get All Categories

**Endpoint:** `GET /public/catalog/categories`

**Authentication:** Not required

**Response:**
```json
{
  "data": [
    {
      "id": "clx123",
      "name": "Engine Parts",
      "slug": "engine-parts",
      "description": "Engine components and accessories",
      "imageUrl": "https://example.com/category.jpg",
      "parentId": null,
      "sortOrder": 1,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "products": 45
      }
    }
  ]
}
```

---

#### Get Category by Slug

**Endpoint:** `GET /public/catalog/categories/:slug`

**Authentication:** Not required

**Parameters:**
- `slug` (path) - Category slug

**Response:**
```json
{
  "data": {
    "id": "clx123",
    "name": "Engine Parts",
    "slug": "engine-parts",
    "description": "Engine components",
    "imageUrl": "https://example.com/category.jpg",
    "parentId": null,
    "sortOrder": 1,
    "isActive": true,
    "children": [
      {
        "id": "clx456",
        "name": "Oil Filters",
        "slug": "oil-filters"
      }
    ],
    "_count": {
      "products": 45
    }
  }
}
```

**Errors:**
- `404` - Category not found

---

#### Get All Brands

**Endpoint:** `GET /public/catalog/brands`

**Authentication:** Not required

**Response:**
```json
{
  "data": [
    {
      "id": "clx789",
      "name": "ACDelco",
      "slug": "acdelco",
      "logoUrl": "https://example.com/logo.jpg",
      "description": "ACDelco parts",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### Get Products

**Endpoint:** `GET /public/catalog/products`

**Authentication:** Not required

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20, max: 100) - Items per page
- `categoryId` (string, optional) - Filter by category
- `brandId` (string, optional) - Filter by brand
- `minPrice` (number, optional) - Minimum price
- `maxPrice` (number, optional) - Maximum price
- `inStock` (boolean, optional) - Filter in-stock only
- `featured` (boolean, optional) - Filter featured only
- `search` (string, optional) - Search query
- `sortBy` (enum, default: "newest") - Sort field
  - `price_asc` - Price low to high
  - `price_desc` - Price high to low
  - `name_asc` - Name A-Z
  - `name_desc` - Name Z-A
  - `newest` - Newest first
  - `bestselling` - Best selling

**Example Request:**
```
GET /public/catalog/products?page=1&limit=20&categoryId=clx123&minPrice=10&maxPrice=100&sortBy=price_asc
```

**Response:**
```json
{
  "data": [
    {
      "id": "clxabc",
      "sku": "AC-12345",
      "name": "Oil Filter",
      "slug": "oil-filter-ac-12345",
      "description": "High-quality oil filter",
      "shortDescription": "Premium oil filter",
      "price": "19.99",
      "compareAtPrice": "24.99",
      "categoryId": "clx123",
      "brandId": "clx789",
      "imageUrl": "https://example.com/product.jpg",
      "images": ["https://example.com/product1.jpg"],
      "stockQuantity": 50,
      "lowStockThreshold": 10,
      "isActive": true,
      "isFeatured": false,
      "category": {
        "id": "clx123",
        "name": "Engine Parts",
        "slug": "engine-parts"
      },
      "brand": {
        "id": "clx789",
        "name": "ACDelco",
        "slug": "acdelco"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

#### Get Featured Products

**Endpoint:** `GET /public/catalog/products/featured`

**Authentication:** Not required

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** Same format as Get Products

---

#### Get Product by Slug

**Endpoint:** `GET /public/catalog/products/:slug`

**Authentication:** Not required

**Parameters:**
- `slug` (path) - Product slug

**Response:**
```json
{
  "data": {
    "id": "clxabc",
    "sku": "AC-12345",
    "name": "Oil Filter",
    "slug": "oil-filter-ac-12345",
    "description": "Full product description",
    "shortDescription": "Short description",
    "price": "19.99",
    "compareAtPrice": "24.99",
    "categoryId": "clx123",
    "brandId": "clx789",
    "imageUrl": "https://example.com/product.jpg",
    "images": ["https://example.com/product1.jpg"],
    "stockQuantity": 50,
    "lowStockThreshold": 10,
    "isActive": true,
    "isFeatured": false,
    "category": {
      "id": "clx123",
      "name": "Engine Parts",
      "slug": "engine-parts"
    },
    "brand": {
      "id": "clx789",
      "name": "ACDelco",
      "slug": "acdelco"
    },
    "fitments": [
      {
        "id": "clxfit1",
        "yearStart": 2020,
        "yearEnd": 2024,
        "make": "Chevrolet",
        "model": "Silverado",
        "submodel": "1500",
        "engine": "5.3L V8"
      }
    ]
  }
}
```

**Errors:**
- `404` - Product not found

---

#### Search Products

**Endpoint:** `GET /public/catalog/search`

**Authentication:** Not required

**Query Parameters:**
- `q` (string, required, min: 2) - Search query
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** Same format as Get Products

---

### Auth Endpoints

#### Register

**Endpoint:** `POST /public/auth/register`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Validation:**
- `email` - Valid email address
- `password` - Minimum 8 characters
- `firstName` - Required, minimum 1 character
- `lastName` - Required, minimum 1 character
- `phone` - Optional

**Response:**
```json
{
  "data": {
    "user": {
      "id": "clxuser1",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CUSTOMER"
    },
    "token": "session-token-here"
  }
}
```

**Errors:**
- `409` - Email already exists

**Notes:**
- Sets `auth-token` cookie automatically
- Creates session with 30-day expiration

---

#### Login

**Endpoint:** `POST /public/auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": "clxuser1",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "CUSTOMER"
    },
    "token": "session-token-here"
  }
}
```

**Errors:**
- `401` - Invalid credentials

**Notes:**
- Sets `auth-token` cookie automatically

---

#### Logout

**Endpoint:** `POST /public/auth/logout`

**Authentication:** Required

**Response:**
```json
{
  "success": true
}
```

**Notes:**
- Invalidates session token
- Clears `auth-token` cookie

---

#### Get Current User

**Endpoint:** `GET /public/auth/me`

**Authentication:** Required

**Response:**
```json
{
  "data": {
    "id": "clxuser1",
    "email": "user@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "CUSTOMER",
    "image": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Forgot Password

**Endpoint:** `POST /public/auth/forgot-password`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

**Notes:**
- Creates verification token
- Sends password reset email (if email service configured)

---

#### Reset Password

**Endpoint:** `POST /public/auth/reset-password`

**Authentication:** Not required

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!"
}
```

**Validation:**
- `token` - Required
- `password` - Minimum 8 characters

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Errors:**
- `400` - Invalid or expired token

---

## Customer Routes (`/api/v1/customer`)

All customer routes require authentication.

### Cart Endpoints

#### Get Cart

**Endpoint:** `GET /customer/cart`

**Authentication:** Required

**Response:**
```json
{
  "data": {
    "id": "clxcart1",
    "userId": "clxuser1",
    "sessionId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "items": [
      {
        "id": "clxitem1",
        "cartId": "clxcart1",
        "productId": "clxabc",
        "quantity": 2,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "product": {
          "id": "clxabc",
          "sku": "AC-12345",
          "name": "Oil Filter",
          "slug": "oil-filter-ac-12345",
          "price": "19.99",
          "compareAtPrice": "24.99",
          "imageUrl": "https://example.com/product.jpg",
          "stockQuantity": 50
        }
      }
    ],
    "subtotal": 39.98,
    "itemCount": 2
  }
}
```

**Notes:**
- Cart is created automatically if it doesn't exist

---

#### Add Item to Cart

**Endpoint:** `POST /customer/cart/items`

**Authentication:** Required

**Request Body:**
```json
{
  "productId": "clxabc",
  "quantity": 2
}
```

**Validation:**
- `productId` - Required
- `quantity` - Required, positive integer

**Response:** Same as Get Cart

**Errors:**
- `404` - Product not found
- `400` - Insufficient stock

**Notes:**
- Upserts cart item (adds if new, increments if exists)
- Validates stock availability

---

#### Update Cart Item

**Endpoint:** `PATCH /customer/cart/items/:id`

**Authentication:** Required

**Parameters:**
- `id` (path) - Cart item ID

**Request Body:**
```json
{
  "quantity": 3
}
```

**Validation:**
- `quantity` - Required, integer >= 0 (0 removes item)

**Response:** Same as Get Cart

**Errors:**
- `404` - Cart item not found
- `400` - Insufficient stock

---

#### Remove Cart Item

**Endpoint:** `DELETE /customer/cart/items/:id`

**Authentication:** Required

**Parameters:**
- `id` (path) - Cart item ID

**Response:** Same as Get Cart

**Errors:**
- `404` - Cart item not found

---

#### Clear Cart

**Endpoint:** `DELETE /customer/cart`

**Authentication:** Required

**Response:**
```json
{
  "data": {
    "id": null,
    "items": [],
    "subtotal": 0,
    "itemCount": 0
  }
}
```

---

### Checkout Endpoints

#### Get Shipping Methods

**Endpoint:** `GET /customer/checkout/shipping-methods`

**Authentication:** Required

**Response:**
```json
{
  "data": [
    {
      "id": "standard",
      "name": "Standard Shipping",
      "description": "5-7 business days",
      "price": 9.99,
      "freeThreshold": 50
    },
    {
      "id": "express",
      "name": "Express Shipping",
      "description": "2-3 business days",
      "price": 19.99,
      "freeThreshold": null
    },
    {
      "id": "overnight",
      "name": "Overnight Shipping",
      "description": "Next business day",
      "price": 29.99,
      "freeThreshold": null
    }
  ]
}
```

---

#### Create Payment Intent

**Endpoint:** `POST /customer/checkout/create-payment-intent`

**Authentication:** Required

**Request Body:**
```json
{
  "idempotencyKey": "unique-key-12345"
}
```

**Validation:**
- `idempotencyKey` - Optional, but recommended

**Response:**
```json
{
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 59.97,
    "subtotal": 39.98,
    "shippingAmount": 9.99,
    "taxAmount": 9.99
  }
}
```

**Errors:**
- `400` - Cart is empty
- `400` - Insufficient stock

**Notes:**
- Calculates totals (subtotal + shipping + tax)
- Creates Stripe PaymentIntent
- Uses idempotency key to prevent duplicates
- Free shipping over $50

---

#### Create Order

**Endpoint:** `POST /customer/checkout/create-order`

**Authentication:** Required

**Request Body:**
```json
{
  "addressId": "clxaddr1",
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "street": "123 Main St",
    "apartment": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US",
    "phone": "+1234567890"
  },
  "shippingMethod": "standard",
  "paymentIntentId": "pi_xxx",
  "idempotencyKey": "unique-key-12345",
  "notes": "Please leave at front door"
}
```

**Validation:**
- `shippingMethod` - Required
- `addressId` or `shippingAddress` - Required
- `idempotencyKey` - Optional, but recommended for idempotency

**Response:**
```json
{
  "data": {
    "id": "clxorder1",
    "orderNumber": "SN-ABC123XYZ",
    "userId": "clxuser1",
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "subtotal": "39.98",
    "shippingAmount": "9.99",
    "taxAmount": "2.99",
    "totalAmount": "52.96",
    "shippingMethod": "standard",
    "items": [
      {
        "id": "clxoi1",
        "sku": "AC-12345",
        "name": "Oil Filter",
        "price": "19.99",
        "quantity": 2,
        "totalPrice": "39.98"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `400` - Cart is empty
- `400` - Shipping address required
- `409` - Order already exists (idempotency)

**Notes:**
- Creates order in transaction
- Updates inventory
- Creates inventory logs
- Clears cart
- Stores shipping address snapshot
- Idempotent with idempotency key

---

### Order Endpoints

#### Get Order History

**Endpoint:** `GET /customer/orders`

**Authentication:** Required

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:**
```json
{
  "data": [
    {
      "id": "clxorder1",
      "orderNumber": "SN-ABC123XYZ",
      "status": "SHIPPED",
      "paymentStatus": "CAPTURED",
      "totalAmount": "52.96",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "items": [
        {
          "id": "clxoi1",
          "sku": "AC-12345",
          "name": "Oil Filter",
          "quantity": 2,
          "totalPrice": "39.98",
          "product": {
            "id": "clxabc",
            "name": "Oil Filter",
            "imageUrl": "https://example.com/product.jpg",
            "slug": "oil-filter-ac-12345"
          }
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

**Notes:**
- Returns only orders for authenticated user

---

#### Get Order Details

**Endpoint:** `GET /customer/orders/:id`

**Authentication:** Required

**Parameters:**
- `id` (path) - Order ID or order number

**Response:**
```json
{
  "data": {
    "id": "clxorder1",
    "orderNumber": "SN-ABC123XYZ",
    "status": "SHIPPED",
    "paymentStatus": "CAPTURED",
    "subtotal": "39.98",
    "shippingAmount": "9.99",
    "taxAmount": "2.99",
    "totalAmount": "52.96",
    "shippingMethod": "standard",
    "trackingNumber": "1Z999AA10123456784",
    "shippingCarrier": "UPS",
    "items": [ ... ],
    "timeline": [
      {
        "id": "clxtl1",
        "status": "PENDING",
        "message": "Order placed",
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": "clxtl2",
        "status": "SHIPPED",
        "message": "Order shipped",
        "createdAt": "2024-01-02T00:00:00.000Z"
      }
    ]
  }
}
```

**Errors:**
- `404` - Order not found or not owned by user

---

#### Track Order

**Endpoint:** `GET /customer/orders/track/:orderNumber`

**Authentication:** Not required (public with order number)

**Parameters:**
- `orderNumber` (path) - Order number

**Response:**
```json
{
  "data": {
    "orderNumber": "SN-ABC123XYZ",
    "status": "SHIPPED",
    "shippingCarrier": "UPS",
    "trackingNumber": "1Z999AA10123456784",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "timeline": [ ... ]
  }
}
```

**Errors:**
- `404` - Order not found

---

### Profile Endpoints

#### Get Profile

**Endpoint:** `GET /customer/profile`

**Authentication:** Required

**Response:**
```json
{
  "data": {
    "id": "clxuser1",
    "email": "user@example.com",
    "name": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "role": "CUSTOMER",
    "image": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Update Profile

**Endpoint:** `PATCH /customer/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1987654321"
}
```

**Validation:**
- All fields optional
- `firstName` - Minimum 1 character if provided
- `lastName` - Minimum 1 character if provided

**Response:** Same as Get Profile

---

#### Get Addresses

**Endpoint:** `GET /customer/profile/addresses`

**Authentication:** Required

**Response:**
```json
{
  "data": [
    {
      "id": "clxaddr1",
      "userId": "clxuser1",
      "label": "Home",
      "firstName": "John",
      "lastName": "Doe",
      "street": "123 Main St",
      "apartment": "Apt 4B",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US",
      "phone": "+1234567890",
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### Create Address

**Endpoint:** `POST /customer/profile/addresses`

**Authentication:** Required

**Request Body:**
```json
{
  "label": "Work",
  "firstName": "John",
  "lastName": "Doe",
  "street": "456 Business Ave",
  "apartment": "Suite 200",
  "city": "New York",
  "state": "NY",
  "zipCode": "10002",
  "country": "US",
  "phone": "+1234567890",
  "isDefault": false
}
```

**Response:** Address object

---

#### Update Address

**Endpoint:** `PATCH /customer/profile/addresses/:id`

**Authentication:** Required

**Parameters:**
- `id` (path) - Address ID

**Request Body:** Same as Create Address (all fields optional)

**Response:** Updated address object

**Errors:**
- `404` - Address not found or not owned by user

---

#### Delete Address

**Endpoint:** `DELETE /customer/profile/addresses/:id`

**Authentication:** Required

**Parameters:**
- `id` (path) - Address ID

**Response:**
```json
{
  "success": true
}
```

**Errors:**
- `404` - Address not found or not owned by user

---

## Manager Routes (`/api/v1/manager`)

All manager routes require MANAGER or ADMIN role.

### Order Management

#### List Orders

**Endpoint:** `GET /manager/orders`

**Authentication:** Required (MANAGER or ADMIN)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional) - Filter by status
- `search` (string, optional) - Search order number or customer
- `dateFrom` (string, optional) - Start date (ISO)
- `dateTo` (string, optional) - End date (ISO)

**Response:**
```json
{
  "data": [
    {
      "id": "clxorder1",
      "orderNumber": "SN-ABC123XYZ",
      "status": "SHIPPED",
      "totalAmount": "52.96",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "clxuser1",
        "name": "John Doe",
        "email": "user@example.com"
      },
      "_count": {
        "items": 2
      }
    }
  ],
  "meta": { ... }
}
```

---

#### Get Order Statistics

**Endpoint:** `GET /manager/orders/stats`

**Authentication:** Required (MANAGER or ADMIN)

**Response:**
```json
{
  "data": {
    "newOrders": 5,
    "pendingShipment": 12,
    "todaysVolume": 1250.50,
    "statusCounts": {
      "PENDING": 3,
      "CONFIRMED": 5,
      "PROCESSING": 4,
      "SHIPPED": 8,
      "DELIVERED": 20
    }
  }
}
```

---

#### Get Order Details

**Endpoint:** `GET /manager/orders/:id`

**Authentication:** Required (MANAGER or ADMIN)

**Response:** Complete order with user details, items, timeline, and payment events

---

#### Update Order Status

**Endpoint:** `PATCH /manager/orders/:id/status`

**Authentication:** Required (MANAGER or ADMIN)

**Request Body:**
```json
{
  "status": "SHIPPED",
  "trackingNumber": "1Z999AA10123456784",
  "shippingCarrier": "UPS",
  "notes": "Shipped via UPS Ground"
}
```

**Validation:**
- `status` - Required, valid OrderStatus enum
- `trackingNumber` - Optional
- `shippingCarrier` - Optional
- `notes` - Optional

**Response:** Updated order with timeline entry

**Notes:**
- Creates timeline entry
- Logs audit entry

---

#### Cancel Order

**Endpoint:** `POST /manager/orders/:id/cancel`

**Authentication:** Required (MANAGER or ADMIN)

**Response:** Updated order with status CANCELLED

**Notes:**
- Restores inventory
- Creates inventory logs
- Creates timeline entry
- Cannot cancel already cancelled/refunded orders

---

### Inventory Management

#### List Inventory

**Endpoint:** `GET /manager/inventory`

**Authentication:** Required (MANAGER or ADMIN)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `lowStock` (boolean, optional) - Filter low stock only
- `search` (string, optional) - Search name or SKU

**Response:**
```json
{
  "data": [
    {
      "id": "clxabc",
      "sku": "AC-12345",
      "name": "Oil Filter",
      "imageUrl": "https://example.com/product.jpg",
      "stockQuantity": 5,
      "lowStockThreshold": 10,
      "price": "19.99",
      "category": {
        "name": "Engine Parts"
      },
      "brand": {
        "name": "ACDelco"
      }
    }
  ],
  "meta": { ... }
}
```

---

#### Get Low Stock Alerts

**Endpoint:** `GET /manager/inventory/alerts`

**Authentication:** Required (MANAGER or ADMIN)

**Response:**
```json
{
  "data": [
    {
      "id": "clxabc",
      "sku": "AC-12345",
      "name": "Oil Filter",
      "stockQuantity": 5,
      "lowStockThreshold": 10
    }
  ]
}
```

---

#### Create Inventory Adjustment

**Endpoint:** `POST /manager/inventory/adjustments`

**Authentication:** Required (MANAGER or ADMIN)

**Request Body:**
```json
{
  "productId": "clxabc",
  "adjustmentType": "RECEIVED",
  "quantity": 50,
  "reason": "New stock received from supplier",
  "referenceId": "PO-12345"
}
```

**Validation:**
- `productId` - Required
- `adjustmentType` - Required, valid InventoryAdjustmentType enum
- `quantity` - Required, integer (can be negative)
- `reason` - Optional
- `referenceId` - Optional

**Response:**
```json
{
  "data": {
    "product": {
      "id": "clxabc",
      "stockQuantity": 55
    },
    "log": {
      "id": "clxlog1",
      "adjustmentType": "RECEIVED",
      "quantity": 50,
      "previousQty": 5,
      "newQty": 55,
      "reason": "New stock received",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Errors:**
- `404` - Product not found
- `400` - Resulting quantity cannot be negative

---

#### Get Inventory History

**Endpoint:** `GET /manager/inventory/:productId/history`

**Authentication:** Required (MANAGER or ADMIN)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** Paginated inventory log entries

---

### Product Management

#### List Products (Management View)

**Endpoint:** `GET /manager/products`

**Authentication:** Required (MANAGER or ADMIN)

**Query Parameters:** Same as public products endpoint

**Response:** Products with management fields (including inactive)

---

#### Create Product

**Endpoint:** `POST /manager/products`

**Authentication:** Required (MANAGER or ADMIN)

**Request Body:** Full product schema (see Product schema in schemas)

**Response:** Created product

**Errors:**
- `409` - SKU or slug already exists

---

#### Update Product

**Endpoint:** `PATCH /manager/products/:id`

**Authentication:** Required (MANAGER or ADMIN)

**Request Body:** Partial product schema

**Response:** Updated product

---

#### Delete Product

**Endpoint:** `DELETE /manager/products/:id`

**Authentication:** Required (MANAGER or ADMIN)

**Response:**
```json
{
  "success": true
}
```

---

## Admin Routes (`/api/v1/admin`)

All admin routes require ADMIN role.

### User Management

#### List Users

**Endpoint:** `GET /admin/users`

**Authentication:** Required (ADMIN)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `role` (string, optional) - Filter by role
- `search` (string, optional) - Search email or name

**Response:**
```json
{
  "data": [
    {
      "id": "clxuser1",
      "email": "user@example.com",
      "name": "John Doe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "CUSTOMER",
      "image": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastActive": "2024-01-15T00:00:00.000Z"
    }
  ],
  "meta": { ... }
}
```

---

#### Create User

**Endpoint:** `POST /admin/users`

**Authentication:** Required (ADMIN)

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "CUSTOMER"
}
```

**Validation:**
- `email` - Valid email, unique
- `password` - Minimum 8 characters
- `firstName` - Required
- `lastName` - Required
- `role` - Valid UserRole enum, default: CUSTOMER

**Response:** Created user

**Errors:**
- `409` - Email already exists

**Notes:**
- Creates user account
- Logs audit entry

---

#### Update User Role

**Endpoint:** `PATCH /admin/users/:id/role`

**Authentication:** Required (ADMIN)

**Request Body:**
```json
{
  "role": "MANAGER"
}
```

**Response:** Updated user

**Errors:**
- `404` - User not found
- `400` - Cannot demote yourself

**Notes:**
- Logs audit entry with old/new role

---

#### Delete User

**Endpoint:** `DELETE /admin/users/:id`

**Authentication:** Required (ADMIN)

**Response:**
```json
{
  "success": true
}
```

**Errors:**
- `404` - User not found
- `400` - Cannot delete yourself

**Notes:**
- Cascades to related data (sessions, addresses, etc.)
- Logs audit entry

---

### Settings Management

#### Get All Settings

**Endpoint:** `GET /admin/settings`

**Authentication:** Required (ADMIN)

**Query Parameters:**
- `category` (string, optional) - Filter by category

**Response:**
```json
{
  "data": {
    "taxRate": 0.075,
    "freeShippingThreshold": 50,
    "siteName": "SN Auto Parts"
  },
  "raw": [
    {
      "id": "clxset1",
      "key": "taxRate",
      "value": 0.075,
      "category": "general",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### Update Setting

**Endpoint:** `PUT /admin/settings/:key`

**Authentication:** Required (ADMIN)

**Request Body:**
```json
{
  "value": 0.08,
  "category": "general"
}
```

**Response:** Updated setting

**Notes:**
- Creates setting if doesn't exist
- Logs audit entry

---

#### Bulk Update Settings

**Endpoint:** `POST /admin/settings/bulk`

**Authentication:** Required (ADMIN)

**Request Body:**
```json
{
  "taxRate": 0.08,
  "freeShippingThreshold": 75,
  "siteName": "SN Auto Parts"
}
```

**Response:** Array of updated settings

---

### Audit Logs

#### Get Audit Logs

**Endpoint:** `GET /admin/audit`

**Authentication:** Required (ADMIN)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `userId` (string, optional) - Filter by user
- `action` (string, optional) - Filter by action
- `resource` (string, optional) - Filter by resource
- `dateFrom` (string, optional) - Start date
- `dateTo` (string, optional) - End date

**Response:**
```json
{
  "data": [
    {
      "id": "clxaudit1",
      "userId": "clxadmin1",
      "action": "UPDATE_USER_ROLE",
      "resource": "User",
      "resourceId": "clxuser1",
      "oldData": { "role": "CUSTOMER" },
      "newData": { "role": "MANAGER" },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "clxadmin1",
        "email": "admin@snautoparts.com",
        "name": "Admin User"
      }
    }
  ],
  "meta": { ... }
}
```

---

#### Get Audit Statistics

**Endpoint:** `GET /admin/audit/stats`

**Authentication:** Required (ADMIN)

**Response:**
```json
{
  "data": {
    "todayCount": 25,
    "weekCount": 150,
    "byAction": [
      { "action": "UPDATE_ORDER_STATUS", "count": 10 },
      { "action": "CREATE_USER", "count": 5 }
    ],
    "byResource": [
      { "resource": "Order", "count": 50 },
      { "resource": "User", "count": 20 }
    ]
  }
}
```

---

## Idempotency

### Checkout Idempotency

The checkout process uses idempotency keys to prevent duplicate orders:

1. **Payment Intent Creation:**
   - Include `idempotencyKey` in request
   - Stripe uses this key for idempotent payment intent creation

2. **Order Creation:**
   - Include `idempotencyKey` in request
   - Backend checks for existing order with same key
   - Returns existing order if found

**Best Practice:**
- Generate unique idempotency key per checkout attempt
- Use UUID or timestamp-based unique identifier
- Retry with same key if request fails

**Example:**
```typescript
const idempotencyKey = crypto.randomUUID();

// Create payment intent
await createPaymentIntent({ idempotencyKey });

// Create order (can retry safely)
await createOrder({ idempotencyKey, ... });
```

---

## Rate Limiting

Currently not implemented, but recommended for production:
- Auth endpoints: 5 requests per minute per IP
- API endpoints: 100 requests per minute per user
- Checkout endpoints: 10 requests per minute per user

---

**Next:** [06. User Flows](06-user-flows.md) | [Back to Index](README.md)

