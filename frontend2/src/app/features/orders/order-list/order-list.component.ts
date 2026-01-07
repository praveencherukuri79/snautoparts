import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '@core/services';
import { Order } from '@core/models';
import { CardComponent } from '@shared/primitives/card/card.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CurrencyPipe,
    DatePipe,
    CardComponent,
    BadgeComponent,
    SpinnerComponent,
    EmptyStateComponent,
    PaginationComponent,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  pageSize = 10;

  async ngOnInit(): Promise<void> {
    await this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    this.isLoading.set(true);
    try {
      const result = await this.orderService.getOrders({
        page: this.currentPage(),
        limit: this.pageSize,
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

  getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      PROCESSING: 'info',
      SHIPPED: 'info',
      DELIVERED: 'success',
      CANCELLED: 'error',
      REFUNDED: 'neutral',
    };
    return statusMap[status] || 'neutral';
  }

  trackByOrder(_index: number, order: Order): string {
    return order.id;
  }
}

