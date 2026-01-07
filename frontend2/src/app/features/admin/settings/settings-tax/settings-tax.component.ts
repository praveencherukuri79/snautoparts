import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, NotificationService } from '@core/services';
import { CardComponent } from '@shared/primitives/card/card.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';

interface TaxRate {
  id: string;
  name: string;
  region: string;
  regionType: 'state' | 'country' | 'province';
  rate: number;
  priority: number;
  isActive: boolean;
}

interface TaxConfig {
  taxEnabled: boolean;
  calculationBasis: 'shipping' | 'billing' | 'store';
  displayPrices: 'excluding' | 'including';
  exemptGroups: string[];
  exemptCategories: string[];
}

@Component({
  selector: 'app-settings-tax',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
  ],
  templateUrl: './settings-tax.component.html',
  styleUrl: './settings-tax.component.scss',
})
export class SettingsTaxComponent implements OnInit {
  private adminService = inject(AdminService);
  private notification = inject(NotificationService);

  isLoading = signal(true);
  config = signal<TaxConfig>({
    taxEnabled: true,
    calculationBasis: 'shipping',
    displayPrices: 'excluding',
    exemptGroups: [],
    exemptCategories: [],
  });
  rates = signal<TaxRate[]>([]);

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Fetch from API (or mock data if enabled)
      const [ratesData, exemptionsData] = await Promise.all([
        this.adminService.getTaxRates(),
        this.adminService.getTaxExemptions(),
      ]);

      // Transform API response to our component's interface
      const rates = (ratesData as unknown[]).map((r: unknown) => {
        const rate = r as Record<string, unknown>;
        return {
          id: rate['id'] as string,
          name: `${rate['state'] || rate['region']} Tax`,
          region: `${rate['state'] || 'N/A'}, ${rate['region'] || 'USA'}`,
          regionType: 'state' as const,
          rate: rate['rate'] as number || 0,
          priority: 1,
          isActive: rate['isActive'] as boolean || false,
        };
      });

      const exemptions = (exemptionsData as unknown[]).map((e: unknown) => {
        const exemption = e as Record<string, unknown>;
        return exemption['name'] as string;
      });

      this.rates.set(rates);
      this.config.update(c => ({
        ...c,
        exemptGroups: exemptions,
      }));
    } catch (error) {
      this.notification.error('Failed to load tax settings');
      console.error('Tax settings load error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  toggleTaxEnabled(): void {
    const current = this.config();
    this.config.set({ ...current, taxEnabled: !current.taxEnabled });
    this.notification.success(`Taxes ${this.config().taxEnabled ? 'enabled' : 'disabled'}`);
  }

  addTaxRate(): void {
    this.notification.info('Add tax rate dialog would open here');
  }

  editRate(rate: TaxRate): void {
    this.notification.info(`Edit tax rate: ${rate.name}`);
  }

  removeExemptGroup(group: string): void {
    const current = this.config();
    this.config.set({
      ...current,
      exemptGroups: current.exemptGroups.filter(g => g !== group),
    });
  }

  removeExemptCategory(category: string): void {
    const current = this.config();
    this.config.set({
      ...current,
      exemptCategories: current.exemptCategories.filter(c => c !== category),
    });
  }

  trackByRate(_index: number, rate: TaxRate): string {
    return rate.id;
  }
}
