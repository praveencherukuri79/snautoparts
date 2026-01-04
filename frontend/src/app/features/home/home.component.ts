import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ImageFallbackDirective } from '../../shared/directives/image-fallback.directive';
import { CatalogService } from '../../core/services/catalog.service';
import { Product, Category, Brand } from '../../core/models/product.model';
import { APP_CONTENT } from '../../core/content/app.content';
import { getCategoryImage } from '../../core/constants/images';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    IconComponent,
    ProductCardComponent,
    LoadingSpinnerComponent,
    ImageFallbackDirective,
    CurrencyPipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private catalogService = inject(CatalogService);

  content = APP_CONTENT;
  featuredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  brands = signal<Brand[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadData();
  }

  getCategoryImage = getCategoryImage;

  private loadData(): void {
    this.catalogService.getFeaturedProducts(8).subscribe({
      next: (products) => this.featuredProducts.set(products),
    });

    this.catalogService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
    });

    this.catalogService.getBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.loading.set(false);
      },
    });
  }
}

