import { EntityManager } from '@mikro-orm/core';
import { Cart, CartItem, Product, User } from '../entities/index.js';
import { NotFoundError, BadRequestError } from '../plugins/error-handler.js';

export interface CartData {
  id: string;
  items: CartItemData[];
  subtotal: string;
  itemCount: number;
}

export interface CartItemData {
  id: string;
  product: {
    id: string;
    sku: string;
    name: string;
    slug: string;
    price: string;
    imageUrl?: string;
    stockQuantity: number;
    stockStatus: string;
  };
  quantity: number;
  lineTotal: string;
}

export class CartService {
  constructor(private em: EntityManager) {}

  /**
   * Get or create cart for user
   */
  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.em.findOne(Cart, { user: userId }, { populate: ['items', 'items.product'] });

    if (!cart) {
      const user = await this.em.findOneOrFail(User, { id: userId });
      const newCart = new Cart();
      newCart.user = user;
      await this.em.persistAndFlush(newCart);
      // Re-fetch with populated items
      cart = await this.em.findOneOrFail(Cart, { id: newCart.id }, { populate: ['items', 'items.product'] });
    }

    return cart;
  }

  /**
   * Get cart data formatted for API response
   */
  async getCartData(userId: string): Promise<CartData> {
    const cart = await this.getOrCreateCart(userId);
    await this.em.populate(cart, ['items', 'items.product']);

    const items: CartItemData[] = [];
    let subtotal = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      const product = item.product;
      const price = parseFloat(product.price);
      const lineTotal = price * item.quantity;

      items.push({
        id: item.id,
        product: {
          id: product.id,
          sku: product.sku,
          name: product.name,
          slug: product.slug,
          price: product.price,
          imageUrl: product.imageUrl,
          stockQuantity: product.stockQuantity,
          stockStatus: product.stockStatus,
        },
        quantity: item.quantity,
        lineTotal: lineTotal.toFixed(2),
      });

      subtotal += lineTotal;
      itemCount += item.quantity;
    }

    return {
      id: cart.id,
      items,
      subtotal: subtotal.toFixed(2),
      itemCount,
    };
  }

  /**
   * Get cart item count
   */
  async getCartCount(userId: string): Promise<number> {
    const cart = await this.em.findOne(Cart, { user: userId }, { populate: ['items'] });
    if (!cart) return 0;

    return cart.items.getItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Add item to cart
   */
  async addItem(userId: string, productId: string, quantity: number): Promise<CartData> {
    // Validate product exists and is active
    const product = await this.em.findOne(Product, { id: productId, isActive: true });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check stock
    if (product.stockQuantity < quantity) {
      throw new BadRequestError('Insufficient stock', {
        available: product.stockQuantity,
        requested: quantity,
      });
    }

    const cart = await this.getOrCreateCart(userId);

    // Check if item already in cart
    let cartItem = await this.em.findOne(CartItem, { cart: cart.id, product: productId });

    if (cartItem) {
      // Update quantity
      const newQuantity = cartItem.quantity + quantity;
      if (product.stockQuantity < newQuantity) {
        throw new BadRequestError('Insufficient stock', {
          available: product.stockQuantity,
          requested: newQuantity,
        });
      }
      cartItem.quantity = newQuantity;
    } else {
      // Create new cart item
      cartItem = this.em.create(CartItem, {
        cart,
        product,
        quantity,
      });
      this.em.persist(cartItem);
    }

    await this.em.flush();
    return this.getCartData(userId);
  }

  /**
   * Update cart item quantity
   */
  async updateItem(userId: string, itemId: string, quantity: number): Promise<CartData> {
    const cart = await this.em.findOne(Cart, { user: userId });
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const cartItem = await this.em.findOne(
      CartItem,
      { id: itemId, cart: cart.id },
      { populate: ['product'] }
    );

    if (!cartItem) {
      throw new NotFoundError('Cart item not found');
    }

    // Check stock
    if (cartItem.product.stockQuantity < quantity) {
      throw new BadRequestError('Insufficient stock', {
        available: cartItem.product.stockQuantity,
        requested: quantity,
      });
    }

    cartItem.quantity = quantity;
    await this.em.flush();

    return this.getCartData(userId);
  }

  /**
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<CartData> {
    const cart = await this.em.findOne(Cart, { user: userId });
    if (!cart) {
      throw new NotFoundError('Cart not found');
    }

    const cartItem = await this.em.findOne(CartItem, { id: itemId, cart: cart.id });
    if (!cartItem) {
      throw new NotFoundError('Cart item not found');
    }

    await this.em.removeAndFlush(cartItem);
    return this.getCartData(userId);
  }

  /**
   * Clear cart
   */
  async clearCart(userId: string): Promise<void> {
    const cart = await this.em.findOne(Cart, { user: userId }, { populate: ['items'] });
    if (!cart) return;

    for (const item of cart.items) {
      this.em.remove(item);
    }

    await this.em.flush();
  }
}

/**
 * Factory function to create cart service
 */
export function createCartService(em: EntityManager): CartService {
  return new CartService(em);
}

