# 07. Architecture Documentation

This document describes the system architecture, frontend/backend structure, and data flow patterns.

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser["Web Browser"]
    end
    
    subgraph Frontend["Frontend (Angular)"]
        Components["Components"]
        Services["Services"]
        Guards["Route Guards"]
        Interceptors["HTTP Interceptors"]
    end
    
    subgraph Backend["Backend (Fastify)"]
        Routes["API Routes"]
        Plugins["Plugins"]
        Services_BE["Business Logic"]
        Validation["Zod Validation"]
    end
    
    subgraph Database["Database (Postgres)"]
        Prisma["Prisma ORM"]
        Tables["Tables"]
    end
    
    subgraph External["External Services"]
        Stripe["Stripe Payments"]
        Resend["Resend Email"]
    end
    
    Browser -->|HTTP/HTTPS| Frontend
    Frontend -->|REST API| Backend
    Backend -->|Prisma Client| Prisma
    Prisma -->|SQL| Tables
    Backend -->|API| Stripe
    Backend -->|API| Resend
```

### Component Interaction

```mermaid
graph LR
    subgraph Frontend
        UI[UI Components]
        State[Signals State]
        API[API Service]
    end
    
    subgraph Backend
        Route[Route Handler]
        Service[Business Service]
        DB[(Database)]
    end
    
    UI -->|User Action| State
    State -->|API Call| API
    API -->|HTTP Request| Route
    Route -->|Validate| Route
    Route -->|Process| Service
    Service -->|Query| DB
    DB -->|Data| Service
    Service -->|Result| Route
    Route -->|Response| API
    API -->|Update| State
    State -->|Render| UI
```

---

## Frontend Architecture

### Component Structure

```
frontend/src/app/
├── core/                          # Core functionality
│   ├── constants/                # Constants
│   ├── content/                  # Centralized text content
│   ├── guards/                   # Route guards
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── interceptors/            # HTTP interceptors
│   │   ├── auth.interceptor.ts
│   │   └── error.interceptor.ts
│   ├── models/                   # TypeScript interfaces
│   │   ├── api.types.ts
│   │   ├── product.model.ts
│   │   ├── cart.model.ts
│   │   └── ...
│   └── services/                 # API services
│       ├── api.service.ts        # Base HTTP service
│       ├── auth.service.ts
│       ├── catalog.service.ts
│       ├── cart.service.ts
│       ├── checkout.service.ts
│       ├── order.service.ts
│       ├── admin.service.ts
│       └── mock-data.service.ts  # Mock data adapter
│
├── features/                     # Feature modules
│   ├── home/
│   ├── catalog/
│   │   ├── category-listing/
│   │   ├── product-listing/
│   │   └── product-detail/
│   ├── cart/
│   ├── checkout/
│   │   ├── checkout-address/
│   │   ├── checkout-shipping/
│   │   ├── checkout-review/
│   │   ├── checkout-payment/
│   │   └── checkout-confirmation/
│   ├── orders/
│   ├── account/
│   │   ├── profile/
│   │   └── addresses/
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── manager/
│   │   ├── orders-dashboard/
│   │   ├── order-detail/
│   │   ├── inventory-list/
│   │   └── inventory-adjustments/
│   └── admin/
│       ├── users-management/
│       ├── settings-management/
│       └── audit-logs/
│
└── shared/                       # Shared components
    ├── components/
    └── layouts/
```

### Frontend Data Flow

```mermaid
graph TD
    Component[Component] -->|Calls| Service[Service]
    Service -->|Checks| MockFlag{ENABLE_MOCK_DATA?}
    MockFlag -->|Yes| MockData[Mock Data Service]
    MockFlag -->|No| ApiService[API Service]
    ApiService -->|HTTP| Interceptor[Auth Interceptor]
    Interceptor -->|Add Token| Backend[Backend API]
    Backend -->|Response| Interceptor
    Interceptor -->|Handle Errors| ErrorInterceptor[Error Interceptor]
    ErrorInterceptor -->|Data| ApiService
    ApiService -->|Observable| Service
    MockData -->|Observable| Service
    Service -->|Update| Signal[Signal State]
    Signal -->|Computed| Component
    Component -->|Render| UI[UI]
```

### State Management Pattern

```mermaid
graph LR
    subgraph Service["Service Layer"]
        State[Private Signal]
        Public[Public Readonly Signal]
        Computed[Computed Signals]
    end
    
    subgraph Component["Component"]
        View[Template]
        Logic[Component Logic]
    end
    
    API[API Response] -->|Update| State
    State -->|Expose| Public
    State -->|Derive| Computed
    Public -->|Read| Logic
    Computed -->|Read| Logic
    Logic -->|Render| View
    View -->|User Action| Logic
    Logic -->|Call| API
```

**Example:**
```typescript
// Service
private cartState = signal<Cart | null>(null);
readonly cart = this.cartState.asReadonly();
readonly itemCount = computed(() => this.cartState()?.itemCount ?? 0);

// Component
readonly cart = this.cartService.cart;
readonly itemCount = this.cartService.itemCount;
```

---

## Backend Architecture

### Route Organization

```
backend/src/
├── index.ts                      # Application entry
├── config/                       # Configuration
│   └── index.ts
├── plugins/                      # Fastify plugins
│   ├── auth.ts                  # Authentication plugin
│   ├── prisma.ts                # Prisma plugin
│   └── error-handler.ts         # Error handling
├── routes/                       # API routes
│   ├── public/                  # Public routes
│   │   ├── index.ts
│   │   ├── catalog.ts
│   │   └── auth.ts
│   ├── customer/                # Customer routes
│   │   ├── index.ts
│   │   ├── cart.ts
│   │   ├── checkout.ts
│   │   ├── orders.ts
│   │   └── profile.ts
│   ├── manager/                 # Manager routes
│   │   ├── index.ts
│   │   ├── orders.ts
│   │   ├── inventory.ts
│   │   └── products.ts
│   └── admin/                   # Admin routes
│       ├── index.ts
│       ├── users.ts
│       ├── settings.ts
│       └── audit.ts
├── schemas/                      # Zod validation schemas
│   └── index.ts
└── services/                     # Business logic services
    └── email.ts
```

### Backend Request Flow

```mermaid
graph TD
    Request[HTTP Request] -->|Fastify| Route[Route Handler]
    Route -->|Hook| Auth[Auth Plugin]
    Auth -->|Validate| Session{Valid Session?}
    Session -->|No| Error401[401 Unauthorized]
    Session -->|Yes| Role{Role Check}
    Role -->|Insufficient| Error403[403 Forbidden]
    Role -->|Sufficient| Validate[Zod Validation]
    Validate -->|Invalid| Error400[400 Bad Request]
    Validate -->|Valid| Handler[Route Handler Logic]
    Handler -->|Query| Prisma[Prisma Client]
    Prisma -->|SQL| Database[(Postgres)]
    Database -->|Data| Prisma
    Prisma -->|Result| Handler
    Handler -->|Format| Response[HTTP Response]
    Response -->|JSON| Client[Client]
```

### Plugin System

```mermaid
graph LR
    subgraph Plugins["Fastify Plugins"]
        Auth[Auth Plugin]
        Prisma[Prisma Plugin]
        Error[Error Handler]
    end
    
    subgraph Routes["Routes"]
        Public[Public Routes]
        Customer[Customer Routes]
        Manager[Manager Routes]
        Admin[Admin Routes]
    end
    
    Auth -->|Authenticate| Customer
    Auth -->|Authenticate| Manager
    Auth -->|Authenticate| Admin
    Prisma -->|Database Access| Customer
    Prisma -->|Database Access| Manager
    Prisma -->|Database Access| Admin
    Error -->|Handle Errors| Customer
    Error -->|Handle Errors| Manager
    Error -->|Handle Errors| Admin
```

---

## Data Flow Patterns

### Read Operation Flow

```mermaid
sequenceDiagram
    participant Component
    participant Service
    participant API
    participant Backend
    participant Database

    Component->>Service: getProducts()
    Service->>API: GET /catalog/products
    API->>Backend: HTTP Request
    Backend->>Backend: Authenticate
    Backend->>Backend: Validate query params
    Backend->>Database: Prisma query
    Database-->>Backend: Products
    Backend->>Backend: Format response
    Backend-->>API: JSON response
    API-->>Service: Observable<Product[]>
    Service->>Service: Update signal
    Service-->>Component: Signal<Product[]>
    Component->>Component: Render UI
```

### Write Operation Flow

```mermaid
sequenceDiagram
    participant Component
    participant Service
    participant API
    participant Backend
    participant Database

    Component->>Service: addToCart(productId, quantity)
    Service->>API: POST /cart/items
    API->>Backend: HTTP Request + Body
    Backend->>Backend: Authenticate
    Backend->>Backend: Validate body (Zod)
    Backend->>Database: Begin transaction
    Backend->>Database: Upsert cart item
    Backend->>Database: Validate stock
    Backend->>Database: Commit transaction
    Database-->>Backend: Cart updated
    Backend->>Backend: Format response
    Backend-->>API: JSON response
    API-->>Service: Observable<Cart>
    Service->>Service: Update signal
    Service-->>Component: Signal<Cart>
    Component->>Component: Update UI
```

### Transaction Flow (Order Creation)

```mermaid
sequenceDiagram
    participant Backend
    participant Database

    Backend->>Database: Begin Transaction
    Backend->>Database: Create Order
    Backend->>Database: Create Order Items
    Backend->>Database: Update Inventory (for each item)
    Backend->>Database: Create Inventory Logs (for each item)
    Backend->>Database: Clear Cart Items
    alt All operations succeed
        Backend->>Database: Commit Transaction
        Database-->>Backend: Success
    else Any operation fails
        Backend->>Database: Rollback Transaction
        Database-->>Backend: Error
        Backend-->>Backend: Return error response
    end
```

---

## Authentication Flow

### Session-Based Authentication

```mermaid
graph TD
    Login[Login Request] -->|Email/Password| Verify[Verify Credentials]
    Verify -->|Valid| CreateSession[Create Session]
    CreateSession -->|Generate Token| StoreSession[Store in Database]
    StoreSession -->|Set Cookie| Response[Return Token]
    Response -->|Store Cookie| Client[Client Browser]
    
    Request[API Request] -->|Include Cookie| Validate[Validate Session]
    Validate -->|Check Token| DB[(Database)]
    DB -->|Token Valid| AttachUser[Attach User to Request]
    AttachUser -->|Process| Handler[Route Handler]
    DB -->|Token Invalid| Reject[401 Unauthorized]
```

### Authorization Flow

```mermaid
graph TD
    Request[API Request] -->|Auth Plugin| CheckAuth{Authenticated?}
    CheckAuth -->|No| Reject401[401 Unauthorized]
    CheckAuth -->|Yes| CheckRole{Role Required?}
    CheckRole -->|No| Allow[Allow Request]
    CheckRole -->|Yes| CheckUserRole{User Role Matches?}
    CheckUserRole -->|No| Reject403[403 Forbidden]
    CheckUserRole -->|Yes| Allow
```

---

## Payment Processing Flow

### Stripe Integration

```mermaid
sequenceDiagram
    participant Frontend
    participant Backend
    participant Stripe
    participant Database

    Frontend->>Backend: Create Payment Intent
    Backend->>Backend: Calculate totals
    Backend->>Database: Validate cart & stock
    Backend->>Stripe: Create PaymentIntent
    Stripe-->>Backend: PaymentIntent + clientSecret
    Backend-->>Frontend: clientSecret
    
    Frontend->>Stripe: Submit payment (Stripe Elements)
    Stripe->>Stripe: Process payment
    Stripe-->>Frontend: Payment result
    
    Frontend->>Backend: Create Order
    Backend->>Database: Create order (transaction)
    Backend-->>Frontend: Order created
    
    Stripe->>Backend: Webhook: payment_intent.succeeded
    Backend->>Database: Verify event not processed
    Backend->>Database: Update order status
    Backend->>Database: Create payment event
    Backend-->>Stripe: 200 OK
```

---

## Error Handling Flow

### Frontend Error Handling

```mermaid
graph TD
    Request[HTTP Request] -->|Error| Interceptor[Error Interceptor]
    Interceptor -->|Check Status| Status{Status Code}
    Status -->|401| ClearAuth[Clear Auth State]
    ClearAuth -->|Redirect| Login[Login Page]
    Status -->|403| ShowError[Show Permission Error]
    Status -->|404| Show404[Show Not Found]
    Status -->|500| Show500[Show Server Error]
    Status -->|Other| ShowGeneric[Show Generic Error]
    ShowError -->|User| User[User Sees Error]
    Show404 -->|User| User
    Show500 -->|User| User
    ShowGeneric -->|User| User
```

### Backend Error Handling

```mermaid
graph TD
    Handler[Route Handler] -->|Error| Catch[Catch Block]
    Catch -->|Check Type| Type{Error Type}
    Type -->|Validation| ZodError[Zod Validation Error]
    Type -->|Prisma| PrismaError[Prisma Error]
    Type -->|HTTP| HttpError[HTTP Error]
    Type -->|Other| Generic[Generic Error]
    
    ZodError -->|Format| Response400[400 Bad Request]
    PrismaError -->|Check| PrismaType{Error Type}
    PrismaType -->|NotFound| Response404[404 Not Found]
    PrismaType -->|Unique| Response409[409 Conflict]
    PrismaType -->|Other| Response500[500 Server Error]
    HttpError -->|Return| Response[HTTP Response]
    Generic -->|Log| Log[Log Error]
    Log -->|Return| Response500
    
    Response400 -->|Client| Client
    Response404 -->|Client| Client
    Response409 -->|Client| Client
    Response500 -->|Client| Client
```

---

## Database Access Pattern

### Prisma Query Pattern

```mermaid
graph LR
    Route[Route Handler] -->|Query| Prisma[Prisma Client]
    Prisma -->|SQL| DB[(Postgres)]
    DB -->|Data| Prisma
    Prisma -->|Typed Result| Route
    Route -->|Format| Response[API Response]
```

**Example:**
```typescript
// Route handler
const products = await fastify.prisma.product.findMany({
  where: { isActive: true },
  include: { category: true, brand: true },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit,
});
```

---

## Module Boundaries

### Clear Separation

```
┌─────────────────────────────────────────┐
│         Frontend (Angular)              │
│  ┌──────────┐  ┌──────────┐            │
│  │ Features │  │ Services │            │
│  └──────────┘  └──────────┘            │
│       │              │                  │
│       └──────┬───────┘                  │
│              │                          │
│         ┌────▼────┐                      │
│         │   API   │                      │
│         └────┬────┘                      │
└──────────────┼───────────────────────────┘
               │ HTTP/REST
┌──────────────┼───────────────────────────┐
│         ┌────▼────┐                      │
│         │ Routes  │                      │
│         └────┬────┘                      │
│              │                          │
│  ┌───────────┼───────────┐              │
│  │           │           │              │
│  ┌─▼──┐  ┌───▼───┐  ┌───▼──┐            │
│  │Auth│  │Plugin │  │Service│            │
│  └────┘  └───────┘  └──────┘            │
│              │                          │
│         ┌────▼────┐                      │
│         │ Prisma  │                      │
│         └────┬────┘                      │
└──────────────┼───────────────────────────┘
               │ SQL
┌──────────────┼───────────────────────────┐
│         ┌────▼────┐                      │
│         │ Postgres│                      │
│         └─────────┘                      │
└──────────────────────────────────────────┘
```

---

## Scalability Considerations

### Current Architecture

- **Monolith Backend:** Single Fastify application
- **Standalone Frontend:** Single Angular application
- **Database:** Single Postgres database

### Future Scalability Options

1. **Horizontal Scaling:**
   - Multiple backend instances behind load balancer
   - Stateless sessions (database-backed)
   - Shared database

2. **Database Optimization:**
   - Read replicas for read-heavy operations
   - Connection pooling
   - Query optimization

3. **Caching Layer:**
   - Redis for session storage
   - Cache frequently accessed data
   - CDN for static assets

4. **Microservices (if needed):**
   - Separate payment service
   - Separate email service
   - Separate inventory service

---

**Next:** [08. Frontend Guide](08-frontend-guide.md) | [Back to Index](README.md)

