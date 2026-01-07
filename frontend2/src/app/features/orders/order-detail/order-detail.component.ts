import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '@core/services';
import { Order, OrderItem, OrderTimelineEntry } from '@core/models';
import { CardComponent } from '@shared/primitives/card/card.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CurrencyPipe,
    DatePipe,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    SpinnerComponent,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit {
  private orderService = inject(OrderService);

  id = input.required<string>();

  order = signal<Order | null>(null);
  timeline = signal<OrderTimelineEntry[]>([]);
  isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadOrder();
  }

  async loadOrder(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [order, timeline] = await Promise.all([
        this.orderService.getOrder(this.id()),
        this.orderService.getOrderTimeline(this.id()),
      ]);
      this.order.set(order);
      this.timeline.set(timeline ?? []);
    } finally {
      this.isLoading.set(false);
    }
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

  trackByItem(_index: number, item: OrderItem): string {
    return item.id;
  }

  trackByTimeline(_index: number, event: OrderTimelineEntry): string {
    return event.id;
  }
}

