import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CatalogService } from '../../../core/services/catalog.service';
import { AdminService } from '../../../core/services/admin.service';
import { Product } from '../../../core/models/product.model';
import { APP_CONTENT } from '../../../core/content/app.content';
import { getProductImage } from '../../../core/constants/images';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, LoadingSpinnerComponent, CurrencyPipe],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.css',
})
export class InventoryListComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private adminService = inject(AdminService);

  content = APP_CONTENT;
  products = signal<Product[]>([]);
  loading = signal(true);
  searchQuery = '';
  showLowStockOnly = false;

  // Modal state
  adjustModalOpen = signal(false);
  selectedProduct = signal<Product | null>(null);
  newQuantity = 0;
  adjustmentReason = '';
  adjustmentNote = '';
  submitting = signal(false);

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.catalogService.getProducts({ search: this.searchQuery || undefined }).subscribe({
      next: (result) => {
        let prods = result.products;
        if (this.showLowStockOnly) {
          prods = prods.filter((p) => p.stockQuantity <= p.lowStockThreshold);
        }
        this.products.set(prods);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.loadProducts();
  }

  getStockStatus(product: Product): 'low' | 'out' | 'ok' {
    if (product.stockQuantity === 0) return 'out';
    if (product.stockQuantity <= product.lowStockThreshold) return 'low';
    return 'ok';
  }

  getStockClass(product: Product): string {
    const status = this.getStockStatus(product);
    if (status === 'out') return 'text-red-600';
    if (status === 'low') return 'text-amber-600';
    return 'text-green-600';
  }

  getProductImage(product: Product | null): string {
    if (!product) return getProductImage(null);
    if (product.imageUrl) return product.imageUrl;
    if (product.images?.[0]) return product.images[0];
    return getProductImage(null);
  }

  getLowStockCount(): number {
    return this.products().filter(p => this.getStockStatus(p) === 'low').length;
  }

  getOutOfStockCount(): number {
    return this.products().filter(p => this.getStockStatus(p) === 'out').length;
  }

  // Modal functions
  openAdjustModal(product: Product): void {
    this.selectedProduct.set(product);
    this.newQuantity = product.stockQuantity;
    this.adjustmentReason = '';
    this.adjustmentNote = '';
    this.adjustModalOpen.set(true);
  }

  closeAdjustModal(): void {
    this.adjustModalOpen.set(false);
    this.selectedProduct.set(null);
  }

  incrementQuantity(): void {
    this.newQuantity++;
  }

  decrementQuantity(): void {
    if (this.newQuantity > 0) {
      this.newQuantity--;
    }
  }

  getQuantityChange(): number {
    const product = this.selectedProduct();
    if (!product) return 0;
    return this.newQuantity - product.stockQuantity;
  }

  canSubmitAdjustment(): boolean {
    return this.getQuantityChange() !== 0 && !!this.adjustmentReason;
  }

  submitAdjustment(): void {
    const product = this.selectedProduct();
    if (!product || !this.canSubmitAdjustment()) return;

    this.submitting.set(true);
    const change = this.getQuantityChange();

    this.adminService.updateProductStock(
      product.id,
      change,
      this.adjustmentNote || this.adjustmentReason,
      this.adjustmentReason as 'RECEIVED' | 'SOLD' | 'RETURNED' | 'DAMAGED' | 'ADJUSTMENT' | 'TRANSFER'
    ).subscribe({
      next: (result) => {
        // Update the product in the list
        this.products.update(products => 
          products.map(p => p.id === product.id ? result.product : p)
        );
        this.submitting.set(false);
        this.closeAdjustModal();
      },
      error: () => {
        this.submitting.set(false);
        alert('Failed to adjust stock. Please try again.');
      },
    });
  }
}
