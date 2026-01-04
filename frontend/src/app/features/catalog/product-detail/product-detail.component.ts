import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ImageFallbackDirective } from '../../../shared/directives/image-fallback.directive';
import { CatalogService } from '../../../core/services/catalog.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { APP_CONTENT } from '../../../core/content/app.content';
import { getProductImage } from '../../../core/constants/images';

@Component({
  selector: 'app-product-detail',
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
    ImageFallbackDirective,
    CurrencyPipe,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);

  content = APP_CONTENT;
  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  loading = signal(true);
  selectedImageIndex = signal(0);
  quantity = signal(1);
  activeTab = signal<'description' | 'specifications'>('description');
  addingToCart = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  private loadProduct(slug: string): void {
    this.loading.set(true);
    this.catalogService.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
        this.loadRelatedProducts(product.id);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/products']);
      },
    });
  }

  private loadRelatedProducts(productId: string): void {
    this.catalogService.getRelatedProducts(productId, 4).subscribe({
      next: (products) => this.relatedProducts.set(products),
    });
  }

  get primaryImage(): string {
    const prod = this.product();
    if (!prod) return getProductImage(null);
    // images is now string[] - use imageUrl as primary or first image in array
    if (prod.imageUrl) return prod.imageUrl;
    if (prod.images?.[this.selectedImageIndex()]) return prod.images[this.selectedImageIndex()];
    if (prod.images?.[0]) return prod.images[0];
    return getProductImage(null);
  }

  /** Get all product images as array of URLs */
  get productImages(): string[] {
    const prod = this.product();
    if (!prod) return [getProductImage(null)];
    const images: string[] = [];
    if (prod.imageUrl) images.push(prod.imageUrl);
    if (prod.images?.length) {
      images.push(...prod.images.filter(img => img !== prod.imageUrl));
    }
    return images.length > 0 ? images : [getProductImage(null)];
  }

  private toNumber(val: number | string | null | undefined): number {
    if (val === null || val === undefined) return 0;
    return typeof val === 'string' ? parseFloat(val) : val;
  }

  get isOnSale(): boolean {
    const prod = this.product();
    if (!prod?.compareAtPrice) return false;
    return this.toNumber(prod.compareAtPrice) > this.toNumber(prod.price);
  }

  get discountPercent(): number {
    const prod = this.product();
    if (!prod || !this.isOnSale) return 0;
    const compareAt = this.toNumber(prod.compareAtPrice);
    const price = this.toNumber(prod.price);
    return Math.round(((compareAt - price) / compareAt) * 100);
  }

  get savingsAmount(): number {
    const prod = this.product();
    if (!prod || !this.isOnSale) return 0;
    return this.toNumber(prod.compareAtPrice) - this.toNumber(prod.price);
  }

  get isLowStock(): boolean {
    const prod = this.product();
    return !!prod && prod.stockQuantity > 0 && prod.stockQuantity <= prod.lowStockThreshold;
  }

  get inCart(): boolean {
    const prod = this.product();
    return !!prod && this.cartService.isInCart(prod.id);
  }

  get cartQuantity(): number {
    const prod = this.product();
    return prod ? this.cartService.getItemQuantity(prod.id) : 0;
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  incrementQuantity(): void {
    const prod = this.product();
    if (prod && this.quantity() < prod.stockQuantity) {
      this.quantity.update((q) => q + 1);
    }
  }

  decrementQuantity(): void {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  addToCart(): void {
    const prod = this.product();
    if (!prod || this.addingToCart()) return;

    this.addingToCart.set(true);
    this.cartService.addToCart({ productId: prod.id, quantity: this.quantity() }).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.quantity.set(1);
      },
      error: () => {
        this.addingToCart.set(false);
      },
    });
  }

  buyNow(): void {
    const prod = this.product();
    if (!prod) return;

    this.addingToCart.set(true);
    this.cartService.addToCart({ productId: prod.id, quantity: this.quantity() }).subscribe({
      next: () => {
        this.addingToCart.set(false);
        this.router.navigate(['/checkout']);
      },
      error: () => {
        this.addingToCart.set(false);
      },
    });
  }

  setActiveTab(tab: 'description' | 'specifications'): void {
    this.activeTab.set(tab);
  }
}

