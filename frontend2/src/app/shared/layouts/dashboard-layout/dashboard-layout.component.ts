import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { FeatureConfigService, AuthService } from '../../../core/services';
import { NavigationItem } from '../../../core/models';

/**
 * Dashboard Layout
 * Manager/Admin layout with sidebar navigation
 */
@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  private featureConfig = inject(FeatureConfigService);
  private authService = inject(AuthService);

  sidenavOpen = signal(true);
  
  readonly user = this.authService.user;
  readonly navigation = this.featureConfig.navigation;
  
  readonly primaryNav = computed(() => this.navigation()?.primary ?? []);
  readonly secondaryNav = computed(() => this.navigation()?.secondary ?? []);

  toggleSidenav(): void {
    this.sidenavOpen.update(v => !v);
  }

  async logout(): Promise<void> {
    await this.authService.logout();
  }

  trackByNavItem(_index: number, item: NavigationItem): string {
    return item.id;
  }
}

