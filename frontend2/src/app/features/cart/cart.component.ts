import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService, NotificationService } from '@core/services';
import { Cart, CartItem } from '@core/services/cart.service';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { CardComponent } from '@shared/primitives/card/card.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { QuantitySelectorComponent } from '@shared/components/quantity-selector/quantity-selector.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { DialogService } from '@shared/primitives/dialog/dialog.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CurrencyPipe,
    ButtonComponent,
    CardComponent,
    SpinnerComponent,
    QuantitySelectorComponent,
    EmptyStateComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private notification = inject(NotificationService);
  private dialog = inject(DialogService);
  private router = inject(Router);

  cart = signal<Cart | null>(null);
  isLoading = signal(true);
  updatingItem = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.loadCart();
  }

  async loadCart(): Promise<void> {
    this.isLoading.set(true);
    try {
      const cart = await this.cartService.getCart();
      this.cart.set(cart);
    } finally {
      this.isLoading.set(false);
    }
  }

  get items(): CartItem[] {
    return this.cart()?.items ?? [];
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }

  get itemCount(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  get estimatedShipping(): number {
    // Free shipping over $50
    return this.subtotal >= 50 ? 0 : 9.99;
  }

  get total(): number {
    return this.subtotal + this.estimatedShipping;
  }

  async updateQuantity(item: CartItem, quantity: number): Promise<void> {
    if (quantity < 1) return;
    
    this.updatingItem.set(item.id);
    try {
      await this.cartService.updateItem(item.id, quantity);
      await this.loadCart();
    } finally {
      this.updatingItem.set(null);
    }
  }

  async removeItem(item: CartItem): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Remove Item',
      message: `Are you sure you want to remove "${item.product.name}" from your cart?`,
      confirmText: 'Remove',
      confirmColor: 'warn',
    }).toPromise();

    if (confirmed) {
      this.updatingItem.set(item.id);
      try {
        await this.cartService.removeItem(item.id);
        await this.loadCart();
        this.notification.success('Item removed from cart');
      } finally {
        this.updatingItem.set(null);
      }
    }
  }

  async clearCart(): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: 'Clear Cart',
      message: 'Are you sure you want to remove all items from your cart?',
      confirmText: 'Clear All',
      confirmColor: 'warn',
    }).toPromise();

    if (confirmed) {
      this.isLoading.set(true);
      try {
        await this.cartService.clearCart();
        await this.loadCart();
        this.notification.success('Cart cleared');
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  trackByItem(_index: number, item: CartItem): string {
    return item.id;
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }
}

