import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, NotificationService } from '@core/services';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';

interface OrderStats {
  totalOrders: number;
  ordersChange: number;
  avgOrderValue: number;
  aovChange: number;
  fulfillmentRate: number;
  fulfillmentChange: number;
  returnRate: number;
  returnChange: number;
  ordersByDay: Array<{ day: string; orders: number }>;
  ordersByStatus: Array<{ status: string; count: number; percentage: number; color: string }>;
  customerStats: Array<{ day: string; newCustomers: number; returning: number }>;
  topProducts: Array<{ name: string; sku: string; price: number; sold: number }>;
}

@Component({
  selector: 'app-order-statistics',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CurrencyPipe,
    ButtonComponent,
    SpinnerComponent,
  ],
  templateUrl: './order-statistics.component.html',
  styleUrl: './order-statistics.component.scss',
})
export class OrderStatisticsComponent implements OnInit {
  private adminService = inject(AdminService);
  private notification = inject(NotificationService);

  isLoading = signal(true);
  data = signal<OrderStats | null>(null);
  selectedPeriod = signal<string>('today');

  periodOptions = ['Today', '7 Days', '30 Days', 'Custom'];

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Get order statistics from the API (or mock data if enabled)
      const report = await this.adminService.getSalesReport({ period: 'day' });
      
      // Map the response to our component's data structure
      this.data.set({
        totalOrders: report.totalOrders ?? 0,
        ordersChange: report.ordersChange ?? 0,
        avgOrderValue: report.averageOrderValue ?? 0,
        aovChange: report.aovChange ?? 0,
        fulfillmentRate: 98.5,
        fulfillmentChange: 0.5,
        returnRate: 1.2,
        returnChange: -0.2,
        ordersByDay: (report.revenueByDay ?? []).slice(-7).map((d, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7],
          orders: d.orders,
        })),
        ordersByStatus: [
          { status: 'Delivered', count: 92, percentage: 65, color: '#f97415' },
          { status: 'Processing', count: 28, percentage: 20, color: '#0bda16' },
          { status: 'Shipped', count: 14, percentage: 10, color: '#3b82f6' },
          { status: 'Cancelled', count: 8, percentage: 5, color: '#ef4444' },
        ],
        customerStats: [
          { day: 'Mon', newCustomers: 8, returning: 7 },
          { day: 'Tue', newCustomers: 12, returning: 10 },
          { day: 'Wed', newCustomers: 6, returning: 12 },
          { day: 'Thu', newCustomers: 15, returning: 13 },
          { day: 'Fri', newCustomers: 10, returning: 15 },
        ],
        topProducts: (report.topProducts ?? []).slice(0, 5).map((p, i) => ({
          name: p.name,
          sku: `SKU-${1000 + i}`,
          price: p.revenue / (p.quantity || 1),
          sold: p.quantity,
        })),
      });
    } catch (error) {
      this.notification.error('Failed to load order statistics');
      console.error('Order statistics load error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectPeriod(period: string): void {
    this.selectedPeriod.set(period.toLowerCase().replace(' ', ''));
    this.loadData();
  }

  getChartPath(): string {
    const data = this.data()?.ordersByDay || [];
    if (data.length === 0) return '';

    const maxOrders = Math.max(...data.map(d => d.orders));
    const height = 280;
    const width = 700;
    const padding = 20;

    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - (d.orders / maxOrders) * (height - padding * 2);
      return { x, y };
    });

    return 'M' + points.map(p => `${p.x},${p.y}`).join(' L ');
  }

  getChartAreaPath(): string {
    const linePath = this.getChartPath();
    if (!linePath) return '';
    return `${linePath} L 680,260 L 20,260 Z`;
  }

  getDonutStyle(): string {
    const data = this.data()?.ordersByStatus || [];
    let accumulated = 0;
    const segments = data.map(s => {
      const start = accumulated;
      accumulated += s.percentage;
      return `${s.color} ${start}% ${accumulated}%`;
    });
    return `conic-gradient(${segments.join(', ')})`;
  }

  getBarHeight(value: number, max: number): number {
    return (value / max) * 100;
  }

  getMaxCustomers(): number {
    const data = this.data()?.customerStats || [];
    return Math.max(...data.flatMap(d => [d.newCustomers, d.returning]));
  }

  trackByDay(_index: number, item: { day: string }): string {
    return item.day;
  }

  trackByProduct(_index: number, item: { sku: string }): string {
    return item.sku;
  }

  trackByStatus(_index: number, item: { status: string }): string {
    return item.status;
  }
}
