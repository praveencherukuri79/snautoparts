import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CheckoutService } from '../../../core/services/checkout.service';
import { ShippingAddress } from '../../../core/models/order.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent,
    IconComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.css',
})
export class AddressesComponent implements OnInit {
  private checkoutService = inject(CheckoutService);
  private fb = inject(FormBuilder);

  content = APP_CONTENT;
  addresses = signal<ShippingAddress[]>([]);
  loading = signal(true);
  modalOpen = signal(false);
  editingAddress = signal<ShippingAddress | null>(null);
  saving = signal(false);

  addressForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    street: ['', Validators.required],
    apartment: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zipCode: ['', Validators.required],
    country: ['United States', Validators.required],
    phone: [''],
    isDefault: [false],
  });

  ngOnInit(): void {
    this.loadAddresses();
  }

  private loadAddresses(): void {
    this.checkoutService.getSavedAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openAddModal(): void {
    this.editingAddress.set(null);
    this.addressForm.reset({ country: 'United States', isDefault: false });
    this.modalOpen.set(true);
  }

  openEditModal(address: ShippingAddress): void {
    this.editingAddress.set(address);
    this.addressForm.patchValue({
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street,
      apartment: address.apartment || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault || false,
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editingAddress.set(null);
  }

  saveAddress(): void {
    if (!this.addressForm.valid) return;

    this.saving.set(true);
    const formData = this.addressForm.value;
    const editing = this.editingAddress();

    if (editing) {
      // Update existing address
      this.checkoutService.updateAddress(editing.id, formData).subscribe({
        next: (updated) => {
          this.addresses.update(addresses =>
            addresses.map(a => a.id === editing.id ? updated : a)
          );
          this.saving.set(false);
          this.closeModal();
        },
        error: () => {
          this.saving.set(false);
          alert('Failed to update address. Please try again.');
        },
      });
    } else {
      // Add new address
      this.checkoutService.addAddress(formData).subscribe({
        next: (newAddress) => {
          this.addresses.update(addresses => [...addresses, newAddress]);
          this.saving.set(false);
          this.closeModal();
        },
        error: () => {
          this.saving.set(false);
          alert('Failed to add address. Please try again.');
        },
      });
    }
  }

  setAsDefault(address: ShippingAddress): void {
    this.checkoutService.setDefaultAddress(address.id).subscribe({
      next: () => {
        this.addresses.update(addresses =>
          addresses.map(a => ({
            ...a,
            isDefault: a.id === address.id,
          }))
        );
      },
      error: () => {
        alert('Failed to set default address. Please try again.');
      },
    });
  }

  deleteAddress(addressId: string): void {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    this.checkoutService.deleteAddress(addressId).subscribe({
      next: () => {
        this.addresses.update(addresses =>
          addresses.filter(a => a.id !== addressId)
        );
      },
      error: () => {
        alert('Failed to delete address. Please try again.');
      },
    });
  }
}
