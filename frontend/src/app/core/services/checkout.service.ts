import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { environment } from '../../../environments/environment';
import { ShippingAddress } from '../models/order.model';
import {
  CheckoutState,
  CheckoutStep,
  ShippingMethod,
  PaymentIntent,
  CreatePaymentIntentRequest,
} from '../models/checkout.model';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private api = inject(ApiService);
  private mockData = inject(MockDataService);

  private checkoutState = signal<CheckoutState>({
    step: 'address',
  });

  readonly state = this.checkoutState.asReadonly();
  readonly currentStep = computed(() => this.checkoutState().step);
  readonly shippingAddress = computed(() => this.checkoutState().shippingAddress);
  readonly shippingMethod = computed(() => this.checkoutState().shippingMethod);
  readonly clientSecret = computed(() => this.checkoutState().clientSecret);

  setStep(step: CheckoutStep): void {
    this.checkoutState.update((state) => ({ ...state, step }));
  }

  setShippingAddress(address: ShippingAddress): void {
    this.checkoutState.update((state) => ({
      ...state,
      shippingAddress: address,
      step: 'shipping',
    }));
  }

  setShippingMethod(method: ShippingMethod): void {
    this.checkoutState.update((state) => ({
      ...state,
      shippingMethod: method,
      step: 'payment',
    }));
  }

  setPaymentIntent(paymentIntentId: string, clientSecret: string): void {
    this.checkoutState.update((state) => ({
      ...state,
      paymentIntentId,
      clientSecret,
      step: 'review',
    }));
  }

  resetCheckout(): void {
    this.checkoutState.set({ step: 'address' });
  }

  // API calls
  getShippingMethods(): Observable<ShippingMethod[]> {
    if (environment.enableMockData) {
      return this.mockData.getShippingMethods();
    }
    return this.api.get<ShippingMethod[]>('/customer/checkout/shipping-methods');
  }

  createPaymentIntent(request: CreatePaymentIntentRequest): Observable<PaymentIntent> {
    return this.api.post<PaymentIntent>('/customer/checkout/create-payment-intent', request);
  }

  getSavedAddresses(): Observable<ShippingAddress[]> {
    if (environment.enableMockData) {
      return this.mockData.getSavedAddresses();
    }
    return this.api.get<ShippingAddress[]>('/customer/profile/addresses');
  }

  saveAddress(address: Omit<ShippingAddress, 'id'>): Observable<ShippingAddress> {
    return this.api.post<ShippingAddress>('/customer/profile/addresses', address);
  }

  addAddress(address: Omit<ShippingAddress, 'id'>): Observable<ShippingAddress> {
    return this.saveAddress(address);
  }

  updateAddress(addressId: string, address: Partial<ShippingAddress>): Observable<ShippingAddress> {
    return this.api.patch<ShippingAddress>(`/customer/profile/addresses/${addressId}`, address);
  }

  deleteAddress(addressId: string): Observable<void> {
    return this.api.delete<void>(`/customer/profile/addresses/${addressId}`);
  }

  setDefaultAddress(addressId: string): Observable<ShippingAddress> {
    return this.api.patch<ShippingAddress>(`/customer/profile/addresses/${addressId}`, { isDefault: true });
  }
}

