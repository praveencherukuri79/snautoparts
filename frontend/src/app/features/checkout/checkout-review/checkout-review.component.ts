import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CheckoutService } from '../../../core/services/checkout.service';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { APP_CONTENT } from '../../../core/content/app.content';
import { getCartItemImage } from '../../../core/constants/images';

@Component({
  selector: 'app-checkout-review',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, CurrencyPipe],
  templateUrl: './checkout-review.component.html',
  styleUrl: './checkout-review.component.css',
})
export class CheckoutReviewComponent implements OnInit {
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);

  content = APP_CONTENT;
  placingOrder = signal(false);
  error = signal<string | null>(null);

  readonly shippingAddress = this.checkoutService.shippingAddress;
  readonly shippingMethod = this.checkoutService.shippingMethod;
  readonly items = this.cartService.items;
  readonly subtotal = this.cartService.subtotal;

  ngOnInit(): void {
    this.checkoutService.setStep('review');
    
    // Check if we have all required data
    if (!this.shippingAddress() || !this.shippingMethod()) {
      this.router.navigate(['/checkout/address']);
    }
  }

  get shippingCost(): number {
    return this.shippingMethod()?.price ?? 0;
  }

  get tax(): number {
    return Math.round(this.subtotal() * 0.06 * 100) / 100; // 6% tax
  }

  get total(): number {
    return this.subtotal() + this.shippingCost + this.tax;
  }

  placeOrder(): void {
    const address = this.shippingAddress();
    const method = this.shippingMethod();
    
    if (!address || !method) {
      this.error.set('Missing checkout information');
      return;
    }

    this.placingOrder.set(true);
    this.error.set(null);

    this.orderService.createOrder({
      addressId: address.id,
      shippingMethod: method.id,
      paymentIntentId: 'pi_mock_' + Date.now(),
      idempotencyKey: 'order_' + Date.now(),
    }).subscribe({
      next: (order) => {
        this.placingOrder.set(false);
        this.cartService.clearCart().subscribe();
        this.checkoutService.resetCheckout();
        this.router.navigate(['/checkout/confirmation', order.id]);
      },
      error: (err) => {
        this.placingOrder.set(false);
        this.error.set(err.message || 'Failed to place order');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/checkout/payment']);
  }

  editAddress(): void {
    this.router.navigate(['/checkout/address']);
  }

  editShipping(): void {
    this.router.navigate(['/checkout/shipping']);
  }

  editPayment(): void {
    this.router.navigate(['/checkout/payment']);
  }

  getItemImage = getCartItemImage;
}

