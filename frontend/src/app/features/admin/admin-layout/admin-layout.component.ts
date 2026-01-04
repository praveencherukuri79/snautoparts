import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { AuthService } from '../../../core/services/auth.service';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);

  content = APP_CONTENT;
  sidebarOpen = signal(true);
  
  readonly user = this.authService.user;

  navItems = [
    { label: 'Users & Roles', icon: 'group', path: '/admin/users' },
    { label: 'Settings', icon: 'settings', path: '/admin/settings' },
    { label: 'Audit Logs', icon: 'history', path: '/admin/audit' },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}

