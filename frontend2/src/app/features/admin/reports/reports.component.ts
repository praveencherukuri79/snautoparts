import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AdminService, NotificationService } from '@core/services';
import { SalesReport } from '@core/models';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  private adminService = inject(AdminService);
  private notification = inject(NotificationService);

  data = signal<SalesReport | null>(null);
  isLoading = signal(true);
  selectedPeriod = signal<string>('30');

  periodOptions = [
    { value: 'today', label: 'Today' },
    { value: '7', label: '7 Days' },
    { value: '30', label: '30 Days' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom' },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadReport();
  }

  async loadReport(): Promise<void> {
    this.isLoading.set(true);
    try {
      const report = await this.adminService.getSalesReport({ period: 'day' });
      this.data.set(report);
    } catch (error) {
      this.notification.error('Failed to load report');
      console.error('Report load error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  selectPeriod(period: string): void {
    this.selectedPeriod.set(period);
    this.loadReport();
  }

  async exportReport(): Promise<void> {
    try {
      await this.adminService.exportSalesReport();
      this.notification.success('Report exported successfully');
    } catch {
      this.notification.error('Failed to export report');
    }
  }

  getChartPath(): string {
    const data = this.data()?.revenueByDay || [];
    if (data.length === 0) return '';

    const maxRevenue = Math.max(...data.map(d => d.revenue));
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.revenue / maxRevenue) * 90;
      return `${x},${y}`;
    });

    return `M${points.join(' L')}`;
  }

  getChartAreaPath(): string {
    const linePath = this.getChartPath();
    if (!linePath) return '';
    return `${linePath} L100,100 L0,100 Z`;
  }

  getDailyOrdersData(): number[] {
    const data = this.data()?.revenueByDay.slice(-7) || [];
    const maxOrders = Math.max(...data.map(d => d.orders));
    return data.map(d => (d.orders / maxOrders) * 100);
  }

  getDayLabels(): string[] {
    return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  }

  trackByDay(_index: number, item: { date: string }): string {
    return item.date;
  }

  trackByProduct(_index: number, item: { name: string }): string {
    return item.name;
  }
}
