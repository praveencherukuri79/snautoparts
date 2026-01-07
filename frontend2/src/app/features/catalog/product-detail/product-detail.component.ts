import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CatalogService, CartService, NotificationService } from '@core/services';
import { Product, ProductFitment } from '@core/services/catalog.service';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { BadgeComponent } from '@shared/primitives/badge/badge.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { QuantitySelectorComponent } from '@shared/components/quantity-selector/quantity-selector.component';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CurrencyPipe,
    ButtonComponent,
    BadgeComponent,
    SpinnerComponent,
    QuantitySelectorComponent,
    ProductCardComponent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private notification = inject(NotificationService);

  // Route param
  slug = input.required<string>();

  // State
  product = signal<Product | null>(null);
  fitments = signal<ProductFitment[]>([]);
  relatedProducts = signal<Product[]>([]);
  selectedImage = signal<string | null>(null);
  quantity = signal(1);
  isLoading = signal(true);
  isAddingToCart = signal(false);

  async ngOnInit(): Promise<void> {
    await this.loadProduct();
  }

  async loadProduct(): Promise<void> {
    this.isLoading.set(true);
    try {
      const product = await this.catalogService.getProductBySlug(this.slug());
      if (!product) {
        return;
      }
      this.product.set(product);
      this.selectedImage.set(product.imageUrl ?? null);
      
      // Load fitments and related products
      if (product.id) {
        const [fitments, related] = await Promise.all([
          this.catalogService.getProductFitments(product.id),
          this.catalogService.getRelatedProducts(product.id),
        ]);
        this.fitments.set(fitments);
        this.relatedProducts.set(related);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  selectImage(imageUrl: string): void {
    this.selectedImage.set(imageUrl);
  }

  onQuantityChange(qty: number): void {
    this.quantity.set(qty);
  }

  async addToCart(): Promise<void> {
    const product = this.product();
    if (!product) return;

    this.isAddingToCart.set(true);
    try {
      await this.cartService.addItem(product.id, this.quantity());
      this.notification.success(`${product.name} added to cart`);
    } finally {
      this.isAddingToCart.set(false);
    }
  }

  get stockStatus(): 'in_stock' | 'low_stock' | 'out_of_stock' {
    const qty = this.product()?.stockQuantity ?? 0;
    if (qty === 0) return 'out_of_stock';
    if (qty <= 10) return 'low_stock';
    return 'in_stock';
  }

  get stockLabel(): string {
    const qty = this.product()?.stockQuantity ?? 0;
    if (qty === 0) return 'Out of Stock';
    if (qty <= 10) return `Only ${qty} left`;
    return 'In Stock';
  }

  get stockBadgeVariant(): 'success' | 'warning' | 'error' {
    switch (this.stockStatus) {
      case 'in_stock': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
    }
  }

  get discount(): number | null {
    const product = this.product();
    if (!product?.compareAtPrice || product.compareAtPrice <= product.price) {
      return null;
    }
    return Math.round((1 - product.price / product.compareAtPrice) * 100);
  }

  get allImages(): string[] {
    const product = this.product();
    if (!product) return [];
    const images = product.images ?? [];
    if (product.imageUrl && !images.includes(product.imageUrl)) {
      return [product.imageUrl, ...images];
    }
    return images;
  }
}

