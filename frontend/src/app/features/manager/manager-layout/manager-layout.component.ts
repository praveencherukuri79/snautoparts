import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthService } from '../../../core/services/auth.service';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-manager-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './manager-layout.component.html',
  styleUrl: './manager-layout.component.css',
})
export class ManagerLayoutComponent {
  private authService = inject(AuthService);

  content = APP_CONTENT;
  sidebarOpen = signal(true);
  
  readonly user = this.authService.user;
  readonly userRole = this.authService.userRole;

  navItems = [
    { label: 'Orders', icon: 'receipt_long', path: '/manager/orders' },
    { label: 'Inventory', icon: 'inventory_2', path: '/manager/inventory' },
    { label: 'Adjustments', icon: 'tune', path: '/manager/inventory/adjustments' },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}

