import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService, NotificationService } from '@core/services';
import { Product, LowStockAlert } from '@core/models';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
  ],
  templateUrl: './low-stock.component.html',
  styleUrl: './low-stock.component.scss',
})
export class LowStockComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private notification = inject(NotificationService);

  alerts = signal<LowStockAlert[]>([]);
  filteredAlerts = signal<LowStockAlert[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  
  // Stats
  totalLowStock = computed(() => this.alerts().length);
  criticalCount = computed(() => this.alerts().filter(a => a.currentQuantity < 5).length);
  recentlyAdded = signal(0); // Would come from API

  async ngOnInit(): Promise<void> {
    await this.loadAlerts();
  }

  async loadAlerts(): Promise<void> {
    this.isLoading.set(true);
    try {
      const alerts = await this.inventoryService.getLowStockAlerts();
      this.alerts.set(alerts);
      this.filteredAlerts.set(alerts);
    } catch (error) {
      this.notification.error('Failed to load low stock alerts');
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearch(): void {
    const query = this.searchQuery().toLowerCase();
    if (!query) {
      this.filteredAlerts.set(this.alerts());
      return;
    }
    
    this.filteredAlerts.set(
      this.alerts().filter(a => 
        a.productName.toLowerCase().includes(query) ||
        a.productSku.toLowerCase().includes(query)
      )
    );
  }

  async refreshAlerts(): Promise<void> {
    await this.loadAlerts();
    this.notification.success('Alerts refreshed');
  }

  exportAlerts(): void {
    this.notification.info('Export feature coming soon');
  }

  adjustThresholds(): void {
    this.notification.info('Threshold adjustment coming soon');
  }

  updateAllStock(): void {
    this.notification.info('Bulk stock update coming soon');
  }

  getStockStatus(currentQuantity: number): 'critical' | 'low' | 'normal' {
    if (currentQuantity < 5) return 'critical';
    if (currentQuantity < 15) return 'low';
    return 'normal';
  }

  getEstimatedDepletion(alert: LowStockAlert): string {
    // Simplified calculation based on deficit
    if (alert.currentQuantity < 3) return '~ 1 Day';
    if (alert.currentQuantity < 5) return '~ 2 Days';
    if (alert.currentQuantity < 10) return '4 Days';
    return '1 Week';
  }

  trackByAlert(_index: number, alert: LowStockAlert): string {
    return alert.productId;
  }
}

