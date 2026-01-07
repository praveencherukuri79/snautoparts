import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ProductCardData } from '../../../core/models';

/**
 * Product Card Component
 * Displays product summary in a grid.
 */
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  readonly product = input.required<ProductCardData>();
  readonly showAddToCart = input(true);
  readonly showRating = input(true);

  readonly addToCart = output<ProductCardData>();

  readonly isOnSale = computed(() => {
    const p = this.product();
    return !!(p.compareAtPrice && p.compareAtPrice > p.price);
  });

  readonly discountPercentage = computed(() => {
    const p = this.product();
    if (!this.isOnSale() || !p.compareAtPrice) return 0;
    return Math.round((1 - p.price / p.compareAtPrice) * 100);
  });

  readonly stockStatusLabel = computed(() => {
    switch (this.product().stockStatus) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return '';
    }
  });

  readonly stockStatusClass = computed(() => {
    return `stock--${this.product().stockStatus.replace('_', '-')}`;
  });

  readonly starArray = [1, 2, 3, 4, 5];

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.product().stockStatus !== 'out_of_stock') {
      this.addToCart.emit(this.product());
    }
  }
}
