import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { CardComponent } from '@shared/primitives/card/card.component';
import { CheckoutService, NotificationService } from '@core/services';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
})
export class PaymentComponent {
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private notification = inject(NotificationService);

  isLoading = signal(false);

  async onContinue(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Create payment intent with checkout service
      await this.checkoutService.createPaymentIntent();
      // Navigate to review (payment will be confirmed on order placement)
      this.router.navigate(['/checkout/review']);
    } catch (error) {
      this.notification.error('Payment processing failed. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

