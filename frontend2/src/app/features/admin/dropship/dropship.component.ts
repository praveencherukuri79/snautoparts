import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, NotificationService, OrderService } from '@core/services';
import { Affiliate, AffiliateOrder, PaginatedResponse } from '@core/models';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

type TabStatus = 'all' | 'PENDING' | 'SENT' | 'CONFIRMED' | 'FAILED';

interface DropshipStats {
  pendingProcessing: number;
  awaitingConfirmation: number;
  failed: number;
  confirmedToday: number;
}

@Component({
  selector: 'app-dropship',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DatePipe,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
    PaginationComponent,
  ],
  templateUrl: './dropship.component.html',
  styleUrl: './dropship.component.scss',
})
export class DropshipComponent implements OnInit {
  private adminService = inject(AdminService);
  private orderService = inject(OrderService);
  private notification = inject(NotificationService);

  orders = signal<AffiliateOrder[]>([]);
  affiliates = signal<Affiliate[]>([]);
  stats = signal<DropshipStats>({
    pendingProcessing: 0,
    awaitingConfirmation: 0,
    failed: 0,
    confirmedToday: 0,
  });

  isLoading = signal(true);
  isRetrying = signal<string | null>(null);

  // Filters
  activeTab = signal<TabStatus>('all');
  dateFilter = signal('today');
  supplierFilter = signal('');
  searchQuery = signal('');

  // Pagination
  currentPage = signal(1);
  totalItems = signal(0);
  pageSize = 10;

  tabs: { value: TabStatus; label: string }[] = [
    { value: 'all', label: 'All Orders' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'SENT', label: 'Sent' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'FAILED', label: 'Failed' },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [ordersResponse, affiliates] = await Promise.all([
        this.orderService.getAffiliateOrders({
          status: this.activeTab() === 'all' ? undefined : this.activeTab(),
          affiliateId: this.supplierFilter() || undefined,
          page: this.currentPage(),
          limit: this.pageSize,
        }),
        this.adminService.getAffiliates(),
      ]);

      this.orders.set(ordersResponse.data);
      this.totalItems.set(ordersResponse.meta.total);
      this.affiliates.set(affiliates);

      // Calculate stats
      this.calculateStats(ordersResponse);
    } catch (error) {
      this.notification.error('Failed to load drop-ship orders');
    } finally {
      this.isLoading.set(false);
    }
  }

  private calculateStats(response: PaginatedResponse<AffiliateOrder>): void {
    // In real app, stats would come from backend
    const all = response.data;
    this.stats.set({
      pendingProcessing: all.filter(o => o.status === 'PENDING').length,
      awaitingConfirmation: all.filter(o => o.status === 'SENT').length,
      failed: all.filter(o => o.status === 'FAILED').length,
      confirmedToday: all.filter(o => o.status === 'CONFIRMED').length,
    });
  }

  async onTabChange(tab: TabStatus): Promise<void> {
    this.activeTab.set(tab);
    this.currentPage.set(1);
    await this.loadData();
  }

  async onPageChange(page: number): Promise<void> {
    this.currentPage.set(page);
    await this.loadData();
  }

  async onSupplierChange(): Promise<void> {
    this.currentPage.set(1);
    await this.loadData();
  }

  async retryOrder(order: AffiliateOrder): Promise<void> {
    this.isRetrying.set(order.id);
    try {
      await this.orderService.retryAffiliateOrder(order.id);
      await this.loadData();
      this.notification.success('Retry initiated successfully');
    } catch {
      this.notification.error('Failed to retry order');
    } finally {
      this.isRetrying.set(null);
    }
  }

  async retryAllFailed(): Promise<void> {
    const failed = this.orders().filter(o => o.status === 'FAILED');
    if (failed.length === 0) {
      this.notification.info('No failed orders to retry');
      return;
    }

    this.notification.info(`Retrying ${failed.length} failed orders...`);
    
    for (const order of failed) {
      try {
        await this.orderService.retryAffiliateOrder(order.id);
      } catch {
        // Continue with next
      }
    }

    await this.loadData();
    this.notification.success('Retry complete');
  }

  exportOrders(): void {
    this.notification.info('Export feature coming soon');
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
      PENDING: 'neutral',
      SENT: 'info',
      CONFIRMED: 'success',
      FAILED: 'error',
      CANCELLED: 'neutral',
    };
    return statusMap[status] || 'neutral';
  }

  getFailedCount(): number {
    return this.orders().filter(o => o.status === 'FAILED').length;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems() / this.pageSize);
  }

  trackByOrder(_index: number, order: AffiliateOrder): string {
    return order.id;
  }

  trackByAffiliate(_index: number, affiliate: Affiliate): string {
    return affiliate.id;
  }
}
