import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CatalogService, Category } from '@core/services/catalog.service';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { CardComponent } from '@shared/primitives/card/card.component';

@Component({
  selector: 'app-category-listing',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, CardComponent],
  templateUrl: './category-listing.component.html',
  styleUrl: './category-listing.component.scss',
})
export class CategoryListingComponent implements OnInit {
  private catalogService = inject(CatalogService);

  categories = signal<Category[]>([]);
  isLoading = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const categories = await this.catalogService.getCategories();
      this.categories.set(categories);
    } finally {
      this.isLoading.set(false);
    }
  }

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
      'Lighting': 'light',
      'Interior': 'weekend',
      'Wheels & Tires': 'tire_repair',
    };
    return iconMap[categoryName] || 'category';
  }

  trackByCategory(_index: number, category: Category): string {
    return category.id;
  }
}

