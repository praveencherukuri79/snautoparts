import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CatalogService, CartService } from '@core/services';
import { Product } from '@core/services/catalog.service';
import { ProductCardData, StockStatus } from '@core/models';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { FitmentSelectorComponent, FitmentSelection } from '@shared/components/fitment-selector/fitment-selector.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { SelectComponent, SelectOption } from '@shared/primitives/select/select.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProductCardComponent,
    FitmentSelectorComponent,
    PaginationComponent,
    EmptyStateComponent,
    SpinnerComponent,
    SelectComponent,
  ],
  templateUrl: './product-listing.component.html',
  styleUrl: './product-listing.component.scss',
})
export class ProductListingComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // State
  products = signal<ProductCardData[]>([]);
  isLoading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  pageSize = signal(20);
  categorySlug = signal<string | null>(null);

  // Filters
  sortControl = new FormControl<string>('newest');
  sortOptions: SelectOption<string>[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
  ];

  // Fitment filters
  fitmentYear = signal<number | null>(null);
  fitmentMake = signal<string | null>(null);
  fitmentModel = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    // Get category from route params if present
    this.route.params.subscribe(params => {
      if (params['slug']) {
        this.categorySlug.set(params['slug']);
      }
    });

    // Get fitment filters from query params
    this.route.queryParams.subscribe(params => {
      if (params['year']) this.fitmentYear.set(Number(params['year']));
      if (params['make']) this.fitmentMake.set(params['make']);
      if (params['model']) this.fitmentModel.set(params['model']);
      if (params['page']) this.currentPage.set(Number(params['page']));
      if (params['sort']) this.sortControl.setValue(params['sort']);
    });

    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.isLoading.set(true);
    try {
      const result = await this.catalogService.getProducts({
        page: this.currentPage(),
        limit: this.pageSize(),
        category: this.categorySlug() ?? undefined,
        year: this.fitmentYear() ?? undefined,
        make: this.fitmentMake() ?? undefined,
        model: this.fitmentModel() ?? undefined,
        sort: this.sortControl.value ?? undefined,
      });

      this.products.set(result.data.map(p => this.mapToCardData(p)));
      this.total.set(result.meta.total);
    } finally {
      this.isLoading.set(false);
    }
  }

  private mapToCardData(product: Product): ProductCardData {
    const stockStatus: StockStatus = product.stockQuantity > 10 ? 'in_stock' : product.stockQuantity > 0 ? 'low_stock' : 'out_of_stock';
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      imageUrl: product.imageUrl,
      stockStatus,
      isFeatured: product.isFeatured,
    };
  }

  async onPageChange(page: number): Promise<void> {
    this.currentPage.set(page);
    this.updateQueryParams();
    await this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async onSortChange(): Promise<void> {
    this.currentPage.set(1);
    this.updateQueryParams();
    await this.loadProducts();
  }

  async onFitmentSelected(fitment: FitmentSelection): Promise<void> {
    this.fitmentYear.set(fitment.year);
    this.fitmentMake.set(fitment.make);
    this.fitmentModel.set(fitment.model);
    this.currentPage.set(1);
    this.updateQueryParams();
    await this.loadProducts();
  }

  clearFitment(): void {
    this.fitmentYear.set(null);
    this.fitmentMake.set(null);
    this.fitmentModel.set(null);
    this.updateQueryParams();
    this.loadProducts();
  }

  private updateQueryParams(): void {
    const queryParams: Record<string, string | number | null> = {
      page: this.currentPage() > 1 ? this.currentPage() : null,
      sort: this.sortControl.value !== 'newest' ? this.sortControl.value : null,
      year: this.fitmentYear(),
      make: this.fitmentMake(),
      model: this.fitmentModel(),
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  async addToCart(product: ProductCardData): Promise<void> {
    await this.cartService.addItem(product.id, 1);
  }

  trackByProduct(_index: number, product: ProductCardData): string {
    return product.id;
  }

  get hasFitmentFilter(): boolean {
    return !!(this.fitmentYear() && this.fitmentMake() && this.fitmentModel());
  }

  get fitmentLabel(): string {
    if (!this.hasFitmentFilter) return '';
    return `${this.fitmentYear()} ${this.fitmentMake()} ${this.fitmentModel()}`;
  }
}

