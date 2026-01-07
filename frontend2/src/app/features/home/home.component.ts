import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CatalogService, CartService } from '../../core/services';
import { Category } from '../../core/services/catalog.service';
import { ProductCardData, StockStatus } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { ButtonComponent } from '../../shared/primitives/button/button.component';
import { SelectComponent, SelectOption } from '../../shared/primitives/select/select.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    ButtonComponent,
    SelectComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);

  // State
  categories = signal<Category[]>([]);
  featuredProducts = signal<ProductCardData[]>([]);
  isLoading = signal(true);

  // Fitment selector state
  years = signal<SelectOption<number>[]>([]);
  makes = signal<SelectOption<string>[]>([]);
  models = signal<SelectOption<string>[]>([]);
  selectedYear = signal<number | null>(null);
  selectedMake = signal<string | null>(null);
  selectedModel = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      // Load categories and featured products in parallel
      const [categories, products] = await Promise.all([
        this.catalogService.getCategories(),
        this.catalogService.getFeaturedProducts(),
      ]);

      this.categories.set(categories);
      this.featuredProducts.set(products.map(p => this.mapToCardData(p)));

      // Load years for fitment selector
      this.loadYears();
    } finally {
      this.isLoading.set(false);
    }
  }

  private loadYears(): void {
    const currentYear = new Date().getFullYear();
    const yearOptions: SelectOption<number>[] = [];
    for (let year = currentYear; year >= 1990; year--) {
      yearOptions.push({ value: year, label: String(year) });
    }
    this.years.set(yearOptions);
  }

  async onYearChange(year: number): Promise<void> {
    this.selectedYear.set(year);
    this.selectedMake.set(null);
    this.selectedModel.set(null);
    this.models.set([]);

    if (year) {
      const makes = await this.catalogService.getFitmentMakes(year);
      this.makes.set(makes.map(m => ({ value: m, label: m })));
    } else {
      this.makes.set([]);
    }
  }

  async onMakeChange(make: string): Promise<void> {
    this.selectedMake.set(make);
    this.selectedModel.set(null);

    const year = this.selectedYear();
    if (year && make) {
      const models = await this.catalogService.getFitmentModels(year, make);
      this.models.set(models.map(m => ({ value: m, label: m })));
    } else {
      this.models.set([]);
    }
  }

  onModelChange(model: string): void {
    this.selectedModel.set(model);
  }

  async addToCart(product: ProductCardData): Promise<void> {
    await this.cartService.addItem(product.id, 1);
  }

  trackByCategory(_index: number, category: Category): string {
    return category.id;
  }

  trackByProduct(_index: number, product: ProductCardData): string {
    return product.id;
  }

  private mapToCardData(p: { id: string; slug: string; name: string; price: number; compareAtPrice?: number; imageUrl?: string; stockQuantity: number; isFeatured: boolean }): ProductCardData {
    const stockStatus: StockStatus = p.stockQuantity > 10 ? 'in_stock' : p.stockQuantity > 0 ? 'low_stock' : 'out_of_stock';
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      imageUrl: p.imageUrl,
      stockStatus,
      isFeatured: p.isFeatured,
    };
  }

  // Helper to get category icon based on name
  getCategoryIcon(categoryName: string): string {
    const iconMap: Record<string, string> = {
      'Engine Parts': 'settings_applications',
      'Brakes': 'remove_road',
      'Suspension': 'car_repair',
      'Electrical': 'electric_bolt',
      'Body Parts': 'directions_car',
      'Filters': 'filter_alt',
      'Exhaust': 'air',
      'Transmission': 'settings',
      'Cooling': 'ac_unit',
      'Fuel System': 'local_gas_station',
    };
    return iconMap[categoryName] || 'category';
  }
}

