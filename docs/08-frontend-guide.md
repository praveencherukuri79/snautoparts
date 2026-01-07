# 08. Frontend Development Guide

Complete guide to frontend development practices, patterns, and conventions for the SN Auto Parts Angular application.

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                    # Core functionality
│   │   │   ├── constants/           # App constants
│   │   │   ├── content/             # Centralized text content
│   │   │   ├── guards/              # Route guards
│   │   │   ├── interceptors/        # HTTP interceptors
│   │   │   ├── models/              # TypeScript interfaces
│   │   │   └── services/            # API services
│   │   ├── features/                # Feature modules
│   │   └── shared/                  # Shared components
│   ├── assets/                      # Static assets
│   │   ├── icons/                   # SVG icons
│   │   └── images/                  # Images
│   ├── environments/                # Environment configs
│   └── styles/                      # Global styles
│       ├── tokens.css              # CSS variables
│       ├── theme.light.css          # Light theme
│       ├── theme.dark.css           # Dark theme
│       ├── globals.css              # Global styles
│       ├── components.css           # Reusable components
│       └── utilities.css            # Utility classes
├── angular.json                     # Angular CLI config
├── package.json                     # Dependencies
├── tailwind.config.js              # Tailwind config
└── tsconfig.json                   # TypeScript config
```

---

## Component Patterns

### Standalone Components

All components are standalone (no NgModules):

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  // Component logic
}
```

### Component File Structure

Every component has three separate files:
- `component-name.component.ts` - TypeScript logic
- `component-name.component.html` - Template
- `component-name.component.css` - Styles

**Never use inline templates or styles.**

---

## State Management with Signals

### Service Pattern

```typescript
import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private api = inject(ApiService);
  
  // Private state signal
  private cartState = signal<Cart | null>(null);
  
  // Public readonly signals
  readonly cart = this.cartState.asReadonly();
  readonly itemCount = computed(() => 
    this.cartState()?.itemCount ?? 0
  );
  readonly subtotal = computed(() => 
    this.cartState()?.subtotal ?? 0
  );
  
  // Methods to update state
  loadCart(): Observable<Cart> {
    return this.api.get<Cart>('/customer/cart').pipe(
      tap(cart => this.cartState.set(cart))
    );
  }
  
  addItem(productId: string, quantity: number): Observable<Cart> {
    return this.api.post<Cart>('/customer/cart/items', {
      productId,
      quantity
    }).pipe(
      tap(cart => this.cartState.set(cart))
    );
  }
}
```

### Component Usage

```typescript
import { Component, inject } from '@angular/core';
import { CartService } from '../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html'
})
export class CartComponent {
  private cartService = inject(CartService);
  
  // Use readonly signals
  readonly cart = this.cartService.cart;
  readonly itemCount = this.cartService.itemCount;
  readonly subtotal = this.cartService.subtotal;
  
  addItem(productId: string) {
    this.cartService.addItem(productId, 1).subscribe();
  }
}
```

### Template Usage

```html
@if (cart(); as cartData) {
  <div class="cart-items">
    @for (item of cartData.items; track item.id) {
      <div class="cart-item">
        {{ item.product.name }} - {{ item.quantity }}
      </div>
    }
  </div>
  <div class="cart-total">
    Total: {{ subtotal() | currency }}
  </div>
} @else {
  <p>Cart is empty</p>
}
```

---

## Forms - Reactive Forms Only

### Form Setup

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout-address',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './checkout-address.component.html'
})
export class CheckoutAddressComponent {
  private fb = inject(FormBuilder);
  
  addressForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(1)]],
    lastName: ['', [Validators.required, Validators.minLength(1)]],
    street: ['', Validators.required],
    apartment: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    country: ['US'],
    phone: ['']
  });
  
  onSubmit() {
    if (this.addressForm.valid) {
      const address = this.addressForm.value;
      // Process address
    }
  }
}
```

### Template

```html
<form [formGroup]="addressForm" (ngSubmit)="onSubmit()">
  <div class="form-group">
    <label>First Name</label>
    <input formControlName="firstName" />
    @if (addressForm.get('firstName')?.hasError('required') && 
         addressForm.get('firstName')?.touched) {
      <span class="error">First name is required</span>
    }
  </div>
  
  <!-- More form fields -->
  
  <button type="submit" [disabled]="addressForm.invalid">
    Continue
  </button>
</form>
```

---

## API Service Pattern

### Base API Service

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}`;
  
  get<T>(endpoint: string, params?: Record<string, unknown>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, String(params[key]));
        }
      });
    }
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }
  
  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }
  
  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body);
  }
  
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }
}
```

### Domain Service

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private api = inject(ApiService);
  private mockData = inject(MockDataService);
  
  getProducts(filters?: ProductFilters): Observable<PaginatedProducts> {
    if (environment.enableMockData) {
      return this.mockData.getProducts(filters);
    }
    return this.api.get<PaginatedProducts>('/public/catalog/products', filters);
  }
}
```

---

## Mock Data System

### Environment Configuration

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  enableMockData: true, // Toggle mock data
};
```

### Mock Data Service

```typescript
@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  private products = MOCK_PRODUCTS;
  private cart: Cart = this.createEmptyCart();
  
  getProducts(filters?: ProductFilters): Observable<PaginatedProducts> {
    let filtered = [...this.products];
    
    // Apply filters
    if (filters?.categoryId) {
      filtered = filtered.filter(p => p.categoryId === filters.categoryId);
    }
    
    // Simulate API delay
    return of({
      data: filtered,
      meta: { page: 1, limit: 20, total: filtered.length, totalPages: 1 }
    }).pipe(delay(300));
  }
}
```

### Switching Between Mock and Real API

All services check `environment.enableMockData`:

```typescript
if (environment.enableMockData) {
  return this.mockData.getProducts();
} else {
  return this.api.get('/public/catalog/products');
}
```

---

## Content Management

### Centralized Content

**File:** `src/app/core/content/app.content.ts`

```typescript
export const APP_CONTENT = {
  brand: {
    name: 'SN Auto Parts',
    tagline: 'Quality Parts. Guaranteed Fitment.',
  },
  navigation: {
    home: 'Home',
    shop: 'Shop',
    cart: 'Cart',
  },
  cart: {
    empty: 'Your cart is empty',
    addToCart: 'Add to Cart',
    checkout: 'Proceed to Checkout',
  },
  // ... more content
};
```

### Component Usage

```typescript
import { APP_CONTENT } from '../core/content/app.content';

@Component({...})
export class CartComponent {
  readonly content = APP_CONTENT;
}
```

```html
<h1>{{ content.cart.title }}</h1>
<p>{{ content.cart.empty }}</p>
<button>{{ content.cart.checkout }}</button>
```

**Benefits:**
- Easy content updates
- i18n ready
- No hardcoded strings in templates

---

## Styling Approach

### CSS Variables (Design Tokens)

**File:** `src/styles/tokens.css`

```css
:root {
  /* Colors */
  --color-primary: #137fec;
  --color-primary-hover: #0f6bd0;
  --color-bg: #ffffff;
  --color-surface: #f6f7f8;
  --color-text: #111418;
  --color-text-muted: #617589;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
}
```

### Component Styles

```css
/* component.component.css */
.product-card {
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-normal);
}

.product-card:hover {
  box-shadow: var(--shadow-md);
}

.product-title {
  color: var(--color-text);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-sm);
}
```

### Tailwind Utilities

Use Tailwind for layout and utilities only:

```html
<div class="flex items-center justify-between p-4">
  <h2 class="text-lg font-semibold">Products</h2>
  <button class="px-4 py-2 bg-primary text-white rounded">
    Add Product
  </button>
</div>
```

### Theme Support

**File:** `src/styles/theme.dark.css`

```css
[data-theme="dark"] {
  --color-bg: #101922;
  --color-surface: #1b2631;
  --color-text: #ffffff;
  --color-text-muted: #9ca3af;
}
```

---

## Routing

### Route Configuration

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadChildren: () => import('./features/checkout/checkout.routes')
      .then(m => m.checkoutRoutes),
  },
  {
    path: 'manager',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MANAGER', 'ADMIN'] },
    loadChildren: () => import('./features/manager/manager.routes')
      .then(m => m.managerRoutes),
  },
];
```

### Lazy Loading

All feature modules are lazy-loaded:

```typescript
{
  path: 'checkout',
  loadChildren: () => import('./features/checkout/checkout.routes')
    .then(m => m.checkoutRoutes),
}
```

---

## HTTP Interceptors

### Auth Interceptor

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
```

### Error Interceptor

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Handle unauthorized
        inject(Router).navigate(['/login']);
      } else if (error.status === 403) {
        // Handle forbidden
        inject(Router).navigate(['/']);
      }
      return throwError(() => error);
    })
  );
};
```

---

## Environment Configuration

### Development Environment

```typescript
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  stripePublishableKey: 'pk_test_...',
  enableMockData: true,
};
```

### Production Environment

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.snautoparts.com/api/v1',
  stripePublishableKey: 'pk_live_...',
  enableMockData: false,
};
```

---

## Building and Deployment

### Development Build

```bash
npm start
# Runs on http://localhost:4200
```

### Production Build

```bash
npm run build
# Output: dist/snautoparts/browser/
```

### Build Configuration

**angular.json:**
```json
{
  "projects": {
    "snautoparts": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/snautoparts/browser",
            "optimization": true,
            "sourceMap": false,
            "extractCss": true
          }
        }
      }
    }
  }
}
```

---

## Best Practices

### DO

- ✅ Use standalone components
- ✅ Use Angular Signals for state
- ✅ Use Reactive Forms for all forms
- ✅ Use CSS variables for styling
- ✅ Centralize text content
- ✅ Lazy load feature modules
- ✅ Use TypeScript strict mode
- ✅ Handle errors gracefully
- ✅ Use readonly signals in components
- ✅ Validate forms properly

### DON'T

- ❌ Use NgModules
- ❌ Use NgRx or other state management libraries
- ❌ Use TanStack Query
- ❌ Hardcode text in templates
- ❌ Hardcode colors/spacing in component CSS
- ❌ Use inline templates/styles
- ❌ Mix template-driven and reactive forms
- ❌ Mutate signals directly in components
- ❌ Skip error handling
- ❌ Ignore TypeScript errors

---

## Testing Considerations

### Unit Testing

```typescript
import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { ApiService } from './api.service';

describe('CartService', () => {
  let service: CartService;
  let apiService: jasmine.SpyObj<ApiService>;
  
  beforeEach(() => {
    apiService = jasmine.createSpyObj('ApiService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: ApiService, useValue: apiService }
      ]
    });
    service = TestBed.inject(CartService);
  });
  
  it('should load cart', () => {
    const mockCart = { id: '1', items: [] };
    apiService.get.and.returnValue(of(mockCart));
    
    service.loadCart().subscribe();
    
    expect(service.cart()).toEqual(mockCart);
  });
});
```

---

**Next:** [09. Backend Guide](09-backend-guide.md) | [Back to Index](README.md)

