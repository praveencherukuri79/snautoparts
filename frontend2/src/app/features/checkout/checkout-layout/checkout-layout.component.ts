import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-checkout-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatStepperModule, MatIconModule],
  templateUrl: './checkout-layout.component.html',
  styleUrl: './checkout-layout.component.scss',
})
export class CheckoutLayoutComponent {
  private router = inject(Router);

  steps = [
    { path: 'shipping', label: 'Shipping' },
    { path: 'method', label: 'Method' },
    { path: 'payment', label: 'Payment' },
    { path: 'review', label: 'Review' },
  ];

  get currentStepIndex(): number {
    const url = this.router.url;
    const index = this.steps.findIndex(s => url.includes(s.path));
    return index >= 0 ? index : 0;
  }
}



