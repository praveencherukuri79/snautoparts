import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { Product } from './catalog.service';

export interface CartProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  imageUrl?: string;
  price: number;
  stockQuantity: number;
}

export interface CartItem {
  id: string;
  product: CartProduct;
  quantity: number;
  unitPrice: number;
}

export interface Cart {
  id?: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private api = inject(ApiService);

  private cart = signal<Cart | null>(null);
  private loading = signal(false);

  readonly cartData = this.cart.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly items = computed(() => this.cart()?.items ?? []);
  readonly itemCount = computed(() => this.cart()?.itemCount ?? 0);
  readonly subtotal = computed(() => this.cart()?.subtotal ?? 0);

  async loadCart(): Promise<void> {
    this.loading.set(true);
    try {
      const cart = await this.api.get<Cart>('/cart');
      this.cart.set(cart);
    } finally {
      this.loading.set(false);
    }
  }

  async getCart(): Promise<Cart> {
    await this.loadCart();
    return this.cart() ?? { items: [], subtotal: 0, itemCount: 0 };
  }

  async addItem(productId: string, quantity = 1): Promise<void> {
    await this.api.post('/cart/items', { productId, quantity });
    await this.loadCart();
  }

  async updateQuantity(itemId: string, quantity: number): Promise<void> {
    await this.api.patch(`/cart/items/${itemId}`, { quantity });
    await this.loadCart();
  }

  async updateItem(itemId: string, quantity: number): Promise<void> {
    return this.updateQuantity(itemId, quantity);
  }

  async removeItem(itemId: string): Promise<void> {
    await this.api.delete(`/cart/items/${itemId}`);
    await this.loadCart();
  }

  async clearCart(): Promise<void> {
    await this.api.delete('/cart');
    this.cart.set({ items: [], subtotal: 0, itemCount: 0 });
  }

  async getItemCount(): Promise<number> {
    const response = await this.api.get<{ count: number }>('/cart/count');
    return response.count;
  }
}

