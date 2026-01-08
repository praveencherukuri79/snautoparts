import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { CardComponent } from '@shared/primitives/card/card.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { DialogService } from '@shared/primitives/dialog/dialog.service';
import { UserService, NotificationService } from '@core/services';
import { SavedVehicle } from '@core/models';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, SpinnerComponent, EmptyStateComponent],
  templateUrl: './vehicles.component.html',
  styleUrl: './vehicles.component.scss',
})
export class VehiclesComponent implements OnInit {
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private dialog = inject(DialogService);

  vehicles = signal<SavedVehicle[]>([]);
  isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadVehicles();
  }

  async loadVehicles(): Promise<void> {
    this.isLoading.set(true);
    try {
      const vehicles = await this.userService.getSavedVehicles();
      this.vehicles.set(vehicles);
    } finally {
      this.isLoading.set(false);
    }
  }

  async setDefault(vehicle: SavedVehicle): Promise<void> {
    await this.userService.setDefaultVehicle(vehicle.id);
    await this.loadVehicles();
    this.notification.success('Default vehicle updated');
  }

  async deleteVehicle(vehicle: SavedVehicle): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Remove Vehicle',
      message: `Are you sure you want to remove "${vehicle.year} ${vehicle.make} ${vehicle.model}"?`,
      confirmText: 'Remove',
      confirmColor: 'warn',
    }).toPromise();

    if (confirmed) {
      await this.userService.deleteSavedVehicle(vehicle.id);
      await this.loadVehicles();
      this.notification.success('Vehicle removed');
    }
  }

  trackByVehicle(_index: number, vehicle: SavedVehicle): string {
    return vehicle.id;
  }
}



