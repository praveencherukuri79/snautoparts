import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable, tap, of, Subscription, map } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { environment } from '../../../environments/environment';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../models/cart.model';

const CART_KEY = 'sn_cart';

/** Raw cart response from backend (before transformation) */
interface BackendCartResponse {
  id: string;
  userId?: string | null;
  sessionId?: string | null;
  items: Array<{
    id: string;
    cartId?: string;
    productId: string;
    quantity: number;
    createdAt?: string;
    updatedAt?: string;
    product: {
      id: string;
      sku: string;
      name: string;
      slug: string;
      price: number | string;
      compareAtPrice?: number | string | null;
      imageUrl?: string | null;
      stockQuantity: number;
    };
  }>;
  subtotal: number;
  itemCount: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly api = inject(ApiService);
  private readonly mockData = inject(MockDataService);

  private readonly cartState = signal<Cart | null>(null);
  private readonly loadingState = signal<boolean>(false);
  private syncSubscription: Subscription | null = null;

  readonly cart = this.cartState.asReadonly();
  readonly isLoading = this.loadingState.asReadonly();
  readonly itemCount = computed(() => this.cartState()?.itemCount ?? 0);
  readonly subtotal = computed(() => this.cartState()?.subtotal ?? 0);
  readonly items = computed(() => this.cartState()?.items ?? []);
  readonly isEmpty = computed(() => this.itemCount() === 0);

  constructor() {
    this.loadCartFromStorage();
  }

  /**
   * Transform backend cart response to frontend Cart model
   * Computes price and total for each item
   */
  private transformCart(response: BackendCartResponse): Cart {
    const items: CartItem[] = response.items.map(item => {
      const unitPrice = typeof item.product.price === 'string' 
        ? parseFloat(item.product.price) 
        : item.product.price;
      return {
        ...item,
        price: unitPrice,
        total: unitPrice * item.quantity,
      };
    });
    
    return {
      id: response.id,
      userId: response.userId,
      sessionId: response.sessionId,
      items,
      subtotal: response.subtotal,
      itemCount: response.itemCount,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
    };
  }

  private loadCartFromStorage(): void {
    try {
      const cartJson = localStorage.getItem(CART_KEY);
      if (cartJson) {
        const cart = JSON.parse(cartJson) as Cart;
        this.cartState.set(cart);
      }
    } catch {
      localStorage.removeItem(CART_KEY);
    }
  }

  private saveCartToStorage(cart: Cart): void {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  /**
   * Sync cart with server - called after login
   */
  syncCart(): void {
    // Cancel any pending sync
    if (this.syncSubscription) {
      this.syncSubscription.unsubscribe();
    }
    this.syncSubscription = this.loadCart().subscribe();
  }

  loadCart(): Observable<Cart> {
    this.loadingState.set(true);
    
    if (environment.enableMockData) {
      return this.mockData.getCart().pipe(
        tap({
          next: (cart) => {
            this.cartState.set(cart);
            this.saveCartToStorage(cart);
            this.loadingState.set(false);
          },
          error: () => this.loadingState.set(false),
        })
      );
    }

    return this.api.get<BackendCartResponse>('/customer/cart').pipe(
      map(response => this.transformCart(response)),
      tap({
        next: (cart) => {
          this.cartState.set(cart);
          this.saveCartToStorage(cart);
          this.loadingState.set(false);
        },
        error: () => this.loadingState.set(false),
      })
    );
  }

  addToCart(request: AddToCartRequest): Observable<Cart> {
    this.loadingState.set(true);
    
    if (environment.enableMockData) {
      return this.mockData.addToCart(request).pipe(
        tap({
          next: (cart) => {
            this.cartState.set(cart);
            this.saveCartToStorage(cart);
            this.loadingState.set(false);
          },
          error: () => this.loadingState.set(false),
        })
      );
    }

    return this.api.post<BackendCartResponse>('/customer/cart/items', request).pipe(
      map(response => this.transformCart(response)),
      tap({
        next: (cart) => {
          this.cartState.set(cart);
          this.saveCartToStorage(cart);
          this.loadingState.set(false);
        },
        error: () => this.loadingState.set(false),
      })
    );
  }

  updateCartItem(itemId: string, request: UpdateCartItemRequest): Observable<Cart> {
    this.loadingState.set(true);
    
    if (environment.enableMockData) {
      return this.mockData.updateCartItem(itemId, request).pipe(
        tap({
          next: (cart) => {
            this.cartState.set(cart);
            this.saveCartToStorage(cart);
            this.loadingState.set(false);
          },
          error: () => this.loadingState.set(false),
        })
      );
    }

    return this.api.patch<BackendCartResponse>(`/customer/cart/items/${itemId}`, request).pipe(
      map(response => this.transformCart(response)),
      tap({
        next: (cart) => {
          this.cartState.set(cart);
          this.saveCartToStorage(cart);
          this.loadingState.set(false);
        },
        error: () => this.loadingState.set(false),
      })
    );
  }

  removeFromCart(itemId: string): Observable<Cart> {
    this.loadingState.set(true);
    
    if (environment.enableMockData) {
      return this.mockData.removeFromCart(itemId).pipe(
        tap({
          next: (cart) => {
            this.cartState.set(cart);
            this.saveCartToStorage(cart);
            this.loadingState.set(false);
          },
          error: () => this.loadingState.set(false),
        })
      );
    }

    return this.api.delete<BackendCartResponse>(`/customer/cart/items/${itemId}`).pipe(
      map(response => this.transformCart(response)),
      tap({
        next: (cart) => {
          this.cartState.set(cart);
          this.saveCartToStorage(cart);
          this.loadingState.set(false);
        },
        error: () => this.loadingState.set(false),
      })
    );
  }

  clearCart(): Observable<void> {
    this.loadingState.set(true);
    
    const source$ = environment.enableMockData
      ? of(undefined)
      : this.api.delete<void>('/customer/cart');

    return source$.pipe(
      tap({
        next: () => {
          this.cartState.set(null);
          localStorage.removeItem(CART_KEY);
          this.loadingState.set(false);
        },
        error: () => {
          this.loadingState.set(false);
        },
      })
    );
  }

  getItemQuantity(productId: string): number {
    const items = this.items();
    const item = items.find((i) => i.productId === productId);
    return item?.quantity ?? 0;
  }

  isInCart(productId: string): boolean {
    return this.getItemQuantity(productId) > 0;
  }
}
