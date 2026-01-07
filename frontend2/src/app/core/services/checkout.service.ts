import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from './api.service';
import { CartService } from './cart.service';
import {
  ShippingMethod,
  PaymentIntent,
  CreateOrderRequest,
  CreateOrderResponse,
  CheckoutData,
  CartSummary,
} from '../models';

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state?: string | null;
  zipCode: string;
  postalCode?: string;
  country: string;
  phone: string;
}

interface CheckoutState {
  step: CheckoutStep;
  shippingAddress: ShippingAddress | null;
  shippingMethods: ShippingMethod[];
  selectedShippingMethod: ShippingMethod | null;
  paymentIntent: PaymentIntent | null;
  isProcessing: boolean;
  error: string | null;
}

export type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private api = inject(ApiService);
  private cartService = inject(CartService);

  // State
  private state = signal<CheckoutState>({
    step: 'shipping',
    shippingAddress: null,
    shippingMethods: [],
    selectedShippingMethod: null,
    paymentIntent: null,
    isProcessing: false,
    error: null,
  });

  // Selectors
  readonly step = computed(() => this.state().step);
  readonly shippingAddress = computed(() => this.state().shippingAddress);
  readonly shippingMethods = computed(() => this.state().shippingMethods);
  readonly selectedShippingMethod = computed(() => this.state().selectedShippingMethod);
  readonly paymentIntent = computed(() => this.state().paymentIntent);
  readonly isProcessing = computed(() => this.state().isProcessing);
  readonly error = computed(() => this.state().error);

  // Get/Set shipping address
  getShippingAddress(): ShippingAddress | null {
    return this.state().shippingAddress;
  }

  setShippingAddress(address: Partial<ShippingAddress>): void {
    this.state.update(s => ({
      ...s,
      shippingAddress: address as ShippingAddress,
    }));
  }

  // Get/Set shipping method
  getShippingMethod(): ShippingMethod | null {
    return this.state().selectedShippingMethod;
  }

  setShippingMethod(method: ShippingMethod): void {
    this.state.update(s => ({
      ...s,
      selectedShippingMethod: method,
    }));
  }

  // Get shipping methods
  async getShippingMethods(): Promise<ShippingMethod[]> {
    await this.loadShippingMethods();
    return this.state().shippingMethods;
  }

  // Tax rate (would typically come from settings API based on shipping address)
  private readonly TAX_RATE = 0.08;

  // Cart summary with selected shipping
  readonly cartSummary = computed<CartSummary>(() => {
    const cart = this.cartService.cartData();
    const shipping = this.selectedShippingMethod()?.price ?? 0;
    const subtotal = typeof cart?.subtotal === 'number' ? cart.subtotal : 0;
    const tax = subtotal * this.TAX_RATE;
    const discount = 0; // Coupon discounts will be applied via cart API

    return {
      subtotal,
      shipping,
      tax,
      discount,
      total: subtotal + shipping + tax - discount,
    };
  });

  // Load shipping methods
  async loadShippingMethods(): Promise<void> {
    try {
      const response = await this.api.get<ShippingMethod[]>('/checkout/shipping-methods');
      this.state.update(s => ({
        ...s,
        shippingMethods: response,
        error: null,
      }));
    } catch (error) {
      this.state.update(s => ({
        ...s,
        error: 'Failed to load shipping methods',
      }));
      throw error;
    }
  }

  // Select shipping method
  selectShippingMethod(method: ShippingMethod): void {
    this.state.update(s => ({
      ...s,
      selectedShippingMethod: method,
    }));
  }

  // Navigate to step
  goToStep(step: CheckoutStep): void {
    this.state.update(s => ({ ...s, step }));
  }

  // Create payment intent
  async createPaymentIntent(): Promise<PaymentIntent> {
    this.state.update(s => ({ ...s, isProcessing: true, error: null }));

    try {
      const summary = this.cartSummary();
      const shippingMethodId = this.selectedShippingMethod()?.id;

      const response = await this.api.post<PaymentIntent>('/checkout/payment-intent', {
        amount: Math.round(summary.total * 100), // Convert to cents
        shippingMethodId,
      });

      this.state.update(s => ({
        ...s,
        paymentIntent: response,
        isProcessing: false,
      }));

      return response;
    } catch (error) {
      this.state.update(s => ({
        ...s,
        isProcessing: false,
        error: 'Failed to initialize payment',
      }));
      throw error;
    }
  }

  // Create order (idempotent)
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    this.state.update(s => ({ ...s, isProcessing: true, error: null }));

    try {
      const response = await this.api.post<CreateOrderResponse>('/checkout/orders', data);

      // Clear cart after successful order
      await this.cartService.clearCart();

      this.state.update(s => ({
        ...s,
        isProcessing: false,
        step: 'confirmation',
      }));

      return response;
    } catch (error) {
      this.state.update(s => ({
        ...s,
        isProcessing: false,
        error: 'Failed to create order',
      }));
      throw error;
    }
  }

  // Generate idempotency key for order creation
  generateIdempotencyKey(): string {
    return `order-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  // Reset checkout state
  reset(): void {
    this.state.set({
      step: 'shipping',
      shippingAddress: null,
      shippingMethods: [],
      selectedShippingMethod: null,
      paymentIntent: null,
      isProcessing: false,
      error: null,
    });
  }

  // Create order from checkout state
  async createCheckoutOrder(): Promise<CreateOrderResponse> {
    const address = this.getShippingAddress();
    const shippingMethod = this.getShippingMethod();
    const paymentIntent = this.state().paymentIntent;

    if (!address || !shippingMethod || !paymentIntent) {
      throw new Error('Checkout data incomplete');
    }

    // Map ShippingAddress to CheckoutAddress
    const checkoutAddress = {
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company,
      addressLine1: address.addressLine1 || address.address1,
      addressLine2: address.addressLine2 || address.address2,
      city: address.city,
      state: address.state ?? '',
      postalCode: address.postalCode || address.zipCode,
      country: address.country,
      phone: address.phone,
    };

    return this.createOrder({
      shippingAddress: checkoutAddress,
      shippingMethodId: shippingMethod.id,
      paymentClientSecret: paymentIntent.clientSecret,
      idempotencyKey: this.generateIdempotencyKey(),
    });
  }

  // Clear error
  clearError(): void {
    this.state.update(s => ({ ...s, error: null }));
  }
}

