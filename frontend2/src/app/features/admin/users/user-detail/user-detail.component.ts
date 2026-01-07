import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, NotificationService, OrderService } from '@core/services';
import { User, Order } from '@core/models';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { DialogService } from '@shared/primitives/dialog/dialog.service';

interface UserStats {
  totalOrders: number;
  lifetimeValue: number;
  avgReview: number;
}

interface UserSession {
  id: string;
  device: string;
  location: string;
  browser: string;
  isCurrent: boolean;
  lastActive: string;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CurrencyPipe,
    DatePipe,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent implements OnInit {
  private userService = inject(UserService);
  private orderService = inject(OrderService);
  private notification = inject(NotificationService);
  private dialog = inject(DialogService);

  id = input.required<string>();

  user = signal<User | null>(null);
  recentOrders = signal<Order[]>([]);
  stats = signal<UserStats>({ totalOrders: 0, lifetimeValue: 0, avgReview: 0 });
  sessions = signal<UserSession[]>([]);
  isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadUser();
  }

  async loadUser(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [user, ordersResponse] = await Promise.all([
        this.userService.getUser(this.id()),
        this.orderService.getOrders({ userId: this.id(), limit: 5 }),
      ]);
      
      this.user.set(user);
      this.recentOrders.set(ordersResponse.data);

      // Calculate stats from orders
      const orders = ordersResponse.data;
      const totalValue = orders.reduce((sum, o) => sum + o.total, 0);
      this.stats.set({
        totalOrders: ordersResponse.meta.total,
        lifetimeValue: totalValue,
        avgReview: 4.8, // Placeholder
      });

      // Mock sessions
      this.sessions.set([
        {
          id: '1',
          device: 'MacBook Pro 16"',
          location: 'San Francisco, US',
          browser: 'Chrome 118',
          isCurrent: true,
          lastActive: 'Now',
        },
        {
          id: '2',
          device: 'iPhone 14 Pro',
          location: 'San Francisco, US',
          browser: 'Safari Mobile',
          isCurrent: false,
          lastActive: 'Last active 2 days ago',
        },
      ]);
    } catch {
      this.notification.error('Failed to load user details');
    } finally {
      this.isLoading.set(false);
    }
  }

  async resetPassword(): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Reset Password',
      message: `Send a password reset link to ${this.user()?.email}?`,
      confirmText: 'Send Reset Link',
    }).toPromise();

    if (confirmed) {
      this.notification.success('Password reset email sent');
    }
  }

  async deactivateUser(): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate ${this.user()?.firstName} ${this.user()?.lastName}? They will no longer be able to log in.`,
      confirmText: 'Deactivate',
      confirmColor: 'warn',
    }).toPromise();

    if (confirmed) {
      try {
        await this.userService.updateUser(this.id(), { isActive: false });
        await this.loadUser();
        this.notification.success('User deactivated');
      } catch {
        this.notification.error('Failed to deactivate user');
      }
    }
  }

  getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
    const statusMap: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
      PENDING: 'warning',
      PROCESSING: 'info',
      SHIPPED: 'info',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return statusMap[status] || 'neutral';
  }

  getRoleColor(role?: string): string {
    const colors: Record<string, string> = {
      ADMIN: 'var(--color-error)',
      MANAGER: 'var(--color-warning)',
      CUSTOMER: 'var(--color-primary)',
    };
    return colors[role || ''] || 'var(--color-gray-500)';
  }

  trackByOrder(_index: number, order: Order): string {
    return order.id;
  }

  trackBySession(_index: number, session: UserSession): string {
    return session.id;
  }
}

