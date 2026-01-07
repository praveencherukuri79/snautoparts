import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '@core/services';
import { Product } from '@core/models';
import { DataTableComponent, TableColumn } from '@shared/components/data-table/data-table.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent, ButtonComponent],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
})
export class ProductsListComponent implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);

  products = signal<Product[]>([]);
  isLoading = signal(true);
  total = signal(0);
  currentPage = signal(1);
  pageSize = 20;

  columns: TableColumn<Product>[] = [
    { key: 'name', label: 'Product', sortable: true },
    { key: 'sku', label: 'SKU' },
    { key: 'price', label: 'Price', sortable: true, align: 'right' },
    { key: 'stockQuantity', label: 'Stock', align: 'right' },
    { key: 'isActive', label: 'Status' },
  ];

  async ngOnInit(): Promise<void> {
    await this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    this.isLoading.set(true);
    try {
      const result = await this.productService.getProducts({
        page: this.currentPage(),
        limit: this.pageSize,
      });
      this.products.set(result.data);
      this.total.set(result.meta.total);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onPageChange(page: number): Promise<void> {
    this.currentPage.set(page);
    await this.loadProducts();
  }

  navigateToProduct(product: Product): void {
    this.router.navigate(['/admin/products', product.id]);
  }
}

