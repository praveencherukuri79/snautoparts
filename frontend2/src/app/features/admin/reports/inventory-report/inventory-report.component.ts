import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, NotificationService } from '@core/services';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';

interface InventoryStats {
  totalCostValue: number;
  totalRetailValue: number;
  totalProducts: number;
  lowStockAlerts: number;
  avgValuePerItem: number;
  costChange: number;
  retailChange: number;
}

interface CategoryValue {
  category: string;
  value: number;
  percentage: number;
}

interface InventoryItem {
  id: string;
  name: string;
  brand: string;
  sku: string;
  category: string;
  categoryColor: string;
  stock: number;
  costPrice: number;
  retailPrice: number;
  totalCost: number;
  totalRetail: number;
  isLowStock: boolean;
}

@Component({
  selector: 'app-inventory-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    ButtonComponent,
    SpinnerComponent,
  ],
  templateUrl: './inventory-report.component.html',
  styleUrl: './inventory-report.component.scss',
})
export class InventoryReportComponent implements OnInit {
  private adminService = inject(AdminService);
  private notification = inject(NotificationService);

  isLoading = signal(true);
  stats = signal<InventoryStats | null>(null);
  categoryValues = signal<CategoryValue[]>([]);
  items = signal<InventoryItem[]>([]);
  
  searchQuery = signal('');
  selectedCategory = signal('all');
  selectedBrand = signal('all');
  selectedStatus = signal('all');

  categories = ['All Categories', 'Engine', 'Suspension', 'Brakes', 'Transmission', 'Electrical'];
  brands = ['All Brands', 'Bosch', 'Brembo', 'Denso', 'Bilstein', 'NGK'];
  statuses = ['Stock Status', 'In Stock', 'Low Stock', 'Out of Stock'];

  generatedDate = new Date();

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Get inventory value report from the API (or mock data if enabled)
      const report = await this.adminService.getInventoryValueReport();
      
      this.stats.set({
        totalCostValue: report.totalCostValue ?? 0,
        totalRetailValue: report.totalRetailValue ?? 0,
        totalProducts: report.totalProducts ?? 0,
        lowStockAlerts: report.lowStockAlerts ?? 0,
        avgValuePerItem: report.avgValuePerItem ?? 0,
        costChange: report.costChange ?? 0,
        retailChange: report.retailChange ?? 0,
      });

      this.categoryValues.set(report.valueByCategory ?? []);
      this.items.set(report.items ?? []);
    } catch (error) {
      this.notification.error('Failed to load inventory report');
      console.error('Inventory report load error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  get filteredItems(): InventoryItem[] {
    let items = this.items();
    
    const query = this.searchQuery().toLowerCase();
    if (query) {
      items = items.filter(i => 
        i.name.toLowerCase().includes(query) || 
        i.sku.toLowerCase().includes(query)
      );
    }

    if (this.selectedCategory() !== 'all') {
      items = items.filter(i => i.category.toLowerCase() === this.selectedCategory().toLowerCase());
    }

    if (this.selectedBrand() !== 'all') {
      items = items.filter(i => i.brand.toLowerCase() === this.selectedBrand().toLowerCase());
    }

    if (this.selectedStatus() !== 'all') {
      if (this.selectedStatus() === 'low') {
        items = items.filter(i => i.isLowStock);
      } else if (this.selectedStatus() === 'out') {
        items = items.filter(i => i.stock === 0);
      } else if (this.selectedStatus() === 'in') {
        items = items.filter(i => i.stock > 0 && !i.isLowStock);
      }
    }

    return items;
  }

  async exportCSV(): Promise<void> {
    this.notification.info('Exporting CSV...');
  }

  printReport(): void {
    window.print();
  }

  formatCurrency(value: number): string {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value.toFixed(0)}`;
  }

  getCategoryColorClass(color: string): string {
    const colors: Record<string, string> = {
      'blue': 'category-blue',
      'purple': 'category-purple',
      'orange': 'category-orange',
      'green': 'category-green',
    };
    return colors[color] || 'category-blue';
  }

  trackByItem(_index: number, item: InventoryItem): string {
    return item.id;
  }

  trackByCategory(_index: number, cat: CategoryValue): string {
    return cat.category;
  }
}
