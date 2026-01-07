import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, NotificationService } from '@core/services';
import { InventoryItem, InventoryLog, Product } from '@core/models';
import { DataTableComponent, TableColumn } from '@shared/components/data-table/data-table.component';
import { CardComponent } from '@shared/primitives/card/card.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, DataTableComponent, CardComponent, ButtonComponent, BadgeComponent],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
})
export class InventoryComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private notification = inject(NotificationService);

  products = signal<InventoryItem[]>([]);
  lowStockProducts = signal<Product[]>([]);
  recentLogs = signal<InventoryLog[]>([]);
  isLoading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  pageSize = 20;

  columns: TableColumn<InventoryItem>[] = [
    { key: 'productSku', label: 'SKU' },
    { key: 'productName', label: 'Product' },
    { key: 'stockQuantity', label: 'Stock', align: 'right' },
    { key: 'lowStockThreshold', label: 'Low Stock Alert', align: 'right' },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [products, lowStock, logs] = await Promise.all([
        this.inventoryService.getInventory({ page: this.currentPage(), limit: this.pageSize }),
        this.inventoryService.getLowStockProducts(),
        this.inventoryService.getRecentLogs(),
      ]);
      this.products.set(products.data);
      this.total.set(products.meta.total);
      this.lowStockProducts.set(lowStock);
      this.recentLogs.set(logs);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onPageChange(page: number): Promise<void> {
    this.currentPage.set(page);
    await this.loadData();
  }

  async importInventory(): Promise<void> {
    // Create file input and trigger click
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.csv';
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const result = await this.inventoryService.importInventory(file);
        if (result.success) {
          this.notification.success(`Imported ${result.processedRows} items successfully`);
          await this.loadData();
        } else {
          this.notification.error(`Import failed: ${result.errors.length} errors`);
        }
      } catch {
        this.notification.error('Failed to import inventory');
      }
    };
    input.click();
  }

  async exportInventory(): Promise<void> {
    try {
      const blob = await this.inventoryService.exportInventory('xlsx');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      this.notification.success('Export downloaded');
    } catch {
      this.notification.error('Failed to export inventory');
    }
  }
}

