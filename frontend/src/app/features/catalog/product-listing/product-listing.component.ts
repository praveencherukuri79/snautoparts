import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CatalogService } from '../../../core/services/catalog.service';
import { Product, Category, Brand, ProductFilters, PaginatedProducts } from '../../../core/models/product.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeaderComponent,
    FooterComponent,
    ProductCardComponent,
    LoadingSpinnerComponent,
    IconComponent,
  ],
  templateUrl: './product-listing.component.html',
  styleUrl: './product-listing.component.css',
})
export class ProductListingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(CatalogService);

  content = APP_CONTENT;
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  loading = signal(true);
  totalProducts = signal(0);
  currentPage = signal(1);
  totalPages = signal(1);
  filtersOpen = signal(false);

  // Filters
  searchQuery = signal('');
  selectedCategory = signal('');
  selectedBrand = signal('');
  minPrice = signal<number | null>(null);
  maxPrice = signal<number | null>(null);
  inStockOnly = signal(false);
  sortBy = signal<ProductFilters['sortBy']>('newest');

  ngOnInit(): void {
    // Load filter options
    this.catalogService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
    });
    this.catalogService.getBrands().subscribe({
      next: (brands) => this.brands.set(brands),
    });

    // Watch for query param changes
    this.route.queryParams.subscribe((params) => {
      if (params['search']) this.searchQuery.set(params['search']);
      if (params['category']) this.selectedCategory.set(params['category']);
      if (params['brand']) this.selectedBrand.set(params['brand']);
      if (params['minPrice']) this.minPrice.set(Number(params['minPrice']));
      if (params['maxPrice']) this.maxPrice.set(Number(params['maxPrice']));
      if (params['inStock']) this.inStockOnly.set(params['inStock'] === 'true');
      if (params['sort']) this.sortBy.set(params['sort'] as ProductFilters['sortBy']);
      if (params['page']) this.currentPage.set(Number(params['page']));
      this.loadProducts();
    });
  }

  private loadProducts(): void {
    this.loading.set(true);
    const filters: ProductFilters = {
      search: this.searchQuery() || undefined,
      categoryId: this.selectedCategory() || undefined,
      brand: this.selectedBrand() || undefined,
      minPrice: this.minPrice() ?? undefined,
      maxPrice: this.maxPrice() ?? undefined,
      inStock: this.inStockOnly() || undefined,
      sortBy: this.sortBy(),
    };

    this.catalogService.getProducts(filters, this.currentPage(), 12).subscribe({
      next: (result: PaginatedProducts) => {
        this.products.set(result.products);
        this.totalProducts.set(result.total);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    const queryParams: Record<string, string | number | boolean | null> = {};
    if (this.searchQuery()) queryParams['search'] = this.searchQuery();
    if (this.selectedCategory()) queryParams['category'] = this.selectedCategory();
    if (this.selectedBrand()) queryParams['brand'] = this.selectedBrand();
    if (this.minPrice()) queryParams['minPrice'] = this.minPrice();
    if (this.maxPrice()) queryParams['maxPrice'] = this.maxPrice();
    if (this.inStockOnly()) queryParams['inStock'] = true;
    if (this.sortBy() !== 'newest') queryParams['sort'] = this.sortBy()!;
    queryParams['page'] = 1;

    this.router.navigate(['/products'], { queryParams });
    this.filtersOpen.set(false);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedBrand.set('');
    this.minPrice.set(null);
    this.maxPrice.set(null);
    this.inStockOnly.set(false);
    this.sortBy.set('newest');
    this.router.navigate(['/products']);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ProductFilters['sortBy'];
    this.sortBy.set(value);
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.router.navigate(['/products'], {
        queryParams: { page },
        queryParamsHandling: 'merge',
      });
    }
  }

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.searchQuery() ||
      this.selectedCategory() ||
      this.selectedBrand() ||
      this.minPrice() ||
      this.maxPrice() ||
      this.inStockOnly()
    );
  }
}

