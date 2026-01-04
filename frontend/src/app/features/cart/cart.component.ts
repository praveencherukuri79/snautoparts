import { Component, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItem } from '../../core/models/cart.model';
import { APP_CONTENT } from '../../core/content/app.content';
import { getCartItemImage } from '../../core/constants/images';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    IconComponent,
    LoadingSpinnerComponent,
    CurrencyPipe,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  content = APP_CONTENT;

  readonly items = this.cartService.items;
  readonly subtotal = this.cartService.subtotal;
  readonly itemCount = this.cartService.itemCount;
  readonly isEmpty = this.cartService.isEmpty;
  readonly isLoading = this.cartService.isLoading;
  readonly isLoggedIn = this.authService.isLoggedIn;

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;
    if (newQuantity > 0 && newQuantity <= item.product.stockQuantity) {
      this.cartService.updateCartItem(item.id, { quantity: newQuantity }).subscribe();
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id).subscribe();
  }

  getPrimaryImage(item: CartItem): string {
    return getCartItemImage(item.product.imageUrl);
  }
}

