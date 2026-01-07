import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OrderService, NotificationService } from '@core/services';
import { Order, OrderTimeline, OrderItem, OrderNote } from '@core/models';
import { CardComponent } from '@shared/primitives/card/card.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { SelectComponent, SelectOption } from '@shared/primitives/select/select.component';
import { DialogService } from '@shared/primitives/dialog/dialog.service';

interface TimelineStep {
  icon: string;
  label: string;
  date?: string;
  description?: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isPending: boolean;
}

@Component({
  selector: 'app-order-manage',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    SpinnerComponent,
    SelectComponent,
  ],
  templateUrl: './order-manage.component.html',
  styleUrl: './order-manage.component.scss',
})
export class OrderManageComponent implements OnInit {
  private orderService = inject(OrderService);
  private notification = inject(NotificationService);
  private dialog = inject(DialogService);

  id = input.required<string>();

  order = signal<Order | null>(null);
  timeline = signal<OrderTimeline[]>([]);
  timelineSteps = signal<TimelineStep[]>([]);
  notes = signal<OrderNote[]>([]);
  isLoading = signal(true);
  isUpdating = signal(false);
  showStatusDropdown = signal(false);
  newNote = '';

  statusControl = new FormControl<string>('');
  statusOptions: SelectOption<string>[] = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PROCESSING', label: 'Processing' },
    { value: 'SHIPPED', label: 'Shipped' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

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
      this.timeline.set(timeline);
      this.statusControl.setValue(order.status);
      this.buildTimelineSteps(order, timeline);
      
      // Load notes if available
      if (order.notes) {
        this.notes.set(order.notes);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private buildTimelineSteps(order: Order, timeline: OrderTimeline[]): void {
    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentIndex = statusOrder.indexOf(order.status);

    const getTimelineEventDate = (status: string): string | undefined => {
      const event = timeline.find(t => 
        t.title?.toLowerCase().includes(status.toLowerCase()) ||
        t.description?.toLowerCase().includes(status.toLowerCase())
      );
      return event ? new Date(event.createdAt).toLocaleString() : undefined;
    };

    const steps: TimelineStep[] = [
      {
        icon: 'check_circle',
        label: 'Order Placed',
        date: order.createdAt ? new Date(order.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : undefined,
        description: 'by Customer',
        isCompleted: currentIndex >= 0,
        isCurrent: currentIndex === 0,
        isPending: false,
      },
      {
        icon: 'check_circle',
        label: 'Payment Confirmed',
        date: getTimelineEventDate('confirmed') || getTimelineEventDate('payment'),
        description: 'System (Stripe)',
        isCompleted: currentIndex >= 1,
        isCurrent: currentIndex === 1,
        isPending: currentIndex < 1,
      },
      {
        icon: 'inventory_2',
        label: 'Processing',
        date: getTimelineEventDate('processing'),
        description: 'Warehouse A',
        isCompleted: currentIndex >= 2,
        isCurrent: currentIndex === 2,
        isPending: currentIndex < 2,
      },
      {
        icon: 'local_shipping',
        label: 'Shipped',
        date: getTimelineEventDate('shipped'),
        isCompleted: currentIndex >= 3,
        isCurrent: currentIndex === 3,
        isPending: currentIndex < 3,
      },
      {
        icon: 'home',
        label: 'Delivered',
        date: getTimelineEventDate('delivered'),
        isCompleted: currentIndex >= 4,
        isCurrent: currentIndex === 4,
        isPending: currentIndex < 4,
      },
    ];

    this.timelineSteps.set(steps);
  }

  toggleStatusDropdown(): void {
    this.showStatusDropdown.update(v => !v);
  }

  async updateStatus(newStatus: string): Promise<void> {
    if (newStatus === this.order()?.status) return;

    this.isUpdating.set(true);
    this.showStatusDropdown.set(false);
    try {
      await this.orderService.updateOrderStatus(this.id(), newStatus);
      await this.loadOrder();
      this.notification.success('Order status updated');
    } catch {
      this.notification.error('Failed to update order status');
    } finally {
      this.isUpdating.set(false);
    }
  }

  async cancelOrder(): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Cancel Order',
      message: 'Are you sure you want to cancel this order? This action cannot be undone.',
      confirmText: 'Cancel Order',
      confirmColor: 'warn',
    }).toPromise();

    if (confirmed) {
      await this.updateStatus('CANCELLED');
    }
  }

  async addNote(): Promise<void> {
    const content = this.newNote.trim();
    if (!content) return;
    
    const orderId = this.id();
    try {
      const note = await this.orderService.addOrderNote(orderId, content);
      this.notes.update(notes => [...notes, note]);
      this.newNote = '';
      this.notification.success('Note added');
    } catch {
      this.notification.error('Failed to add note');
    }
  }

  printInvoice(): void {
    window.print();
  }

  emailCustomer(): void {
    const order = this.order();
    if (order?.customerEmail) {
      window.location.href = `mailto:${order.customerEmail}?subject=Regarding Order ${order.orderNumber}`;
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
    };
    return statusMap[status] || 'neutral';
  }

  trackByItem(_index: number, item: OrderItem): string {
    return item.id;
  }

  trackByStep(index: number, _step: TimelineStep): number {
    return index;
  }

  trackByNote(_index: number, note: OrderNote): string {
    return note.id;
  }
}
