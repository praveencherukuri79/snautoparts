import { Component, Input, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { APP_CONTENT } from '../../../core/content/app.content';
import { getProductImage } from '../../../core/constants/images';
import { ImageFallbackDirective } from '../../directives/image-fallback.directive';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, CurrencyPipe, ImageFallbackDirective],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  private cartService = inject(CartService);
  content = APP_CONTENT;

  private toNumber(val: number | string | null | undefined): number {
    if (val === null || val === undefined) return 0;
    return typeof val === 'string' ? parseFloat(val) : val;
  }

  get primaryImage(): string {
    // imageUrl is the primary, images is string[]
    if (this.product.imageUrl) return this.product.imageUrl;
    if (this.product.images?.[0]) return this.product.images[0];
    return getProductImage(null);
  }

  get isOnSale(): boolean {
    if (!this.product.compareAtPrice) return false;
    return this.toNumber(this.product.compareAtPrice) > this.toNumber(this.product.price);
  }

  get discountPercent(): number {
    if (!this.isOnSale) return 0;
    const compareAt = this.toNumber(this.product.compareAtPrice);
    const price = this.toNumber(this.product.price);
    return Math.round(((compareAt - price) / compareAt) * 100);
  }

  get isLowStock(): boolean {
    return this.product.stockQuantity > 0 && this.product.stockQuantity <= this.product.lowStockThreshold;
  }

  get inCart(): boolean {
    return this.cartService.isInCart(this.product.id);
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart({ productId: this.product.id, quantity: 1 }).subscribe();
  }
}

