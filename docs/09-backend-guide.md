# 09. Backend Development Guide

Complete guide to backend development practices, patterns, and conventions for the SN Auto Parts Fastify application.

## Project Structure

```
backend/
├── src/
│   ├── index.ts                   # Application entry point
│   ├── config/                    # Configuration
│   │   └── index.ts
│   ├── plugins/                   # Fastify plugins
│   │   ├── auth.ts               # Authentication plugin
│   │   ├── prisma.ts             # Prisma plugin
│   │   └── error-handler.ts      # Error handling
│   ├── routes/                   # API routes
│   │   ├── public/               # Public routes
│   │   ├── customer/             # Customer routes
│   │   ├── manager/              # Manager routes
│   │   └── admin/                # Admin routes
│   ├── schemas/                   # Zod validation schemas
│   │   └── index.ts
│   └── services/                  # Business logic services
│       └── email.ts
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seed script
├── package.json
├── tsconfig.json
└── .env                          # Environment variables
```

---

## Route Organization

### Route Structure

Routes are organized by role/access level:

```typescript
// src/routes/customer/index.ts
import { FastifyInstance } from 'fastify';
import { cartRoutes } from './cart.js';
import { checkoutRoutes } from './checkout.js';
import { orderRoutes } from './orders.js';
import { profileRoutes } from './profile.js';

export const customerRoutes = async (fastify: FastifyInstance) => {
  // All customer routes require authentication
  fastify.addHook('preHandler', fastify.authenticate);
  
  await fastify.register(cartRoutes, { prefix: '/cart' });
  await fastify.register(checkoutRoutes, { prefix: '/checkout' });
  await fastify.register(orderRoutes, { prefix: '/orders' });
  await fastify.register(profileRoutes, { prefix: '/profile' });
};
```

### Route Handler Pattern

```typescript
// src/routes/customer/cart.ts
import { FastifyInstance, FastifyRequest } from 'fastify';
import { addToCartSchema } from '../../schemas/index.js';

export const cartRoutes = async (fastify: FastifyInstance) => {
  // GET /customer/cart
  fastify.get('/', async (request: FastifyRequest) => {
    const userId = request.user!.id;
    
    // Ensure cart exists
    let cart = await fastify.prisma.cart.findUnique({ 
      where: { userId } 
    });
    if (!cart) {
      cart = await fastify.prisma.cart.create({ data: { userId } });
    }
    
    // Get full cart with items
    const fullCart = await getFullCart(userId);
    return { data: fullCart };
  });
  
  // POST /customer/cart/items
  fastify.post('/items', async (request: FastifyRequest) => {
    const userId = request.user!.id;
    const data = addToCartSchema.parse(request.body);
    
    // Business logic...
    
    return { data: updatedCart };
  });
};
```

---

## Validation with Zod

### Schema Definition

```typescript
// src/schemas/index.ts
import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().int().positive('Quantity must be positive').default(1),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

### Route Usage

```typescript
fastify.post('/items', async (request: FastifyRequest) => {
  // Parse and validate request body
  const data = addToCartSchema.parse(request.body);
  
  // Parse and validate query params
  const pagination = paginationSchema.parse(request.query);
  
  // Parse and validate route params
  const { id } = idParamSchema.parse(request.params);
  
  // Use validated data...
});
```

### Error Handling

Zod automatically throws validation errors that are caught by the error handler:

```typescript
// Error handler converts Zod errors to 400 Bad Request
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Product ID is required"
}
```

---

## Database Access with Prisma

### Prisma Plugin

```typescript
// src/plugins/prisma.ts
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export const prismaPlugin = fp(async (fastify: FastifyInstance) => {
  const prisma = new PrismaClient();
  
  fastify.decorate('prisma', prisma);
  
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
});
```

### Query Patterns

**Simple Query:**
```typescript
const product = await fastify.prisma.product.findUnique({
  where: { id: productId },
});
```

**Query with Relations:**
```typescript
const order = await fastify.prisma.order.findUnique({
  where: { id: orderId },
  include: {
    items: {
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    },
    user: {
      select: {
        id: true,
        email: true,
        name: true,
      },
    },
  },
});
```

**Paginated Query:**
```typescript
const skip = (page - 1) * limit;

const [products, total] = await Promise.all([
  fastify.prisma.product.findMany({
    where: { isActive: true },
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  }),
  fastify.prisma.product.count({
    where: { isActive: true },
  }),
]);

return {
  data: products,
  meta: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
};
```

---

## Transactions

### Transaction Pattern

```typescript
// Order creation with transaction
const order = await fastify.prisma.$transaction(async (tx) => {
  // Create order
  const newOrder = await tx.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId,
      status: 'PENDING',
      items: {
        create: cart.items.map(item => ({
          productId: item.productId,
          sku: item.product.sku,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          totalPrice: Number(item.product.price) * item.quantity,
        })),
      },
    },
  });
  
  // Update inventory
  for (const item of cart.items) {
    await tx.product.update({
      where: { id: item.productId },
      data: {
        stockQuantity: { decrement: item.quantity },
      },
    });
    
    await tx.inventoryLog.create({
      data: {
        productId: item.productId,
        adjustmentType: 'SOLD',
        quantity: -item.quantity,
        previousQty: item.product.stockQuantity,
        newQty: item.product.stockQuantity - item.quantity,
        reason: `Sold via order ${newOrder.orderNumber}`,
        referenceId: newOrder.id,
      },
    });
  }
  
  // Clear cart
  await tx.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
  
  return newOrder;
});
```

**Benefits:**
- All operations succeed or all fail (atomicity)
- Prevents partial updates
- Ensures data consistency

---

## Authentication Plugin

### Plugin Implementation

```typescript
// src/plugins/auth.ts
import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (...roles: UserRole[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const authPlugin = fp(async (fastify: FastifyInstance) => {
  // Authenticate decorator
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies['auth-token'] || 
                  request.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }
    
    const session = await fastify.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    
    if (!session || session.expiresAt < new Date()) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid or expired session',
      });
    }
    
    request.user = session.user;
  });
  
  // Role requirement decorator
  fastify.decorate('requireRole', (...roles: UserRole[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      await fastify.authenticate(request, reply);
      
      if (!request.user) return;
      
      if (!roles.includes(request.user.role)) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Insufficient permissions',
        });
      }
    };
  });
});
```

### Usage in Routes

```typescript
// Require authentication
fastify.addHook('preHandler', fastify.authenticate);

// Require specific role
fastify.addHook('preHandler', fastify.requireRole('MANAGER', 'ADMIN'));
```

---

## Error Handling

### Error Handler Plugin

```typescript
// src/plugins/error-handler.ts
import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Log error
  request.log.error(error);
  
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error.errors[0].message,
      details: error.errors,
    });
  }
  
  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    if (error.code === 'P2002') {
      return reply.status(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: 'Resource already exists',
      });
    }
    if (error.code === 'P2025') {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Resource not found',
      });
    }
  }
  
  // Handle HTTP errors
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
    });
  }
  
  // Default error
  return reply.status(500).send({
    statusCode: 500,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
  });
};
```

### Using HTTP Errors

```typescript
import { FastifyInstance } from 'fastify';

fastify.get('/products/:id', async (request, reply) => {
  const product = await fastify.prisma.product.findUnique({
    where: { id: request.params.id },
  });
  
  if (!product) {
    return reply.status(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: 'Product not found',
    });
    // Or use fastify.httpErrors
    // return fastify.httpErrors.notFound('Product not found');
  }
  
  return { data: product };
});
```

---

## Logging with Pino

### Configuration

```typescript
// src/index.ts
import Fastify from 'fastify';

const fastify = Fastify({
  logger: {
    level: config.logLevel, // 'info', 'debug', 'warn', 'error'
    transport: config.isDev
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  },
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
});
```

### Logging in Routes

```typescript
fastify.post('/orders', async (request, reply) => {
  const userId = request.user!.id;
  
  request.log.info({ userId, action: 'create_order' }, 'Creating order');
  
  try {
    const order = await createOrder(userId, request.body);
    
    request.log.info(
      { userId, orderId: order.id, orderNumber: order.orderNumber },
      'Order created successfully'
    );
    
    return { data: order };
  } catch (error) {
    request.log.error({ userId, error }, 'Failed to create order');
    throw error;
  }
});
```

---

## Stripe Integration

### Payment Intent Creation

```typescript
import Stripe from 'stripe';
import { config } from '../config/index.js';

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2023-10-16',
});

fastify.post('/create-payment-intent', async (request, reply) => {
  const userId = request.user!.id;
  const { idempotencyKey } = request.body;
  
  // Calculate totals
  const subtotal = calculateSubtotal(cart);
  const shippingAmount = calculateShipping(subtotal);
  const taxAmount = calculateTax(subtotal);
  const totalAmount = Math.round((subtotal + shippingAmount + taxAmount) * 100);
  
  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: totalAmount,
      currency: 'usd',
      metadata: {
        userId,
        cartId: cart.id,
      },
      automatic_payment_methods: { enabled: true },
    },
    { idempotencyKey }
  );
  
  return {
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount / 100,
      subtotal,
      shippingAmount,
      taxAmount,
    },
  };
});
```

### Webhook Handling

```typescript
fastify.post('/webhooks/stripe', async (request, reply) => {
  const sig = request.headers['stripe-signature'];
  const body = request.rawBody;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      config.stripeWebhookSecret
    );
  } catch (err) {
    return reply.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle payment_intent.succeeded
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // Check if event already processed (idempotency)
    const existingEvent = await fastify.prisma.paymentEvent.findUnique({
      where: { stripeEventId: event.id },
    });
    
    if (existingEvent) {
      return reply.status(200).send({ received: true });
    }
    
    // Find order by payment intent ID
    const order = await fastify.prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    
    if (order) {
      // Update order status
      await fastify.prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'CAPTURED',
          timeline: {
            create: {
              status: 'CONFIRMED',
              message: 'Payment confirmed',
            },
          },
        },
      });
      
      // Create payment event
      await fastify.prisma.paymentEvent.create({
        data: {
          orderId: order.id,
          stripeEventId: event.id,
          eventType: event.type,
          data: event.data.object,
        },
      });
    }
  }
  
  return reply.status(200).send({ received: true });
});
```

---

## Email Integration (Resend)

### Email Service

```typescript
// src/services/email.ts
import { Resend } from 'resend';
import { config } from '../config/index.js';

const resend = new Resend(config.resendApiKey);

export async function sendOrderConfirmation(
  email: string,
  orderNumber: string,
  orderDetails: unknown
) {
  try {
    await resend.emails.send({
      from: config.emailFrom,
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <h1>Order Confirmed</h1>
        <p>Your order ${orderNumber} has been confirmed.</p>
        <!-- Order details -->
      `,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw - email failure shouldn't break order creation
  }
}
```

---

## Environment Configuration

### Configuration Module

```typescript
// src/config/index.ts
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  logLevel: process.env.LOG_LEVEL || 'info',
  
  databaseUrl: process.env.DATABASE_URL!,
  
  authSecret: process.env.AUTH_SECRET!,
  
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  
  resendApiKey: process.env.RESEND_API_KEY!,
  emailFrom: process.env.EMAIL_FROM!,
  
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
};
```

---

## Best Practices

### DO

- ✅ Use Zod for all validation
- ✅ Use Prisma transactions for multi-step operations
- ✅ Handle errors gracefully
- ✅ Log important operations
- ✅ Use type-safe Prisma queries
- ✅ Validate all inputs
- ✅ Use idempotency keys for critical operations
- ✅ Keep route handlers thin
- ✅ Extract business logic to services when complex
- ✅ Use async/await consistently

### DON'T

- ❌ Skip input validation
- ❌ Expose database errors to clients
- ❌ Log sensitive data (passwords, tokens)
- ❌ Use transactions unnecessarily
- ❌ Ignore error handling
- ❌ Hardcode configuration values
- ❌ Mix business logic in route handlers
- ❌ Use `any` types
- ❌ Skip authentication checks
- ❌ Create duplicate orders (use idempotency)

---

## Database Migrations

### Create Migration

```bash
npx prisma migrate dev --name add_product_fitments
```

### Apply Migrations

```bash
npx prisma migrate deploy
```

### Reset Database

```bash
npx prisma migrate reset
```

---

## Testing Considerations

### Unit Testing Route Handlers

```typescript
import { build } from './helper';
import { test } from 'tap';

test('GET /products', async (t) => {
  const app = await build(t);
  
  const response = await app.inject({
    method: 'GET',
    url: '/api/v1/public/catalog/products',
  });
  
  t.equal(response.statusCode, 200);
  const data = JSON.parse(response.body);
  t.ok(Array.isArray(data.data));
});
```

---

**Next:** [10. Deployment](10-deployment.md) | [Back to Index](README.md)

