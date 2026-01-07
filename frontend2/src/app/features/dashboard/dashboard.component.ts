import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeatureConfigService, OrderService, AuthService, UserService } from '@core/services';
import { Order, SavedVehicle } from '@core/models';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';

interface DashboardStats {
  pendingOrders: number;
  lowStockItems: number;
  shippedToday: number;
  todayRevenue: number;
  ordersToday: number;
  totalUsers: number;
  totalProducts: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    CurrencyPipe, 
    DatePipe,
    SpinnerComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private featureConfig = inject(FeatureConfigService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  dashboardLayout = computed(() => this.featureConfig.ui()?.dashboardLayout ?? 'customer');
  user = this.authService.user;
  
  stats = signal<DashboardStats>({
    pendingOrders: 0,
    lowStockItems: 0,
    shippedToday: 0,
    todayRevenue: 0,
    ordersToday: 0,
    totalUsers: 0,
    totalProducts: 0,
  });
  
  recentOrders = signal<Order[]>([]);
  savedVehicles = signal<SavedVehicle[]>([]);
  isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    const layout = this.dashboardLayout();
    
    if (layout === 'customer') {
      await this.loadCustomerDashboard();
    } else if (layout === 'operations' || layout === 'admin') {
      await this.loadDashboardStats();
    }
    
    this.isLoading.set(false);
  }

  private async loadCustomerDashboard(): Promise<void> {
    try {
      // Load recent orders and saved vehicles in parallel
      const [ordersResponse, vehicles] = await Promise.all([
        this.orderService.getOrders({ limit: 3 }),
        this.userService.getSavedVehicles(),
      ]);
      
      this.recentOrders.set(ordersResponse.data);
      this.savedVehicles.set(vehicles);
    } catch (error) {
      console.error('Failed to load customer dashboard:', error);
    }
  }

  private async loadDashboardStats(): Promise<void> {
    try {
      // Load dashboard statistics
      const statsData = await this.orderService.getDashboardStats();
      this.stats.set(statsData);
      
      // Load recent orders
      const orders = await this.orderService.getOrders({ limit: 5 });
      this.recentOrders.set(orders.data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  get userName(): string {
    const user = this.user();
    return user?.firstName || user?.email?.split('@')[0] || 'User';
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

  trackByVehicle(_index: number, vehicle: SavedVehicle): string {
    return vehicle.id;
  }
}
