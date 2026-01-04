import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Product, Category, ProductFilters, PaginatedProducts, Brand } from '../models/product.model';
import { Cart, AddToCartRequest, UpdateCartItemRequest } from '../models/cart.model';
import { Order, OrderFilters, PaginatedOrders, ShippingAddress } from '../models/order.model';
import { ShippingMethod } from '../models/checkout.model';
import { User } from '../models/user.model';
import { AuditLog, AuditLogFilters, PaginatedAuditLogs, Setting, InventoryAdjustment } from '../models/admin.model';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_ORDERS, MOCK_USERS, MOCK_SETTINGS, MOCK_AUDIT_LOGS, MOCK_SHIPPING_METHODS, MOCK_ADDRESSES } from './mock-data/index';

const MOCK_DELAY = 300;

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  private cart: Cart = this.createEmptyCart();

  private createEmptyCart(): Cart {
    return {
      id: 'cart-1',
      items: [],
      subtotal: 0,
      itemCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return of(MOCK_CATEGORIES).pipe(delay(MOCK_DELAY));
  }

  getCategoryBySlug(slug: string): Observable<Category> {
    const category = MOCK_CATEGORIES.find((c) => c.slug === slug);
    if (!category) {
      throw new Error('Category not found');
    }
    return of(category).pipe(delay(MOCK_DELAY));
  }

  // Products
  getProducts(filters?: ProductFilters, page = 1, pageSize = 12): Observable<PaginatedProducts> {
    let filtered = [...MOCK_PRODUCTS];

    if (filters) {
      if (filters.categoryId) {
        filtered = filtered.filter((p) => p.categoryId === filters.categoryId);
      }
      if (filters.brand) {
        filtered = filtered.filter((p) => p.brand?.name.toLowerCase() === filters.brand!.toLowerCase());
      }
      if (filters.minPrice) {
        filtered = filtered.filter((p) => Number(p.price) >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        filtered = filtered.filter((p) => Number(p.price) <= filters.maxPrice!);
      }
      if (filters.inStock) {
        filtered = filtered.filter((p) => p.stockQuantity > 0);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(search) ||
            (p.description && p.description.toLowerCase().includes(search)) ||
            p.sku.toLowerCase().includes(search)
        );
      }
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            filtered.sort((a, b) => Number(a.price) - Number(b.price));
            break;
          case 'price_desc':
            filtered.sort((a, b) => Number(b.price) - Number(a.price));
            break;
          case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
      }
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const products = filtered.slice(start, start + pageSize);

    return of({ products, total, page, pageSize, totalPages }).pipe(delay(MOCK_DELAY));
  }

  getProductBySlug(slug: string): Observable<Product> {
    const product = MOCK_PRODUCTS.find((p) => p.slug === slug);
    if (!product) {
      throw new Error('Product not found');
    }
    return of(product).pipe(delay(MOCK_DELAY));
  }

  getFeaturedProducts(limit = 8): Observable<Product[]> {
    return of(MOCK_PRODUCTS.slice(0, limit)).pipe(delay(MOCK_DELAY));
  }

  getRelatedProducts(productId: string, limit = 4): Observable<Product[]> {
    const product = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      return of([]).pipe(delay(MOCK_DELAY));
    }
    const related = MOCK_PRODUCTS.filter(
      (p) => p.id !== productId && p.categoryId === product.categoryId
    ).slice(0, limit);
    return of(related).pipe(delay(MOCK_DELAY));
  }

  getBrands(): Observable<Brand[]> {
    return of(MOCK_BRANDS).pipe(delay(MOCK_DELAY));
  }

  // Cart
  getCart(): Observable<Cart> {
    return of(this.cart).pipe(delay(MOCK_DELAY));
  }

  addToCart(request: AddToCartRequest): Observable<Cart> {
    const product = MOCK_PRODUCTS.find((p) => p.id === request.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const existingItem = this.cart.items.find((i) => i.productId === request.productId);
    if (existingItem) {
      existingItem.quantity += request.quantity;
      existingItem.total = existingItem.price * existingItem.quantity;
    } else {
      this.cart.items.push({
        id: `item-${Date.now()}`,
        productId: product.id,
        product: {
          id: product.id,
          sku: product.sku,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
          imageUrl: product.imageUrl || '',
          stockQuantity: product.stockQuantity,
        },
        quantity: request.quantity,
        price: Number(product.price),
        total: Number(product.price) * request.quantity,
      });
    }

    this.recalculateCart();
    return of(this.cart).pipe(delay(MOCK_DELAY));
  }

  updateCartItem(itemId: string, request: UpdateCartItemRequest): Observable<Cart> {
    const item = this.cart.items.find((i) => i.id === itemId);
    if (item) {
      item.quantity = request.quantity;
      item.total = item.price * item.quantity;
      this.recalculateCart();
    }
    return of(this.cart).pipe(delay(MOCK_DELAY));
  }

  removeFromCart(itemId: string): Observable<Cart> {
    this.cart.items = this.cart.items.filter((i) => i.id !== itemId);
    this.recalculateCart();
    return of(this.cart).pipe(delay(MOCK_DELAY));
  }

  private recalculateCart(): void {
    this.cart.itemCount = this.cart.items.reduce((sum, i) => sum + i.quantity, 0);
    this.cart.subtotal = this.cart.items.reduce((sum, i) => sum + i.total, 0);
    this.cart.updatedAt = new Date().toISOString();
  }

  // Orders
  getOrders(page = 1, pageSize = 10): Observable<PaginatedOrders> {
    const total = MOCK_ORDERS.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const orders = MOCK_ORDERS.slice(start, start + pageSize);
    return of({ orders, total, page, pageSize, totalPages }).pipe(delay(MOCK_DELAY));
  }

  getOrderById(orderId: string): Observable<Order> {
    const order = MOCK_ORDERS.find((o) => o.id === orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return of(order).pipe(delay(MOCK_DELAY));
  }

  getAllOrders(filters?: OrderFilters, page = 1, pageSize = 20): Observable<PaginatedOrders> {
    let filtered = [...MOCK_ORDERS];

    if (filters) {
      if (filters.status) {
        filtered = filtered.filter((o) => o.status === filters.status);
      }
      if (filters.paymentStatus) {
        filtered = filtered.filter((o) => o.paymentStatus === filters.paymentStatus);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter((o) => o.orderNumber.toLowerCase().includes(search));
      }
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const orders = filtered.slice(start, start + pageSize);
    return of({ orders, total, page, pageSize, totalPages }).pipe(delay(MOCK_DELAY));
  }

  getOrderStats(): Observable<{
    newOrders: number;
    pendingShipment: number;
    todaysVolume: number;
    statusCounts: Record<string, number>;
  }> {
    const newOrders = MOCK_ORDERS.filter((o) => o.status === 'PENDING').length;
    const pendingShipment = MOCK_ORDERS.filter((o) => o.status === 'PROCESSING').length;
    const todaysVolume = MOCK_ORDERS.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const statusCounts: Record<string, number> = {};
    MOCK_ORDERS.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });
    return of({ newOrders, pendingShipment, todaysVolume, statusCounts }).pipe(delay(MOCK_DELAY));
  }

  // Shipping
  getShippingMethods(): Observable<ShippingMethod[]> {
    return of(MOCK_SHIPPING_METHODS).pipe(delay(MOCK_DELAY));
  }

  getSavedAddresses(): Observable<ShippingAddress[]> {
    return of(MOCK_ADDRESSES).pipe(delay(MOCK_DELAY));
  }

  // Admin
  getUsers(page = 1, pageSize = 20): Observable<{ users: User[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const total = MOCK_USERS.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const users = MOCK_USERS.slice(start, start + pageSize);
    return of({ users, total, page, pageSize, totalPages }).pipe(delay(MOCK_DELAY));
  }

  getSettings(): Observable<Setting[]> {
    return of(MOCK_SETTINGS).pipe(delay(MOCK_DELAY));
  }

  getAuditLogs(filters?: AuditLogFilters, page = 1, pageSize = 50): Observable<PaginatedAuditLogs> {
    let filtered = [...MOCK_AUDIT_LOGS];

    if (filters) {
      if (filters.userId) {
        filtered = filtered.filter((l) => l.userId === filters.userId);
      }
      if (filters.action) {
        filtered = filtered.filter((l) => l.action === filters.action);
      }
      if (filters.resource) {
        filtered = filtered.filter((l) => l.resource === filters.resource);
      }
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const logs = filtered.slice(start, start + pageSize);
    return of({ logs, total, page, pageSize, totalPages }).pipe(delay(MOCK_DELAY));
  }

  // Inventory
  getInventoryAdjustments(productId?: string, page = 1, pageSize = 20): Observable<{
    logs: InventoryAdjustment[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const logs: InventoryAdjustment[] = [];
    return of({
      logs,
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    }).pipe(delay(MOCK_DELAY));
  }
}

