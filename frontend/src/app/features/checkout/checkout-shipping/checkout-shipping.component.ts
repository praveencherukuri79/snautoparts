import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CheckoutService } from '../../../core/services/checkout.service';
import { CartService } from '../../../core/services/cart.service';
import { ShippingMethod } from '../../../core/models/checkout.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-checkout-shipping',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, LoadingSpinnerComponent, CurrencyPipe],
  templateUrl: './checkout-shipping.component.html',
  styleUrl: './checkout-shipping.component.css',
})
export class CheckoutShippingComponent implements OnInit {
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private cartService = inject(CartService);

  content = APP_CONTENT;
  shippingMethods = signal<ShippingMethod[]>([]);
  selectedMethodId = signal<string | null>(null);
  loading = signal(true);

  readonly subtotal = this.cartService.subtotal;

  ngOnInit(): void {
    this.checkoutService.setStep('shipping');
    
    // Check if we have a shipping address
    if (!this.checkoutService.shippingAddress()) {
      this.router.navigate(['/checkout/address']);
      return;
    }

    this.loadShippingMethods();
  }

  private loadShippingMethods(): void {
    this.checkoutService.getShippingMethods().subscribe({
      next: (methods) => {
        this.shippingMethods.set(methods);
        if (methods.length > 0) {
          this.selectedMethodId.set(methods[0].id);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  selectMethod(methodId: string): void {
    this.selectedMethodId.set(methodId);
  }

  get selectedMethod(): ShippingMethod | null {
    return this.shippingMethods().find((m) => m.id === this.selectedMethodId()) || null;
  }

  isFreeShipping(method: ShippingMethod): boolean {
    // Free shipping on orders over $75
    return method.price === 7.99 && this.subtotal() >= 75;
  }

  getDisplayPrice(method: ShippingMethod): number {
    if (this.isFreeShipping(method)) {
      return 0;
    }
    return method.price;
  }

  continue(): void {
    const method = this.selectedMethod;
    if (method) {
      const adjustedMethod = {
        ...method,
        price: this.getDisplayPrice(method),
      };
      this.checkoutService.setShippingMethod(adjustedMethod);
      this.router.navigate(['/checkout/payment']);
    }
  }

  goBack(): void {
    this.router.navigate(['/checkout/address']);
  }
}

