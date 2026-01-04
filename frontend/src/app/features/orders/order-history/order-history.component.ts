import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent, IconComponent, LoadingSpinnerComponent, CurrencyPipe, DatePipe],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css',
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);

  content = APP_CONTENT;
  orders = signal<Order[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading.set(true);
    this.orderService.getMyOrders(this.currentPage()).subscribe({
      next: (result) => {
        this.orders.set(result.orders);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case 'DELIVERED':
        return 'badge-success';
      case 'SHIPPED':
      case 'PROCESSING':
        return 'badge-info';
      case 'PENDING':
      case 'CONFIRMED':
        return 'badge-warning';
      case 'CANCELLED':
        return 'badge-error';
      default:
        return '';
    }
  }

  getStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      PENDING: this.content.orders.statuses.pending,
      CONFIRMED: this.content.orders.statuses.confirmed,
      PROCESSING: this.content.orders.statuses.processing,
      SHIPPED: this.content.orders.statuses.shipped,
      DELIVERED: this.content.orders.statuses.delivered,
      CANCELLED: this.content.orders.statuses.cancelled,
      REFUNDED: 'Refunded',
    };
    return labels[status] || status;
  }
}

