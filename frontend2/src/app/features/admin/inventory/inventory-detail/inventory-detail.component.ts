import { Component, inject, signal, OnInit, input, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InventoryService, NotificationService } from '@core/services';
import { InventoryLog, StockAdjustment, InventoryItemDetail } from '@core/models';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent, BadgeVariant } from '@shared/primitives/badge/badge.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { SelectOption } from '@shared/primitives/select/select.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
    PaginationComponent,
  ],
  templateUrl: './inventory-detail.component.html',
  styleUrl: './inventory-detail.component.scss',
})
export class InventoryDetailComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private notification = inject(NotificationService);

  id = input.required<string>();

  product = signal<InventoryItemDetail | null>(null);
  adjustmentLogs = signal<InventoryLog[]>([]);
  isLoading = signal(true);
  
  // Pagination
  currentPage = signal(1);
  totalLogs = signal(0);
  pageSize = 10;

  // Adjust Stock Modal
  showAdjustModal = signal(false);
  adjustmentType = signal('');
  quantityChange = signal(0);
  adjustmentReason = signal('');
  adjustmentDate = signal(new Date().toISOString().split('T')[0]);
  isSaving = signal(false);

  adjustmentTypeOptions: SelectOption<string>[] = [
    { value: 'received', label: 'Received' },
    { value: 'damaged', label: 'Damaged' },
    { value: 'audit', label: 'Audit' },
    { value: 'returned', label: 'Returned' },
    { value: 'adjustment', label: 'Manual Adjustment' },
  ];

  newStockLevel = computed(() => {
    const product = this.product();
    if (!product) return 0;
    return product.stockQuantity + this.quantityChange();
  });

  stockStatus = computed(() => {
    const product = this.product();
    if (!product) return 'unknown';
    if (product.stockQuantity === 0) return 'out-of-stock';
    if (product.stockQuantity <= (product.lowStockThreshold || 10)) return 'low-stock';
    return 'in-stock';
  });

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [product, logsResponse] = await Promise.all([
        this.inventoryService.getProductInventory(this.id()),
        this.inventoryService.getProductAdjustmentLogs(this.id(), {
          page: this.currentPage(),
          limit: this.pageSize,
        }),
      ]);
      this.product.set(product);
      this.adjustmentLogs.set(logsResponse.data);
      this.totalLogs.set(logsResponse.meta.total);
    } catch (error) {
      this.notification.error('Failed to load inventory details');
    } finally {
      this.isLoading.set(false);
    }
  }

  async onPageChange(page: number): Promise<void> {
    this.currentPage.set(page);
    await this.loadData();
  }

  openAdjustModal(): void {
    this.adjustmentType.set('');
    this.quantityChange.set(0);
    this.adjustmentReason.set('');
    this.adjustmentDate.set(new Date().toISOString().split('T')[0]);
    this.showAdjustModal.set(true);
  }

  closeAdjustModal(): void {
    this.showAdjustModal.set(false);
  }

  incrementQuantity(): void {
    this.quantityChange.update(v => v + 1);
  }

  decrementQuantity(): void {
    this.quantityChange.update(v => v - 1);
  }

  async saveAdjustment(): Promise<void> {
    if (!this.adjustmentType() || !this.adjustmentReason().trim()) {
      this.notification.error('Please fill in all required fields');
      return;
    }

    this.isSaving.set(true);
    try {
      const adjustment: StockAdjustment = {
        productId: this.id(),
        type: this.adjustmentType(),
        quantity: this.quantityChange(),
        reason: this.adjustmentReason(),
        date: this.adjustmentDate(),
      };

      await this.inventoryService.adjustStock(adjustment);
      this.notification.success('Stock adjustment saved');
      this.closeAdjustModal();
      await this.loadData();
    } catch (error) {
      this.notification.error('Failed to save adjustment');
    } finally {
      this.isSaving.set(false);
    }
  }

  getAdjustmentTypeLabel(type: string): string {
    const typeMap: Record<string, string> = {
      received: 'Received',
      damaged: 'Damaged',
      audit: 'Audit',
      returned: 'Returned',
      sold: 'Sold',
      adjustment: 'Adjustment',
    };
    return typeMap[type.toLowerCase()] || type;
  }

  getAdjustmentTypeVariant(type: string): BadgeVariant {
    const typeMap: Record<string, BadgeVariant> = {
      received: 'success',
      damaged: 'error',
      audit: 'info',
      returned: 'warning',
      sold: 'default',
      adjustment: 'warning',
    };
    return typeMap[type.toLowerCase()] || 'default';
  }

  trackByLog(_index: number, log: InventoryLog): string {
    return log.id;
  }

  get totalPages(): number {
    return Math.ceil(this.totalLogs() / this.pageSize);
  }

  get showingStart(): number {
    return (this.currentPage() - 1) * this.pageSize + 1;
  }

  get showingEnd(): number {
    return Math.min(this.currentPage() * this.pageSize, this.totalLogs());
  }
}

