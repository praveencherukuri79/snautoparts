import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CheckoutService } from '../../../core/services/checkout.service';
import { ShippingAddress } from '../../../core/models/order.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-checkout-address',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, IconComponent, LoadingSpinnerComponent],
  templateUrl: './checkout-address.component.html',
  styleUrl: './checkout-address.component.css',
})
export class CheckoutAddressComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);

  content = APP_CONTENT;
  savedAddresses = signal<ShippingAddress[]>([]);
  selectedAddressId = signal<string | null>(null);
  showNewAddressForm = signal(false);
  loading = signal(true);
  saving = signal(false);

  addressForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    company: [''],
    address1: ['', [Validators.required]],
    address2: [''],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
    country: ['USA', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\)\s?\d{3}-\d{4}$/)]],
  });

  ngOnInit(): void {
    this.checkoutService.setStep('address');
    this.loadSavedAddresses();
  }

  private loadSavedAddresses(): void {
    this.checkoutService.getSavedAddresses().subscribe({
      next: (addresses) => {
        this.savedAddresses.set(addresses);
        if (addresses.length > 0) {
          const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
          this.selectedAddressId.set(defaultAddr.id);
        } else {
          this.showNewAddressForm.set(true);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showNewAddressForm.set(true);
      },
    });
  }

  selectAddress(addressId: string): void {
    this.selectedAddressId.set(addressId);
    this.showNewAddressForm.set(false);
  }

  toggleNewAddressForm(): void {
    this.showNewAddressForm.update((v) => !v);
    if (this.showNewAddressForm()) {
      this.selectedAddressId.set(null);
    }
  }

  continue(): void {
    if (this.showNewAddressForm() && this.addressForm.valid) {
      this.saving.set(true);
      const address: Omit<ShippingAddress, 'id'> = this.addressForm.value;
      this.checkoutService.saveAddress(address).subscribe({
        next: (savedAddress) => {
          this.checkoutService.setShippingAddress(savedAddress);
          this.saving.set(false);
          this.router.navigate(['/checkout/shipping']);
        },
        error: () => {
          this.saving.set(false);
        },
      });
    } else if (this.selectedAddressId()) {
      const selected = this.savedAddresses().find((a) => a.id === this.selectedAddressId());
      if (selected) {
        this.checkoutService.setShippingAddress(selected);
        this.router.navigate(['/checkout/shipping']);
      }
    }
  }

  get canContinue(): boolean {
    if (this.showNewAddressForm()) {
      return this.addressForm.valid;
    }
    return !!this.selectedAddressId();
  }
}

