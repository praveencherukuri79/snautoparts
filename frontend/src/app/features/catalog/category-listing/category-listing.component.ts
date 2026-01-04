import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CatalogService } from '../../../core/services/catalog.service';
import { Product, Category } from '../../../core/models/product.model';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-category-listing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ProductCardComponent,
    LoadingSpinnerComponent,
    IconComponent,
  ],
  templateUrl: './category-listing.component.html',
  styleUrl: './category-listing.component.css',
})
export class CategoryListingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalogService = inject(CatalogService);

  content = APP_CONTENT;
  category = signal<Category | null>(null);
  products = signal<Product[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.loadCategory(slug);
      }
    });
  }

  private loadCategory(slug: string): void {
    this.loading.set(true);
    this.catalogService.getCategoryBySlug(slug).subscribe({
      next: (category) => {
        this.category.set(category);
        this.loadProducts(category.id);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private loadProducts(categoryId: string): void {
    this.catalogService.getProducts({ categoryId }).subscribe({
      next: (result) => {
        this.products.set(result.products);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}

