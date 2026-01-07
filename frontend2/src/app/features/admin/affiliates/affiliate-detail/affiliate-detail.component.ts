import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AdminService, NotificationService } from '@core/services';
import { Affiliate, AffiliateProductMapping } from '@core/models';
import { CardComponent } from '@shared/primitives/card/card.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { DialogService } from '@shared/primitives/dialog/dialog.service';

@Component({
  selector: 'app-affiliate-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
  ],
  templateUrl: './affiliate-detail.component.html',
  styleUrl: './affiliate-detail.component.scss',
})
export class AffiliateDetailComponent implements OnInit {
  private router = inject(Router);
  private adminService = inject(AdminService);
  private notification = inject(NotificationService);
  private dialog = inject(DialogService);

  id = input.required<string>();

  affiliate = signal<Affiliate | null>(null);
  productMappings = signal<AffiliateProductMapping[]>([]);
  isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const [affiliate, mappings] = await Promise.all([
        this.adminService.getAffiliate(this.id()),
        this.adminService.getAffiliateProducts(this.id()),
      ]);
      this.affiliate.set(affiliate);
      this.productMappings.set(mappings);
    } catch {
      this.notification.error('Failed to load affiliate details');
      this.router.navigate(['/dropship/affiliates']);
    } finally {
      this.isLoading.set(false);
    }
  }

  async toggleAffiliate(): Promise<void> {
    const aff = this.affiliate();
    if (!aff) return;

    try {
      await this.adminService.toggleAffiliate(aff.id, !aff.isEnabled);
      await this.loadData();
      this.notification.success(`Affiliate ${aff.isEnabled ? 'disabled' : 'enabled'}`);
    } catch {
      this.notification.error('Failed to update affiliate');
    }
  }

  async syncNow(): Promise<void> {
    const aff = this.affiliate();
    if (!aff) return;

    this.notification.info('Sync initiated...');
    try {
      const result = await this.adminService.syncAffiliate(aff.id);
      if (result.success) {
        this.notification.success('Sync completed successfully');
        await this.loadData();
      } else {
        this.notification.error(result.message ?? 'Sync failed');
      }
    } catch {
      this.notification.error('Failed to sync affiliate');
    }
  }

  async deleteAffiliate(): Promise<void> {
    const aff = this.affiliate();
    if (!aff) return;

    const confirmed = await this.dialog.confirm({
      title: 'Delete Affiliate',
      message: `Are you sure you want to delete "${aff.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmColor: 'warn',
    }).toPromise();

    if (confirmed) {
      try {
        await this.adminService.deleteAffiliate(aff.id);
        this.notification.success('Affiliate deleted');
        this.router.navigate(['/dropship/affiliates']);
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

  trackByMapping(_index: number, mapping: AffiliateProductMapping): string {
    return mapping.id;
  }
}

