import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { CardComponent } from '@shared/primitives/card/card.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { DialogService } from '@shared/primitives/dialog/dialog.service';
import { UserService, NotificationService } from '@core/services';
import { Address } from '@core/models';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, SpinnerComponent, EmptyStateComponent],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.scss',
})
export class AddressesComponent implements OnInit {
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private dialog = inject(DialogService);

  addresses = signal<Address[]>([]);
  isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadAddresses();
  }

  async loadAddresses(): Promise<void> {
    this.isLoading.set(true);
    try {
      const addresses = await this.userService.getAddresses();
      this.addresses.set(addresses);
    } finally {
      this.isLoading.set(false);
    }
  }

  async setDefault(address: Address): Promise<void> {
    await this.userService.setDefaultAddress(address.id);
    await this.loadAddresses();
    this.notification.success('Default address updated');
  }

  async deleteAddress(address: Address): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Delete Address',
      message: 'Are you sure you want to delete this address?',
      confirmText: 'Delete',
      confirmColor: 'warn',
    }).toPromise();

    if (confirmed) {
      await this.userService.deleteAddress(address.id);
      await this.loadAddresses();
      this.notification.success('Address deleted');
    }
  }

  trackByAddress(_index: number, address: Address): string {
    return address.id;
  }
}



