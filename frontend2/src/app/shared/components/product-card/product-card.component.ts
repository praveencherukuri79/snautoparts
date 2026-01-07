import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProductCardData, StockStatus } from '../../../core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: ProductCardData;
  @Input() showAddToCart = true;
  @Input() showRating = true;

  @Output() addToCart = new EventEmitter<ProductCardData>();

  get isOnSale(): boolean {
    return !!(this.product.compareAtPrice && this.product.compareAtPrice > this.product.price);
  }

  get discountPercentage(): number {
    if (!this.isOnSale || !this.product.compareAtPrice) return 0;
    return Math.round((1 - this.product.price / this.product.compareAtPrice) * 100);
  }

  get stockStatusLabel(): string {
    switch (this.product.stockStatus) {
      case 'in_stock':
        return 'In Stock';
      case 'low_stock':
        return 'Low Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return '';
    }
  }

  get stockStatusClass(): string {
    return `stock-status--${this.product.stockStatus.replace('_', '-')}`;
  }

  get starArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.product.stockStatus !== 'out_of_stock') {
      this.addToCart.emit(this.product);
    }
  }
}

