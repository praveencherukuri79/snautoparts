import { Component, inject, signal, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError, takeUntil } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { CatalogService } from '../../../core/services/catalog.service';
import { Product } from '../../../core/models/product.model';
import { APP_CONTENT } from '../../../core/content/app.content';
import { getProductImage } from '../../../core/constants/images';

@Component({
  selector: 'app-search-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  templateUrl: './search-dropdown.component.html',
  styleUrl: './search-dropdown.component.css',
})
export class SearchDropdownComponent implements OnInit, OnDestroy {
  private catalogService = inject(CatalogService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  content = APP_CONTENT;
  
  isOpen = signal(false);
  searchQuery = signal('');
  results = signal<Product[]>([]);
  loading = signal(false);
  recentSearches = signal<string[]>([]);

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('sn_recent_searches');
    if (saved) {
      try {
        this.recentSearches.set(JSON.parse(saved).slice(0, 5));
      } catch {
        // ignore
      }
    }

    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) {
          return of([]);
        }
        this.loading.set(true);
        return this.catalogService.getProducts({ search: query, limit: 6 }).pipe(
          catchError(() => of({ products: [] }))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(result => {
      const products = Array.isArray(result) ? result : result.products || [];
      this.results.set(products);
      this.loading.set(false);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  onInputChange(value: string): void {
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  onInputFocus(): void {
    this.open();
  }

  search(): void {
    const query = this.searchQuery();
    if (query && query.length >= 2) {
      this.saveRecentSearch(query);
      this.router.navigate(['/products'], { queryParams: { search: query } });
      this.close();
      this.searchQuery.set('');
      this.results.set([]);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.search();
    }
  }

  selectProduct(product: Product): void {
    this.router.navigate(['/products', product.slug]);
    this.close();
    this.searchQuery.set('');
    this.results.set([]);
  }

  selectRecentSearch(term: string): void {
    this.searchQuery.set(term);
    this.searchSubject.next(term);
  }

  clearRecentSearches(): void {
    this.recentSearches.set([]);
    localStorage.removeItem('sn_recent_searches');
  }

  private saveRecentSearch(term: string): void {
    const current = this.recentSearches();
    const updated = [term, ...current.filter(s => s !== term)].slice(0, 5);
    this.recentSearches.set(updated);
    localStorage.setItem('sn_recent_searches', JSON.stringify(updated));
  }

  getProductImage(product: Product): string {
    return getProductImage(product.imageUrl);
  }
}

