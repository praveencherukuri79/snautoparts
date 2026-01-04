import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CartService } from '../../../core/services/cart.service';
import { CheckoutService } from '../../../core/services/checkout.service';
import { APP_CONTENT } from '../../../core/content/app.content';
import { getCartItemImage } from '../../../core/constants/images';

@Component({
  selector: 'app-checkout-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, IconComponent, CurrencyPipe],
  templateUrl: './checkout-layout.component.html',
  styleUrl: './checkout-layout.component.css',
})
export class CheckoutLayoutComponent {
  private cartService = inject(CartService);
  private checkoutService = inject(CheckoutService);

  content = APP_CONTENT;
  steps = [
    { key: 'address', label: this.content.checkout.steps.address, path: '/checkout/address' },
    { key: 'shipping', label: this.content.checkout.steps.shipping, path: '/checkout/shipping' },
    { key: 'payment', label: this.content.checkout.steps.payment, path: '/checkout/payment' },
    { key: 'review', label: this.content.checkout.steps.review, path: '/checkout/review' },
  ];

  readonly currentStep = this.checkoutService.currentStep;
  readonly items = this.cartService.items;
  readonly subtotal = this.cartService.subtotal;
  readonly itemCount = this.cartService.itemCount;
  readonly shippingMethod = this.checkoutService.shippingMethod;

  getStepIndex(step: string): number {
    return this.steps.findIndex((s) => s.key === step);
  }

  isStepComplete(step: string): boolean {
    const currentIndex = this.getStepIndex(this.currentStep());
    const stepIndex = this.getStepIndex(step);
    return stepIndex < currentIndex;
  }

  isStepCurrent(step: string): boolean {
    return step === this.currentStep();
  }

  get shippingCost(): number {
    return this.shippingMethod()?.price ?? 0;
  }

  get total(): number {
    return this.subtotal() + this.shippingCost;
  }

  getItemImage = getCartItemImage;
}

