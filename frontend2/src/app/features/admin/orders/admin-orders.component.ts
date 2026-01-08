import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '@core/services';
import { Order } from '@core/models';
import { DataTableComponent, TableColumn } from '@shared/components/data-table/data-table.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { SelectComponent, SelectOption } from '@shared/primitives/select/select.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    DataTableComponent,
    BadgeComponent,
    SelectComponent,
  ],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss',
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  pageSize = 20;

  statusFilter = new FormControl<string>('');
  statusOptions: SelectOption<string>[] = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  columns: TableColumn<Order>[] = [
    { key: 'orderNumber', label: 'Order #', sortable: true },
    { key: 'customerEmail', label: 'Customer' },
    { key: 'status', label: 'Status' },
    { key: 'total', label: 'Total', sortable: true, align: 'right' },
    { key: 'createdAt', label: 'Date', sortable: true },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    this.isLoading.set(true);
    try {
      const result = await this.orderService.getOrders({
        page: this.currentPage(),
        limit: this.pageSize,
        status: this.statusFilter.value || undefined,
      });
      this.orders.set(result.data);
      this.total.set(result.meta.total);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onPageChange(page: number): Promise<void> {
    this.currentPage.set(page);
    await this.loadOrders();
  }

  async onFilterChange(): Promise<void> {
    this.currentPage.set(1);
    await this.loadOrders();
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      PROCESSING: 'info',
      SHIPPED: 'info',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return statusMap[status] || 'neutral';
  }
}



