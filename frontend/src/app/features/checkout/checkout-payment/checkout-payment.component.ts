import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CheckoutService } from '../../../core/services/checkout.service';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-checkout-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, IconComponent],
  templateUrl: './checkout-payment.component.html',
  styleUrl: './checkout-payment.component.css',
})
export class CheckoutPaymentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);

  content = APP_CONTENT;
  processing = signal(false);

  paymentForm: FormGroup = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvc: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    sameAsShipping: [true],
  });

  ngOnInit(): void {
    this.checkoutService.setStep('payment');
    
    // Check if we have required data
    if (!this.checkoutService.shippingAddress() || !this.checkoutService.shippingMethod()) {
      this.router.navigate(['/checkout/address']);
    }
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    this.paymentForm.patchValue({ cardNumber: value });
  }

  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
    this.paymentForm.patchValue({ expiry: value });
  }

  continue(): void {
    if (this.paymentForm.valid) {
      this.processing.set(true);
      // In production, this would call Stripe to create a payment intent
      // For mock, we'll just simulate the process
      setTimeout(() => {
        this.checkoutService.setPaymentIntent('pi_mock_' + Date.now(), 'cs_mock_' + Date.now());
        this.processing.set(false);
        this.router.navigate(['/checkout/review']);
      }, 1000);
    }
  }

  goBack(): void {
    this.router.navigate(['/checkout/shipping']);
  }

  get displayCardNumber(): string {
    const value = this.paymentForm.get('cardNumber')?.value || '';
    return value.replace(/(\d{4})/g, '$1 ').trim();
  }
}

