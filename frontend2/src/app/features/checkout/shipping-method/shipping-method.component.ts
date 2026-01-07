import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { CheckoutService } from '@core/services';
import { ShippingMethod } from '@core/models';

@Component({
  selector: 'app-shipping-method',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CurrencyPipe,
    MatRadioModule,
    ButtonComponent,
    SpinnerComponent,
  ],
  templateUrl: './shipping-method.component.html',
  styleUrl: './shipping-method.component.scss',
})
export class ShippingMethodComponent implements OnInit {
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);

  methods = signal<ShippingMethod[]>([]);
  selectedMethod = new FormControl<string>('');
  isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const methods = await this.checkoutService.getShippingMethods();
      this.methods.set(methods);
      
      // Select first method by default or previously selected
      const saved = this.checkoutService.getShippingMethod();
      if (saved) {
        this.selectedMethod.setValue(saved.id);
      } else if (methods.length > 0) {
        this.selectedMethod.setValue(methods[0].id);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  onContinue(): void {
    const method = this.methods().find(m => m.id === this.selectedMethod.value);
    if (method) {
      this.checkoutService.setShippingMethod(method);
      this.router.navigate(['/checkout/payment']);
    }
  }
}

