import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService, NotificationService } from '@core/services';
import { Affiliate } from '@core/models';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { DialogService } from '@shared/primitives/dialog/dialog.service';

@Component({
  selector: 'app-affiliates',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
  ],
  templateUrl: './affiliates.component.html',
  styleUrl: './affiliates.component.scss',
})
export class AffiliatesComponent implements OnInit {
  private adminService = inject(AdminService);
  private notification = inject(NotificationService);
  private dialog = inject(DialogService);
  private router = inject(Router);

  affiliates = signal<Affiliate[]>([]);
  filteredAffiliates = signal<Affiliate[]>([]);
  isLoading = signal(true);
  searchQuery = signal('');
  viewMode = signal<'grid' | 'list'>('grid');
  showFilters = signal(false);
  sortBy = signal<'name' | 'lastSync' | 'status'>('name');
  sortOrder = signal<'asc' | 'desc'>('asc');

  async ngOnInit(): Promise<void> {
    await this.loadAffiliates();
  }

  async loadAffiliates(): Promise<void> {
    this.isLoading.set(true);
    try {
      const affiliates = await this.adminService.getAffiliates();
      this.affiliates.set(affiliates);
      this.filteredAffiliates.set(affiliates);
    } catch {
      this.notification.error('Failed to load affiliates');
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearch(): void {
    this.applyFiltersAndSort();
  }

  toggleFilters(): void {
    this.showFilters.update(v => !v);
  }

  toggleSort(): void {
    // Cycle through sort options
    const currentSort = this.sortBy();
    const sortOptions: ('name' | 'lastSync' | 'status')[] = ['name', 'lastSync', 'status'];
    const currentIndex = sortOptions.indexOf(currentSort);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    this.sortBy.set(sortOptions[nextIndex]);
    this.applyFiltersAndSort();
  }

  viewHistory(affiliate: Affiliate): void {
    // Navigate to affiliate detail page with history tab
    this.router.navigate(['/admin/affiliates', affiliate.id], { queryParams: { tab: 'history' } });
  }

  troubleshoot(affiliate: Affiliate): void {
    // Navigate to affiliate detail page with troubleshoot info
    this.router.navigate(['/admin/affiliates', affiliate.id], { queryParams: { tab: 'troubleshoot' } });
  }

  private applyFiltersAndSort(): void {
    let result = this.affiliates();
    
    // Apply search filter
    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(a => 
        a.name.toLowerCase().includes(query) ||
        a.code.toLowerCase().includes(query) ||
        a.integrationType.toLowerCase().includes(query)
      );
    }
    
    // Apply sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (this.sortBy()) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'lastSync':
          comparison = (a.lastSyncAt || '').localeCompare(b.lastSyncAt || '');
          break;
        case 'status':
          comparison = (a.isEnabled ? 1 : 0) - (b.isEnabled ? 1 : 0);
          break;
      }
      return this.sortOrder() === 'asc' ? comparison : -comparison;
    });
    
    this.filteredAffiliates.set(result);
  }

  async toggleAffiliate(affiliate: Affiliate): Promise<void> {
    try {
      await this.adminService.toggleAffiliate(affiliate.id, !affiliate.isEnabled);
      await this.loadAffiliates();
      this.notification.success(`${affiliate.name} ${affiliate.isEnabled ? 'disabled' : 'enabled'}`);
    } catch {
      this.notification.error('Failed to update affiliate');
    }
  }

  async deleteAffiliate(affiliate: Affiliate): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Delete Affiliate',
      message: `Are you sure you want to delete "${affiliate.name}"? This will also remove all product mappings.`,
      confirmText: 'Delete',
      confirmColor: 'warn',
    }).toPromise();

    if (confirmed) {
      try {
        await this.adminService.deleteAffiliate(affiliate.id);
        await this.loadAffiliates();
        this.notification.success('Affiliate deleted');
      } catch {
        this.notification.error('Failed to delete affiliate');
      }
    }
  }

  getStatusVariant(affiliate: Affiliate): 'success' | 'warning' | 'error' | 'neutral' {
    if (!affiliate.isEnabled) return 'neutral';
    if (affiliate.lastError) return 'error';
    return 'success';
  }

  getStatusLabel(affiliate: Affiliate): string {
    if (!affiliate.isEnabled) return 'Inactive';
    if (affiliate.lastError) return 'Error';
    return 'Active';
  }

  getIntegrationIcon(type: string): string {
    const icons: Record<string, string> = {
      'API': 'api',
      'EDI': 'swap_horiz',
      'EMAIL': 'email',
      'FTP': 'folder_open',
    };
    return icons[type] || 'settings';
  }

  getLastSyncText(affiliate: Affiliate): string {
    if (!affiliate.lastSyncAt) return 'Never';
    const date = new Date(affiliate.lastSyncAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  trackByAffiliate(_index: number, affiliate: Affiliate): string {
    return affiliate.id;
  }
}

