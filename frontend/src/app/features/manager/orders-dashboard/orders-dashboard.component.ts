import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus, OrderFilters } from '../../../core/models/order.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-orders-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, LoadingSpinnerComponent, CurrencyPipe, DatePipe],
  templateUrl: './orders-dashboard.component.html',
  styleUrl: './orders-dashboard.component.css',
})
export class OrdersDashboardComponent implements OnInit {
  private orderService = inject(OrderService);

  content = APP_CONTENT;
  orders = signal<Order[]>([]);
  stats = signal<{
    newOrders: number;
    pendingShipment: number;
    todaysVolume: number;
    statusCounts: Record<string, number>;
  } | null>(null);
  loading = signal(true);
  
  searchQuery = '';
  statusFilter = '';
  currentPage = signal(1);
  totalPages = signal(1);

  statusOptions: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

  ngOnInit(): void {
    this.loadStats();
    this.loadOrders();
  }

  private loadStats(): void {
    this.orderService.getOrderStats().subscribe({
      next: (stats) => this.stats.set(stats),
    });
  }

  private loadOrders(): void {
    this.loading.set(true);
    const filters: OrderFilters = {};
    if (this.searchQuery) filters.search = this.searchQuery;
    if (this.statusFilter) filters.status = this.statusFilter as OrderStatus;

    this.orderService.getAllOrders(filters, this.currentPage()).subscribe({
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

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadOrders();
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
}

