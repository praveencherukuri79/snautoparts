import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, NotificationService } from '@core/services';
import { CardComponent } from '@shared/primitives/card/card.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { DialogService } from '@shared/primitives/dialog/dialog.service';

interface ShippingZone {
  id: string;
  name: string;
  type: 'domestic' | 'international';
  regions: string[];
  isDefault: boolean;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  costType: 'flat' | 'weight' | 'free';
  price: number;
  pricePerUnit?: number;
  zone: string;
  isActive: boolean;
}

@Component({
  selector: 'app-settings-shipping',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
  ],
  templateUrl: './settings-shipping.component.html',
  styleUrl: './settings-shipping.component.scss',
})
export class SettingsShippingComponent implements OnInit {
  private adminService = inject(AdminService);
  private notification = inject(NotificationService);
  private dialog = inject(DialogService);

  isLoading = signal(true);
  zones = signal<ShippingZone[]>([]);
  methods = signal<ShippingMethod[]>([]);
  selectedZone = signal<string>('all');

  // Computed property for active methods count (arrow functions not allowed in templates)
  get activeMethodsCount(): number {
    return this.methods().filter(m => m.isActive).length;
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Fetch from API (or mock data if enabled)
      const zonesData = await this.adminService.getShippingZones();
      
      // Transform the API response to our component's interface
      const zones = (zonesData as unknown[]).map((z: unknown) => {
        const zone = z as Record<string, unknown>;
        return {
          id: zone['id'] as string,
          name: zone['name'] as string,
          type: (zone['regions'] as string[])?.includes('Canada') ? 'international' : 'domestic',
          regions: zone['regions'] as string[] || [],
          isDefault: zone['isActive'] as boolean || false,
        } as ShippingZone;
      });
      
      // Extract methods from zones
      const allMethods: ShippingMethod[] = [];
      (zonesData as unknown[]).forEach((z: unknown) => {
        const zone = z as Record<string, unknown>;
        const zoneMethods = zone['methods'] as unknown[] || [];
        zoneMethods.forEach((m: unknown) => {
          const method = m as Record<string, unknown>;
          allMethods.push({
            id: method['id'] as string,
            name: method['name'] as string,
            description: `${method['minDays']}-${method['maxDays']} Business Days`,
            costType: (method['price'] as number) === 0 ? 'free' : 'flat',
            price: method['price'] as number || 0,
            zone: zone['name'] as string,
            isActive: method['isActive'] as boolean || false,
          });
        });
      });

      this.zones.set(zones);
      this.methods.set(allMethods);
    } catch (error) {
      this.notification.error('Failed to load shipping settings');
      console.error('Shipping settings load error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  get filteredMethods(): ShippingMethod[] {
    if (this.selectedZone() === 'all') {
      return this.methods();
    }
    return this.methods().filter(m => m.zone === this.selectedZone() || m.zone === 'All Zones');
  }

  async toggleMethod(method: ShippingMethod): Promise<void> {
    method.isActive = !method.isActive;
    this.notification.success(`${method.name} ${method.isActive ? 'enabled' : 'disabled'}`);
  }

  addZone(): void {
    this.notification.info('Add zone dialog would open here');
  }

  addMethod(): void {
    this.notification.info('Add method dialog would open here');
  }

  editMethod(method: ShippingMethod): void {
    this.notification.info(`Edit method: ${method.name}`);
  }

  getCostTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'flat': 'Flat Rate',
      'weight': 'By Weight',
      'free': 'Free',
    };
    return labels[type] || type;
  }

  getCostTypeBadgeVariant(type: string): 'primary' | 'default' | 'success' {
    const variants: Record<string, 'primary' | 'default' | 'success'> = {
      'flat': 'default',
      'weight': 'primary',
      'free': 'success',
    };
    return variants[type] || 'default';
  }

  formatPrice(method: ShippingMethod): string {
    if (method.costType === 'free') return '$0.00';
    if (method.costType === 'weight') {
      return `$${method.price.toFixed(2)} + $${method.pricePerUnit?.toFixed(2)}/lb`;
    }
    return `$${method.price.toFixed(2)}`;
  }

  trackByZone(_index: number, zone: ShippingZone): string {
    return zone.id;
  }

  trackByMethod(_index: number, method: ShippingMethod): string {
    return method.id;
  }
}
