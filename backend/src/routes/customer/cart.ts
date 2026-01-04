import { FastifyInstance, FastifyRequest } from 'fastify';
import { addToCartSchema, updateCartItemSchema, idParamSchema } from '../../schemas/index.js';

export const cartRoutes = async (fastify: FastifyInstance) => {
  // Helper to get full cart with totals
  const getFullCart = async (userId: string) => {
    const cart = await fastify.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                name: true,
                slug: true,
                price: true,
                compareAtPrice: true,
                imageUrl: true,
                stockQuantity: true,
              },
            },
          },
        },
      },
    });
    if (!cart) return null;
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );
    return {
      ...cart,
      subtotal,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    };
  };

  // Get cart
  fastify.get('/', async (request: FastifyRequest) => {
    const userId = request.user!.id;

    // Ensure cart exists
    let cart = await fastify.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      await fastify.prisma.cart.create({ data: { userId } });
    }

    const fullCart = await getFullCart(userId);
    return { data: fullCart };
  });

  // Add item to cart
  fastify.post('/items', async (request: FastifyRequest) => {
    const userId = request.user!.id;
    const data = addToCartSchema.parse(request.body);

    // Get or create cart
    let cart = await fastify.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await fastify.prisma.cart.create({ data: { userId } });
    }

    // Check product exists and has stock
    const product = await fastify.prisma.product.findUnique({
      where: { id: data.productId, isActive: true },
    });

    if (!product) {
      return fastify.httpErrors.notFound('Product not found');
    }

    if (product.stockQuantity < data.quantity) {
      return fastify.httpErrors.badRequest('Insufficient stock');
    }

    // Add or update cart item
    await fastify.prisma.cartItem.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId: data.productId },
      },
      update: {
        quantity: { increment: data.quantity },
      },
      create: {
        cartId: cart.id,
        productId: data.productId,
        quantity: data.quantity,
      },
    });

    // Return full cart
    const fullCart = await getFullCart(userId);
    return { data: fullCart };
  });

  // Update cart item quantity
  fastify.patch('/items/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const userId = request.user!.id;
    const { id } = idParamSchema.parse(request.params);
    const { quantity } = updateCartItemSchema.parse(request.body);

    const cart = await fastify.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return fastify.httpErrors.notFound('Cart not found');
    }

    const cartItem = await fastify.prisma.cartItem.findFirst({
      where: { id, cartId: cart.id },
      include: { product: true },
    });

    if (!cartItem) {
      return fastify.httpErrors.notFound('Cart item not found');
    }

    if (quantity === 0) {
      await fastify.prisma.cartItem.delete({ where: { id } });
    } else {
      if (cartItem.product.stockQuantity < quantity) {
        return fastify.httpErrors.badRequest('Insufficient stock');
      }

      await fastify.prisma.cartItem.update({
        where: { id },
        data: { quantity },
      });
    }

    // Return full cart
    const fullCart = await getFullCart(userId);
    return { data: fullCart };
  });

  // Remove item from cart
  fastify.delete('/items/:id', async (request: FastifyRequest<{ Params: { id: string } }>) => {
    const userId = request.user!.id;
    const { id } = idParamSchema.parse(request.params);

    const cart = await fastify.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      return fastify.httpErrors.notFound('Cart not found');
    }

    await fastify.prisma.cartItem.deleteMany({
      where: { id, cartId: cart.id },
    });

    // Return full cart
    const fullCart = await getFullCart(userId);
    return { data: fullCart };
  });

  // Clear cart
  fastify.delete('/', async (request: FastifyRequest) => {
    const userId = request.user!.id;

    await fastify.prisma.cartItem.deleteMany({
      where: { cart: { userId } },
    });

    // Return empty cart structure
    return { data: { id: null, items: [], subtotal: 0, itemCount: 0 } };
  });
};

