import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, LoadingSpinnerComponent, CurrencyPipe, DatePipe],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  content = APP_CONTENT;
  order = signal<Order | null>(null);
  loading = signal(true);
  updating = signal(false);
  savingTracking = signal(false);

  trackingNumber = '';
  newNote = '';

  statusOptions: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  ngOnInit(): void {
    const orderId = this.route.snapshot.params['id'];
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  private loadOrder(orderId: string): void {
    this.orderService.getManagerOrderById(orderId).subscribe({
      next: (order) => {
        this.order.set(order);
        this.trackingNumber = order.trackingNumber || '';
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/manager/orders']);
      },
    });
  }

  updateStatus(status: string): void {
    const ord = this.order();
    if (!ord) return;

    this.updating.set(true);
    this.orderService.updateOrderStatus(ord.id, status).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.updating.set(false);
      },
      error: () => {
        this.updating.set(false);
      },
    });
  }

  fulfillOrder(): void {
    const ord = this.order();
    if (!ord) return;

    const tracking = this.trackingNumber.trim() || undefined;
    this.updating.set(true);
    
    this.orderService.fulfillOrder(ord.id, tracking).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.updating.set(false);
      },
      error: () => {
        this.updating.set(false);
        alert('Failed to fulfill order. Please try again.');
      },
    });
  }

  saveTracking(): void {
    const ord = this.order();
    if (!ord || !this.trackingNumber.trim()) return;

    this.savingTracking.set(true);
    
    // Use fulfillOrder which also sets tracking
    this.orderService.fulfillOrder(ord.id, this.trackingNumber.trim()).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.savingTracking.set(false);
      },
      error: () => {
        this.savingTracking.set(false);
        alert('Failed to save tracking number. Please try again.');
      },
    });
  }

  addNote(): void {
    if (!this.newNote.trim()) return;
    
    // For now, just show a message since we don't have a notes API endpoint
    // In a real implementation, this would call an API to save the note
    alert(`Note added: "${this.newNote}"`);
    this.newNote = '';
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

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PROCESSING':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'PENDING':
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  }
}
