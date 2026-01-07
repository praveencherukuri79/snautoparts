import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { CardComponent } from '@shared/primitives/card/card.component';
import { CheckoutService, CartService, NotificationService } from '@core/services';
import { Cart } from '@core/services/cart.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, ButtonComponent, CardComponent],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss',
})
export class ReviewComponent implements OnInit {
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private cartService = inject(CartService);
  private notification = inject(NotificationService);

  cart = signal<Cart | null>(null);
  isSubmitting = signal(false);

  shippingAddress = this.checkoutService.getShippingAddress();
  shippingMethod = this.checkoutService.getShippingMethod();

  async ngOnInit(): Promise<void> {
    const cart = await this.cartService.getCart();
    this.cart.set(cart);
  }

  get subtotal(): number {
    return this.cart()?.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) ?? 0;
  }

  get shippingCost(): number {
    return this.shippingMethod?.price ?? 0;
  }

  get total(): number {
    return this.subtotal + this.shippingCost;
  }

  async placeOrder(): Promise<void> {
    this.isSubmitting.set(true);
    try {
      const response = await this.checkoutService.createCheckoutOrder();
      this.router.navigate(['/checkout/confirmation', response.order.id]);
    } catch (error) {
      this.notification.error('Failed to place order. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

