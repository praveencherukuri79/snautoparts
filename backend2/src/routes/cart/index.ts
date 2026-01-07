import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth, requireFeature } from '../../plugins/passport-auth.js';
import { createCartService } from '../../services/cart.service.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamSchema,
} from '../../schemas/cart.schema.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';

// ============================================================================
// Schemas
// ============================================================================

const CartItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  productName: z.string(),
  productSku: z.string(),
  productImageUrl: z.string().nullable(),
  quantity: z.number(),
  unitPrice: z.string(),
  totalPrice: z.string(),
});

const CartSchema = z.object({
  id: z.string().uuid(),
  items: z.array(CartItemSchema),
  itemCount: z.number(),
  subtotal: z.string(),
});

// ============================================================================
// Routes
// ============================================================================

export const cartRoutes: FastifyPluginAsync = async (fastify) => {
  // All cart routes require authentication and cart permissions
  fastify.addHook('preHandler', requireAuth);

  // GET /cart
  fastify.get('/', {
    preHandler: [requireFeature('cart.view')],
    schema: buildRouteSchema({
      summary: 'Get shopping cart',
      description: 'Returns the current user\'s shopping cart with all items',
      tags: ['Cart'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: CartSchema }),
      },
    }),
  }, async (request) => {
    const cartService = createCartService(request.em);
    const cartData = await cartService.getCartData(request.user!.id);
    return { data: cartData };
  });

  // GET /cart/count
  fastify.get('/count', {
    preHandler: [requireFeature('cart.view')],
    schema: buildRouteSchema({
      summary: 'Get cart item count',
      description: 'Returns the total number of items in the cart (for nav badge)',
      tags: ['Cart'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: z.object({ count: z.number() }) }),
      },
    }),
  }, async (request) => {
    const cartService = createCartService(request.em);
    const count = await cartService.getCartCount(request.user!.id);
    return { data: { count } };
  });

  // POST /cart/items
  fastify.post('/items', {
    preHandler: [requireFeature('cart.modify')],
    schema: buildRouteSchema({
      summary: 'Add item to cart',
      description: 'Add a product to the shopping cart',
      tags: ['Cart'],
      security: Security.authenticated,
      body: addToCartSchema,
      response: {
        200: z.object({ data: CartSchema }),
      },
    }),
  }, async (request) => {
    const input = addToCartSchema.parse(request.body);
    const cartService = createCartService(request.em);
    const cartData = await cartService.addItem(
      request.user!.id,
      input.productId,
      input.quantity,
    );
    return { data: cartData };
  });

  // PATCH /cart/items/:id
  fastify.patch<{ Params: { id: string } }>('/items/:id', {
    preHandler: [requireFeature('cart.modify')],
    schema: buildRouteSchema({
      summary: 'Update cart item quantity',
      description: 'Update the quantity of an item in the cart',
      tags: ['Cart'],
      security: Security.authenticated,
      params: cartItemParamSchema,
      body: updateCartItemSchema,
      response: {
        200: z.object({ data: CartSchema }),
      },
    }),
  }, async (request) => {
    const params = cartItemParamSchema.parse(request.params);
    const input = updateCartItemSchema.parse(request.body);
    const cartService = createCartService(request.em);
    const cartData = await cartService.updateItem(
      request.user!.id,
      params.id,
      input.quantity,
    );
    return { data: cartData };
  });

  // DELETE /cart/items/:id
  fastify.delete<{ Params: { id: string } }>('/items/:id', {
    preHandler: [requireFeature('cart.modify')],
    schema: buildRouteSchema({
      summary: 'Remove item from cart',
      description: 'Remove an item from the shopping cart',
      tags: ['Cart'],
      security: Security.authenticated,
      params: cartItemParamSchema,
      response: {
        200: z.object({ data: CartSchema }),
      },
    }),
  }, async (request) => {
    const params = cartItemParamSchema.parse(request.params);
    const cartService = createCartService(request.em);
    const cartData = await cartService.removeItem(request.user!.id, params.id);
    return { data: cartData };
  });

  // DELETE /cart
  fastify.delete('/', {
    preHandler: [requireFeature('cart.modify')],
    schema: buildRouteSchema({
      summary: 'Clear cart',
      description: 'Remove all items from the shopping cart',
      tags: ['Cart'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: z.object({ message: z.string() }) }),
      },
    }),
  }, async (request) => {
    const cartService = createCartService(request.em);
    await cartService.clearCart(request.user!.id);
    return { data: { message: 'Cart cleared' } };
  });
};
