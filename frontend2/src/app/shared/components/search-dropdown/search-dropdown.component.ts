import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { CatalogService } from '../../../core/services/catalog.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-search-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  templateUrl: './search-dropdown.component.html',
  styleUrl: './search-dropdown.component.scss',
})
export class SearchDropdownComponent {
  private catalogService = inject(CatalogService);
  private router = inject(Router);

  @Output() productSelected = new EventEmitter<Product>();

  searchControl = new FormControl('');
  results = signal<Product[]>([]);
  isLoading = signal(false);

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((term): term is string => typeof term === 'string' && term.length >= 2),
    ).subscribe(async (term) => {
      this.isLoading.set(true);
      try {
        const products = await this.catalogService.search(term);
        this.results.set(products);
      } finally {
        this.isLoading.set(false);
      }
    });
  }

  onSelect(event: MatAutocompleteSelectedEvent): void {
    const product = event.option.value as Product;
    this.productSelected.emit(product);
    this.router.navigate(['/products', product.slug]);
    this.searchControl.reset();
    this.results.set([]);
  }

  displayFn(product: Product): string {
    return product ? product.name : '';
  }

  clearSearch(): void {
    this.searchControl.reset();
    this.results.set([]);
  }
}

