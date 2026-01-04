import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { SearchDropdownComponent } from '../search-dropdown/search-dropdown.component';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { APP_CONTENT } from '../../../core/content/app.content';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, SearchDropdownComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  content = APP_CONTENT;
  mobileMenuOpen = signal(false);

  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly user = this.authService.user;
  readonly userRole = this.authService.userRole;
  readonly cartItemCount = this.cartService.itemCount;

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenu();
  }

  get showManagerLink(): boolean {
    const role = this.userRole();
    return role === 'MANAGER' || role === 'ADMIN';
  }

  get showAdminLink(): boolean {
    return this.userRole() === 'ADMIN';
  }

  get displayName(): string {
    const u = this.user();
    if (!u) return 'Account';
    return u.firstName || u.name?.split(' ')[0] || 'Account';
  }
}

