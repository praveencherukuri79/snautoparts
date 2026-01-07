# SN Auto Parts — Frontend Design Guidelines

> **Principle:** Build primitives first, compose pages from them. No duplicate CSS. No repeated logic.

## Core Rules

### 1. Component File Structure

**All Angular components MUST have separate files:**

```
component-name/
├── component-name.component.ts      # Component class
├── component-name.component.html    # Template
└── component-name.component.scss    # Styles (SCSS, not CSS)
```

```typescript
// ❌ BAD - inline template/styles
@Component({
  template: `<div>...</div>`,
  styles: [`...`]
})

// ✅ GOOD - separate files
@Component({
  templateUrl: './my.component.html',
  styleUrl: './my.component.scss',
})
```

### 2. Web First, Fully Responsive

| Page Type | Approach |
|-----------|----------|
| **Customer pages** | Web first, **fully responsive** (desktop → tablet → mobile) |
| **Manager/Admin pages** | Web first, **responsive optional** (desktop primary, tablet acceptable) |

```scss
// Breakpoints (mobile-up approach for customer pages)
$breakpoints: (
  'sm': 640px,   // Mobile landscape
  'md': 768px,   // Tablet
  'lg': 1024px,  // Desktop
  'xl': 1280px,  // Large desktop
);

// Usage in SCSS
.product-grid {
  display: grid;
  grid-template-columns: 1fr;              // Mobile: 1 column
  gap: var(--space-4);
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr); // Tablet: 2 columns
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr); // Desktop: 3 columns
  }
  
  @media (min-width: 1280px) {
    grid-template-columns: repeat(4, 1fr); // Large: 4 columns
  }
}
```

### 3. Dynamic Primitives with Props

**Primitives MUST be configurable via inputs (props).** One component, many use cases.

```typescript
// ❌ BAD - Multiple button components
<app-primary-button>
<app-secondary-button>
<app-icon-button>
<app-loading-button>

// ✅ GOOD - One button, many props
<app-button>Default</app-button>
<app-button variant="outline">Outline</app-button>
<app-button variant="text" size="sm">Small Text</app-button>
<app-button icon="save" [loading]="isSaving">Save</app-button>
<app-button [fullWidth]="true" size="lg">Full Width Large</app-button>
```

**Every primitive should support:**
- **Variants** — Visual style (primary, outline, text, etc.)
- **Sizes** — sm, md, lg
- **States** — disabled, loading, error
- **Responsive** — Adapts to container/screen

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [CSS Architecture](#2-css-architecture)
3. [Primitives (Level 1)](#3-primitives-level-1)
4. [Components (Level 2)](#4-components-level-2)
5. [Layouts (Level 3)](#5-layouts-level-3)
6. [Pages (Level 4)](#6-pages-level-4)
7. [Implementation Order](#7-implementation-order)
8. [Angular Material Usage](#8-angular-material-usage)
9. [When to Use Tailwind](#9-when-to-use-tailwind)
10. [Responsive Design (Customer Pages)](#10-responsive-design-customer-pages)
11. [Forms (Reactive Forms Only)](#11-forms-reactive-forms-only)

> ⚠️ **Rules:**  
> - All components use separate `.html` and `.scss` files  
> - Web first, fully responsive for customer pages  
> - Primitives accept props — one component, many use cases  
> - **Reactive Forms ONLY** — no template-driven forms  
> - Use shared form utilities everywhere

---

## 1. Design Philosophy

### The Component Pyramid

```
                    ┌─────────────┐
                    │   PAGES     │  ← Compose from layouts + components
                    ├─────────────┤
                ┌───┴─────────────┴───┐
                │      LAYOUTS        │  ← Compose from components
                ├─────────────────────┤
            ┌───┴─────────────────────┴───┐
            │       COMPONENTS            │  ← Compose from primitives
            ├─────────────────────────────┤
        ┌───┴─────────────────────────────┴───┐
        │           PRIMITIVES                │  ← Angular Material + custom
        └─────────────────────────────────────┘
```

### Core Rules

1. **Angular Material First** — Use Material components as the foundation
2. **Global CSS for Tokens** — Colors, spacing, typography in `styles/tokens.css`
3. **No Inline Styles** — All styling via CSS classes
4. **No Duplicate CSS** — If you write the same style twice, extract it
5. **Tailwind for Utilities Only** — Layout helpers, spacing, flexbox shortcuts
6. **Component Encapsulation** — Each component owns its specific styles

---

## 2. CSS Architecture

### File Structure

```
frontend/src/styles/
├── tokens.css          # Design tokens (CSS variables)
├── theme.light.css     # Light theme overrides
├── theme.dark.css      # Dark theme overrides
├── globals.css         # Global element styles (body, a, headings)
├── components.css      # Global component utilities
└── utilities.css       # Custom utility classes (use sparingly)
```

### tokens.css — Design Tokens

```css
:root {
  /* Colors */
  --color-primary: #f97316;
  --color-primary-hover: #ea580c;
  --color-primary-light: #fff7ed;
  
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-surface-elevated: #ffffff;
  
  --color-text-primary: #1e293b;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  
  --color-border: #e2e8f0;
  --color-border-strong: #cbd5e1;
  
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Dark theme colors */
  --color-dark-bg: #1a1a2e;
  --color-dark-surface: #16213e;
  --color-dark-text: #e2e8f0;
  
  /* Spacing (4px base) */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  
  /* Typography */
  --font-family: system-ui, -apple-system, sans-serif;
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Borders */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
  
  /* Z-index layers */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-tooltip: 400;
  --z-toast: 500;
}
```

### globals.css — Base Element Styles

```css
/* Apply tokens globally */
body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background-color: var(--color-background);
}

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-hover);
}
```

---

## 3. Primitives (Level 1)

Primitives are the smallest building blocks. Use **Angular Material** as the base.

### 3.1 Buttons

**Use:** `MatButtonModule`

**Props (Inputs):**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'outline' \| 'text'` | `'primary'` | Visual style |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `color` | `'primary' \| 'accent' \| 'warn'` | `'primary'` | Color theme |
| `icon` | `string` | - | Material icon name |
| `iconPosition` | `'start' \| 'end'` | `'start'` | Icon placement |
| `loading` | `boolean` | `false` | Show spinner |
| `disabled` | `boolean` | `false` | Disable button |
| `fullWidth` | `boolean` | `false` | 100% width |
| `type` | `'button' \| 'submit'` | `'button'` | Button type |

```typescript
// shared/primitives/button/button.component.ts
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  // Visual
  variant = input<'primary' | 'outline' | 'text'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  color = input<'primary' | 'accent' | 'warn'>('primary');
  
  // Icon
  icon = input<string>();
  iconPosition = input<'start' | 'end'>('start');
  
  // State
  loading = input(false);
  disabled = input(false);
  
  // Layout
  fullWidth = input(false);
  type = input<'button' | 'submit'>('button');
  
  // Computed
  isDisabled = computed(() => this.disabled() || this.loading());
  spinnerSize = computed(() => this.size() === 'sm' ? 14 : this.size() === 'lg' ? 20 : 16);
}
```

```html
<!-- shared/primitives/button/button.component.html -->
<button
  [mat-raised-button]="variant() === 'primary'"
  [mat-stroked-button]="variant() === 'outline'"
  [mat-button]="variant() === 'text'"
  [color]="color()"
  [type]="type()"
  [disabled]="isDisabled()"
  [class]="'btn--' + size()"
  [class.btn--full-width]="fullWidth()"
  [class.btn--loading]="loading()"
>
  <!-- Icon Start -->
  @if (icon() && iconPosition() === 'start' && !loading()) {
    <mat-icon class="btn__icon">{{ icon() }}</mat-icon>
  }
  
  <!-- Loading Spinner -->
  @if (loading()) {
    <mat-spinner [diameter]="spinnerSize()" />
  }
  
  <!-- Content -->
  <span class="btn__content">
    <ng-content />
  </span>
  
  <!-- Icon End -->
  @if (icon() && iconPosition() === 'end' && !loading()) {
    <mat-icon class="btn__icon">{{ icon() }}</mat-icon>
  }
</button>
```

```scss
// shared/primitives/button/button.component.scss
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  transition: all var(--transition-fast);
}

// Sizes
.btn--sm {
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-sm);
  min-height: 32px;
  
  .btn__icon {
    font-size: 16px;
    width: 16px;
    height: 16px;
  }
}

.btn--md {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-base);
  min-height: 40px;
}

.btn--lg {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-lg);
  min-height: 48px;
  
  .btn__icon {
    font-size: 24px;
    width: 24px;
    height: 24px;
  }
}

// Full width
.btn--full-width {
  width: 100%;
}

// Loading state
.btn--loading {
  .btn__content {
    opacity: 0.7;
  }
}
```

**Usage Examples:**

```html
<!-- Basic -->
<app-button>Click Me</app-button>

<!-- Variants -->
<app-button variant="outline">Cancel</app-button>
<app-button variant="text">Learn More</app-button>

<!-- Sizes -->
<app-button size="sm">Small</app-button>
<app-button size="lg">Large</app-button>

<!-- With Icon -->
<app-button icon="add">Add Item</app-button>
<app-button icon="arrow_forward" iconPosition="end">Next</app-button>

<!-- States -->
<app-button [loading]="isSaving">Save</app-button>
<app-button [disabled]="!isValid">Submit</app-button>

<!-- Full Width (responsive) -->
<app-button [fullWidth]="true" size="lg">Checkout</app-button>

<!-- Form Submit -->
<app-button type="submit" [loading]="isSubmitting">Submit Form</app-button>

<!-- Destructive -->
<app-button color="warn" icon="delete">Delete</app-button>
```
```

**Usage:**
```html
<app-button>Add to Cart</app-button>
<app-button variant="outline">Cancel</app-button>
<app-button icon="shopping_cart" [loading]="isAdding">Add to Cart</app-button>
```

### 3.2 Form Fields

**Use:** `MatFormFieldModule`, `MatInputModule`

```typescript
// shared/primitives/form-field/form-field.component.ts
@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
})
export class FormFieldComponent {
  label = input.required<string>();
  control = input.required<FormControl>();
  type = input<'text' | 'email' | 'password' | 'number'>('text');
  placeholder = input('');
  hint = input('');
  appearance = input<'fill' | 'outline'>('outline');
  
  errorMessage = computed(() => {
    const errors = this.control().errors;
    if (errors?.['required']) return `${this.label()} is required`;
    if (errors?.['email']) return 'Invalid email address';
    if (errors?.['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters`;
    return 'Invalid value';
  });
}
```

```html
<!-- shared/primitives/form-field/form-field.component.html -->
<mat-form-field [appearance]="appearance()" class="full-width">
  <mat-label>{{ label() }}</mat-label>
  <input
    matInput
    [type]="type()"
    [formControl]="control()"
    [placeholder]="placeholder()"
  />
  @if (hint()) {
    <mat-hint>{{ hint() }}</mat-hint>
  }
  @if (control().errors && control().touched) {
    <mat-error>{{ errorMessage() }}</mat-error>
  }
</mat-form-field>
```

```scss
// shared/primitives/form-field/form-field.component.scss
.full-width {
  width: 100%;
}
```
```

### 3.3 Checkbox

**Use:** `MatCheckboxModule`

```typescript
// shared/primitives/checkbox/checkbox.component.ts
@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [MatCheckboxModule, ReactiveFormsModule],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent {
  control = input.required<FormControl<boolean>>();
  color = input<'primary' | 'accent' | 'warn'>('primary');
}
```

```html
<!-- shared/primitives/checkbox/checkbox.component.html -->
<mat-checkbox [formControl]="control()" [color]="color()">
  <ng-content />
</mat-checkbox>
```

```scss
// shared/primitives/checkbox/checkbox.component.scss
:host {
  display: inline-block;
}
```
```

### 3.4 Select / Dropdown

**Use:** `MatSelectModule`

```typescript
// shared/primitives/select/select.component.ts
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, ReactiveFormsModule],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent {
  label = input.required<string>();
  control = input.required<FormControl>();
  options = input.required<{ value: string; label: string }[]>();
  placeholder = input('Select...');
}
```

```html
<!-- shared/primitives/select/select.component.html -->
<mat-form-field appearance="outline" class="full-width">
  <mat-label>{{ label() }}</mat-label>
  <mat-select [formControl]="control()" [placeholder]="placeholder()">
    @for (option of options(); track option.value) {
      <mat-option [value]="option.value">{{ option.label }}</mat-option>
    }
  </mat-select>
</mat-form-field>
```

```scss
// shared/primitives/select/select.component.scss
.full-width {
  width: 100%;
}
```
```

### 3.5 Badge / Chip

**Use:** Custom (simple status indicator)

```typescript
// shared/primitives/badge/badge.component.ts
@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  variant = input<'success' | 'warning' | 'error' | 'info' | 'neutral'>('neutral');
}
```

```html
<!-- shared/primitives/badge/badge.component.html -->
<span class="badge" [class]="'badge--' + variant()">
  <ng-content />
</span>
```

```scss
// shared/primitives/badge/badge.component.scss
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  
  &--success {
    background: #dcfce7;
    color: #166534;
  }
  
  &--warning {
    background: #fef9c3;
    color: #854d0e;
  }
  
  &--error {
    background: #fee2e2;
    color: #991b1b;
  }
  
  &--info {
    background: #dbeafe;
    color: #1e40af;
  }
  
  &--neutral {
    background: #f1f5f9;
    color: #475569;
  }
}
```
```

**Usage:**
```html
<app-badge variant="success">In Stock</app-badge>
<app-badge variant="warning">Low Stock</app-badge>
<app-badge variant="error">Out of Stock</app-badge>
```

### 3.6 Card

**Use:** `MatCardModule`

**Props (Inputs):**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Card title |
| `subtitle` | `string` | - | Card subtitle |
| `variant` | `'flat' \| 'outlined' \| 'elevated'` | `'flat'` | Visual style |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Content padding |
| `clickable` | `boolean` | `false` | Show hover effect |
| `actionsAlign` | `'start' \| 'end'` | `'end'` | Actions alignment |

```typescript
// shared/primitives/card/card.component.ts
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  // Content
  title = input<string>();
  subtitle = input<string>();
  
  // Visual
  variant = input<'flat' | 'outlined' | 'elevated'>('flat');
  padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
  
  // Behavior
  clickable = input(false);
  actionsAlign = input<'start' | 'end'>('end');
  
  @ContentChild('[card-actions]') hasActions = false;
}
```

```html
<!-- shared/primitives/card/card.component.html -->
<mat-card 
  [class]="'card--' + variant() + ' card--padding-' + padding()"
  [class.card--clickable]="clickable()"
>
  @if (title() || subtitle()) {
    <mat-card-header>
      @if (title()) {
        <mat-card-title>{{ title() }}</mat-card-title>
      }
      @if (subtitle()) {
        <mat-card-subtitle>{{ subtitle() }}</mat-card-subtitle>
      }
    </mat-card-header>
  }
  <mat-card-content>
    <ng-content />
  </mat-card-content>
  @if (hasActions) {
    <mat-card-actions [align]="actionsAlign()">
      <ng-content select="[card-actions]" />
    </mat-card-actions>
  }
</mat-card>
```

```scss
// shared/primitives/card/card.component.scss
// Variants
.card--flat {
  box-shadow: none;
  background: var(--color-surface);
}

.card--outlined {
  box-shadow: none;
  border: 1px solid var(--color-border);
}

.card--elevated {
  box-shadow: var(--shadow-lg);
}

// Padding
.card--padding-none mat-card-content { padding: 0; }
.card--padding-sm mat-card-content { padding: var(--space-3); }
.card--padding-md mat-card-content { padding: var(--space-4); }
.card--padding-lg mat-card-content { padding: var(--space-6); }

// Clickable
.card--clickable {
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    box-shadow: var(--shadow-xl);
    transform: translateY(-2px);
  }
}

// Responsive padding
@media (max-width: 640px) {
  .card--padding-lg mat-card-content {
    padding: var(--space-4);
  }
}
```

**Usage Examples:**

```html
<!-- Simple -->
<app-card>Content here</app-card>

<!-- With title -->
<app-card title="Order Summary" subtitle="3 items">
  ...
</app-card>

<!-- Variants -->
<app-card variant="outlined">Outlined card</app-card>
<app-card variant="elevated">Elevated card</app-card>

<!-- Clickable product card -->
<app-card variant="outlined" [clickable]="true" padding="sm" (click)="goToProduct()">
  <img [src]="product.image" />
  <h3>{{ product.name }}</h3>
</app-card>

<!-- With actions -->
<app-card title="Confirm Delete" variant="elevated">
  <p>Are you sure?</p>
  <div card-actions>
    <app-button variant="text">Cancel</app-button>
    <app-button color="warn">Delete</app-button>
  </div>
</app-card>
```
```

### 3.7 Dialog / Modal

**Use:** `MatDialogModule`

```typescript
// shared/primitives/dialog/dialog.service.ts
@Injectable({ providedIn: 'root' })
export class DialogService {
  private dialog = inject(MatDialog);

  confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }): Observable<boolean> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: options,
      width: '400px',
    });
    return ref.afterClosed();
  }

  open<T, R>(component: ComponentType<T>, config?: MatDialogConfig): MatDialogRef<T, R> {
    return this.dialog.open(component, {
      width: '600px',
      ...config,
    });
  }
}

// shared/primitives/dialog/confirm-dialog.component.ts
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">
        {{ data.cancelText || 'Cancel' }}
      </button>
      <button mat-raised-button color="primary" [mat-dialog-close]="true">
        {{ data.confirmText || 'Confirm' }}
      </button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  data = inject(MAT_DIALOG_DATA);
}
```

### 3.8 Toast / Snackbar

**Use:** `MatSnackBarModule`

```typescript
// shared/primitives/toast/toast.service.ts
@Injectable({ providedIn: 'root' })
export class ToastService {
  private snackBar = inject(MatSnackBar);

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  private show(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Close', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`toast-${type}`],
    });
  }
}
```

Add to `styles/components.css`:
```css
.toast-success { --mdc-snackbar-container-color: var(--color-success); }
.toast-error { --mdc-snackbar-container-color: var(--color-error); }
.toast-info { --mdc-snackbar-container-color: var(--color-info); }
```

### 3.9 Loading Spinner

**Use:** `MatProgressSpinnerModule`

```typescript
// shared/primitives/spinner/spinner.component.ts
@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.scss',
})
export class SpinnerComponent {
  size = input(40);
  color = input<'primary' | 'accent' | 'warn'>('primary');
}
```

```html
<!-- shared/primitives/spinner/spinner.component.html -->
<div class="spinner-container">
  <mat-spinner [diameter]="size()" [color]="color()" />
</div>
```

```scss
// shared/primitives/spinner/spinner.component.scss
.spinner-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
```
```

### 3.10 Icon

**Use:** `MatIconModule`

```typescript
// shared/primitives/icon/icon.component.ts
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  name = input.required<string>();
  size = input<'sm' | 'md' | 'lg'>('md');
}
```

```html
<!-- shared/primitives/icon/icon.component.html -->
<mat-icon [class]="'icon--' + size()">{{ name() }}</mat-icon>
```

```scss
// shared/primitives/icon/icon.component.scss
.icon--sm {
  font-size: 16px;
  width: 16px;
  height: 16px;
}

.icon--md {
  font-size: 24px;
  width: 24px;
  height: 24px;
}

.icon--lg {
  font-size: 32px;
  width: 32px;
  height: 32px;
}
```
```

### Primitives Summary

| Primitive | Angular Material | File |
|-----------|-----------------|------|
| Button | `MatButtonModule` | `primitives/button/` |
| Form Field | `MatFormFieldModule` | `primitives/form-field/` |
| Checkbox | `MatCheckboxModule` | `primitives/checkbox/` |
| Select | `MatSelectModule` | `primitives/select/` |
| Badge | Custom | `primitives/badge/` |
| Card | `MatCardModule` | `primitives/card/` |
| Dialog | `MatDialogModule` | `primitives/dialog/` |
| Toast | `MatSnackBarModule` | `primitives/toast/` |
| Spinner | `MatProgressSpinnerModule` | `primitives/spinner/` |
| Icon | `MatIconModule` | `primitives/icon/` |

---

## 4. Components (Level 2)

Components compose primitives into reusable UI patterns.

### 4.1 Product Card

```typescript
// shared/components/product-card/product-card.component.ts
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CardComponent, BadgeComponent, ButtonComponent, CurrencyPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<Product>();
  addToCart = output<Product>();
  
  private router = inject(Router);
  
  stockVariant = computed(() => {
    const qty = this.product().stockQuantity;
    if (qty === 0) return 'error';
    if (qty <= this.product().lowStockThreshold) return 'warning';
    return 'success';
  });
  
  stockLabel = computed(() => {
    const qty = this.product().stockQuantity;
    if (qty === 0) return 'Out of Stock';
    if (qty <= this.product().lowStockThreshold) return `Only ${qty} left`;
    return 'In Stock';
  });
  
  navigate() {
    this.router.navigate(['/products', this.product().slug]);
  }
  
  onAddToCart(event: Event) {
    event.stopPropagation();
    this.addToCart.emit(this.product());
  }
}
```

```html
<!-- shared/components/product-card/product-card.component.html -->
<app-card [clickable]="true" (click)="navigate()">
  <img [src]="product().imageUrl" [alt]="product().name" class="product-image" />
  
  <div class="product-info">
    <span class="product-sku">{{ product().sku }}</span>
    <h3 class="product-name">{{ product().name }}</h3>
    
    <div class="product-price">
      @if (product().compareAtPrice) {
        <span class="price-original">{{ product().compareAtPrice | currency }}</span>
      }
      <span class="price-current">{{ product().price | currency }}</span>
    </div>
    
    <app-badge [variant]="stockVariant()">{{ stockLabel() }}</app-badge>
  </div>
  
  <div card-actions>
    <app-button 
      icon="add_shopping_cart" 
      [disabled]="product().stockQuantity === 0"
      (click)="onAddToCart($event)"
    >
      Add to Cart
    </app-button>
  </div>
</app-card>
```

```scss
// shared/components/product-card/product-card.component.scss
.product-image {
  width: 100%;
  height: 200px;
  object-fit: contain;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}

.product-info {
  padding: var(--space-4) 0;
}

.product-sku {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.product-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  margin: var(--space-2) 0;
}

.product-price {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.price-original {
  text-decoration: line-through;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.price-current {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}
```
```

### 4.2 Search Dropdown

```typescript
// shared/components/search-dropdown/search-dropdown.component.ts
@Component({
  selector: 'app-search-dropdown',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatOptionModule],
  template: `
    <mat-form-field appearance="outline" class="search-field">
      <mat-icon matPrefix>search</mat-icon>
      <input
        matInput
        [formControl]="searchControl"
        [matAutocomplete]="auto"
        placeholder="Search parts by name, SKU, or vehicle..."
      />
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onSelect($event)">
        @for (result of results(); track result.id) {
          <mat-option [value]="result">
            <div class="search-result">
              <img [src]="result.imageUrl" class="result-image" />
              <div>
                <div class="result-name">{{ result.name }}</div>
                <div class="result-sku">{{ result.sku }}</div>
              </div>
              <span class="result-price">{{ result.price | currency }}</span>
            </div>
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styleUrl: './search-dropdown.component.css'
})
export class SearchDropdownComponent {
  searchControl = new FormControl('');
  results = signal<Product[]>([]);
  
  private catalog = inject(CatalogService);
  private router = inject(Router);
  
  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => term.length >= 2),
      switchMap(term => this.catalog.search(term))
    ).subscribe(results => this.results.set(results));
  }
  
  onSelect(event: MatAutocompleteSelectedEvent) {
    const product = event.option.value as Product;
    this.router.navigate(['/products', product.slug]);
    this.searchControl.reset();
  }
}
```

### 4.3 Fitment Selector

```typescript
// shared/components/fitment-selector/fitment-selector.component.ts
@Component({
  selector: 'app-fitment-selector',
  standalone: true,
  imports: [SelectComponent, ButtonComponent],
  template: `
    <div class="fitment-selector">
      <app-select
        label="Year"
        [control]="yearControl"
        [options]="yearOptions()"
        placeholder="Select Year"
      />
      <app-select
        label="Make"
        [control]="makeControl"
        [options]="makeOptions()"
        placeholder="Select Make"
      />
      <app-select
        label="Model"
        [control]="modelControl"
        [options]="modelOptions()"
        placeholder="Select Model"
      />
      <app-button 
        icon="search" 
        [disabled]="!isComplete()"
        (click)="search()"
      >
        Find Parts
      </app-button>
    </div>
  `,
  styles: [`
    .fitment-selector {
      display: flex;
      gap: var(--space-4);
      align-items: flex-end;
    }
  `]
})
export class FitmentSelectorComponent {
  // ... implementation
}
```

### 4.4 Data Table

```typescript
// shared/components/data-table/data-table.component.ts
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [MatTableModule, MatSortModule, MatPaginatorModule, MatCheckboxModule],
  template: `
    <div class="table-container">
      <table mat-table [dataSource]="dataSource()" matSort>
        @if (selectable()) {
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox
                (change)="toggleAll($event)"
                [checked]="isAllSelected()"
                [indeterminate]="isIndeterminate()"
              />
            </th>
            <td mat-cell *matCellDef="let row">
              <mat-checkbox
                (change)="toggleRow(row)"
                [checked]="isSelected(row)"
              />
            </td>
          </ng-container>
        }
        
        @for (col of columns(); track col.key) {
          <ng-container [matColumnDef]="col.key">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>{{ col.label }}</th>
            <td mat-cell *matCellDef="let row">
              <ng-container 
                [ngTemplateOutlet]="col.template || defaultCell"
                [ngTemplateOutletContext]="{ $implicit: row, column: col }"
              />
            </td>
          </ng-container>
        }
        
        <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
      </table>
      
      <mat-paginator
        [pageSize]="pageSize()"
        [pageSizeOptions]="[10, 20, 50]"
        showFirstLastButtons
      />
    </div>
    
    <ng-template #defaultCell let-row let-col="column">
      {{ row[col.key] }}
    </ng-template>
  `
})
export class DataTableComponent<T> {
  columns = input.required<Column[]>();
  dataSource = input.required<T[]>();
  selectable = input(false);
  pageSize = input(20);
  
  selection = output<T[]>();
  // ... implementation
}
```

### 4.5 Empty State

```typescript
// shared/components/empty-state/empty-state.component.ts
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [IconComponent, ButtonComponent],
  template: `
    <div class="empty-state">
      <app-icon [name]="icon()" size="lg" />
      <h3>{{ title() }}</h3>
      <p>{{ message() }}</p>
      @if (actionLabel()) {
        <app-button (click)="action.emit()">{{ actionLabel() }}</app-button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--space-12);
      text-align: center;
      color: var(--color-text-secondary);
    }
    h3 { margin: var(--space-4) 0 var(--space-2); color: var(--color-text-primary); }
    p { margin: 0 0 var(--space-6); }
  `]
})
export class EmptyStateComponent {
  icon = input('inbox');
  title = input('No results');
  message = input('');
  actionLabel = input<string>();
  action = output<void>();
}
```

### Components Summary

| Component | Composes | File |
|-----------|----------|------|
| Product Card | Card, Badge, Button | `components/product-card/` |
| Search Dropdown | FormField, Autocomplete | `components/search-dropdown/` |
| Fitment Selector | Select, Button | `components/fitment-selector/` |
| Data Table | Table, Checkbox, Paginator | `components/data-table/` |
| Empty State | Icon, Button | `components/empty-state/` |
| Pagination | MatPaginator | `components/pagination/` |
| Status Badge | Badge (configured) | `components/status-badge/` |
| Price Display | - | `components/price-display/` |
| Quantity Selector | Button, Input | `components/quantity-selector/` |
| Image Gallery | - | `components/image-gallery/` |

---

## 5. Layouts (Level 3)

Layouts define page structure. They compose components into shells.

### 5.1 Main Layout (Customer)

```typescript
// shared/layouts/main-layout/main-layout.component.ts
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {}
```

```html
<!-- shared/layouts/main-layout/main-layout.component.html -->
<div class="main-layout">
  <app-header />
  <main class="main-content">
    <router-outlet />
  </main>
  <app-footer />
</div>
```

```scss
// shared/layouts/main-layout/main-layout.component.scss
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: var(--space-6);
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}
```
```

### 5.2 Dashboard Layout (Manager/Admin)

```typescript
// shared/layouts/dashboard-layout/dashboard-layout.component.ts
@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [SidebarComponent, DashboardHeaderComponent, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  private featureConfig = inject(FeatureConfigService);
  navItems = computed(() => this.featureConfig.navigation());
}
```

```html
<!-- shared/layouts/dashboard-layout/dashboard-layout.component.html -->
<div class="dashboard-layout">
  <app-sidebar [items]="navItems()" />
  <div class="dashboard-main">
    <app-dashboard-header />
    <main class="dashboard-content">
      <router-outlet />
    </main>
  </div>
</div>
```

```scss
// shared/layouts/dashboard-layout/dashboard-layout.component.scss
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.dashboard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dashboard-content {
  flex: 1;
  padding: var(--space-6);
  background: var(--color-surface);
}
```
```

### 5.3 Auth Layout

```typescript
// shared/layouts/auth-layout/auth-layout.component.ts
@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {}
```

```html
<!-- shared/layouts/auth-layout/auth-layout.component.html -->
<div class="auth-layout">
  <div class="auth-brand">
    <img src="/assets/images/logo.png" alt="SN Auto Parts" />
    <h1>SN Auto Parts</h1>
  </div>
  <div class="auth-content">
    <router-outlet />
  </div>
</div>
```

```scss
// shared/layouts/auth-layout/auth-layout.component.scss
.auth-layout {
  display: flex;
  min-height: 100vh;
}

.auth-brand {
  flex: 1;
  background: var(--color-dark-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  
  img {
    max-width: 200px;
    margin-bottom: var(--space-6);
  }
  
  h1 {
    font-size: var(--font-size-3xl);
  }
}

.auth-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}
```
```

### 5.4 Checkout Layout

```typescript
// shared/layouts/checkout-layout/checkout-layout.component.ts
@Component({
  selector: 'app-checkout-layout',
  standalone: true,
  imports: [MatStepperModule, MatIconModule, RouterOutlet, RouterLink],
  templateUrl: './checkout-layout.component.html',
  styleUrl: './checkout-layout.component.scss',
})
export class CheckoutLayoutComponent {
  currentStep = input(0);
}
```

```html
<!-- shared/layouts/checkout-layout/checkout-layout.component.html -->
<div class="checkout-layout">
  <header class="checkout-header">
    <a routerLink="/">
      <img src="/assets/images/logo.png" alt="SN Auto Parts" class="logo" />
    </a>
    <span class="secure-badge">
      <mat-icon>lock</mat-icon> Secure Checkout
    </span>
  </header>
  
  <div class="checkout-container">
    <div class="checkout-steps">
      <mat-stepper [selectedIndex]="currentStep()" orientation="horizontal">
        <mat-step label="Shipping" />
        <mat-step label="Method" />
        <mat-step label="Payment" />
        <mat-step label="Review" />
      </mat-stepper>
    </div>
    
    <div class="checkout-content">
      <router-outlet />
    </div>
  </div>
</div>
```

```scss
// shared/layouts/checkout-layout/checkout-layout.component.scss
.checkout-layout {
  min-height: 100vh;
  background: var(--color-surface);
}

.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  
  .logo {
    height: 40px;
  }
}

.secure-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-success);
  font-weight: var(--font-weight-medium);
}

.checkout-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-6);
}

.checkout-steps {
  margin-bottom: var(--space-8);
}

.checkout-content {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
}
```
```

### Layout Summary

| Layout | Purpose | File |
|--------|---------|------|
| Main Layout | Customer pages (header + footer) | `layouts/main-layout/` |
| Dashboard Layout | Manager/Admin (sidebar) | `layouts/dashboard-layout/` |
| Auth Layout | Login/Register (split screen) | `layouts/auth-layout/` |
| Checkout Layout | Checkout flow (stepper) | `layouts/checkout-layout/` |

---

## 6. Pages (Level 4)

Pages are thin. They:
- Fetch data from services
- Pass data to components
- Handle user actions
- Use layouts for structure

**Example: Product Listing Page**

```typescript
// features/catalog/product-listing/product-listing.component.ts
@Component({
  selector: 'app-product-listing',
  standalone: true,
  imports: [
    ProductCardComponent,
    FitmentSelectorComponent,
    EmptyStateComponent,
    SpinnerComponent,
    PaginationComponent,
  ],
  templateUrl: './product-listing.component.html',
  styleUrl: './product-listing.component.scss',
})
export class ProductListingComponent {
  private catalog = inject(CatalogService);
  private cart = inject(CartService);
  
  products = signal<Product[]>([]);
  loading = signal(true);
  total = signal(0);
  pageSize = signal(20);
  currentPage = signal(1);
  
  async ngOnInit() {
    await this.loadProducts();
  }
  
  async loadProducts() {
    this.loading.set(true);
    const result = await this.catalog.getProducts({
      page: this.currentPage(),
      limit: this.pageSize(),
    });
    this.products.set(result.data);
    this.total.set(result.meta.total);
    this.loading.set(false);
  }
  
  onAddToCart(product: Product) {
    this.cart.addItem(product.id, 1);
  }
  
  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadProducts();
  }
}
```

```html
<!-- features/catalog/product-listing/product-listing.component.html -->
<div class="product-listing">
  <app-fitment-selector />
  
  <div class="listing-content">
    @if (loading()) {
      <div class="loading-container">
        <app-spinner />
      </div>
    } @else if (products().length === 0) {
      <app-empty-state
        icon="search_off"
        title="No products found"
        message="Try adjusting your filters"
      />
    } @else {
      <div class="listing-grid">
        @for (product of products(); track product.id) {
          <app-product-card
            [product]="product"
            (addToCart)="onAddToCart($event)"
          />
        }
      </div>
    }
  </div>
  
  @if (products().length > 0) {
    <app-pagination
      [total]="total()"
      [pageSize]="pageSize()"
      [currentPage]="currentPage()"
      (pageChange)="onPageChange($event)"
    />
  }
</div>
```

```scss
// features/catalog/product-listing/product-listing.component.scss
.product-listing {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.listing-content {
  min-height: 400px;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: var(--space-12);
}

.listing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}
```
```

---

## 7. Implementation Order

Build in this order to ensure consistency:

### Phase 1: Foundation (Week 1)
```
1. styles/tokens.css          ← Design tokens
2. styles/globals.css         ← Base styles
3. Angular Material theme     ← Configure Material
4. Tailwind config            ← Minimal utilities only
```

### Phase 2: Primitives (Week 1-2)
```
1. Icon
2. Spinner
3. Button
4. Form Field
5. Checkbox
6. Select
7. Badge
8. Card
9. Toast Service
10. Dialog Service
```

### Phase 3: Components (Week 2-3)
```
1. Empty State
2. Pagination
3. Search Dropdown
4. Product Card
5. Fitment Selector
6. Data Table
7. Quantity Selector
8. Price Display
9. Status Badge
10. Image Gallery
```

### Phase 4: Layouts (Week 3)
```
1. Header (Customer)
2. Footer
3. Main Layout
4. Sidebar
5. Dashboard Layout
6. Auth Layout
7. Checkout Layout
```

### Phase 5: Pages (Week 4+)
```
Build pages using the established components.
Each page should be thin - just data and composition.
```

---

## 8. Angular Material Usage

### Configure Theme

```scss
// styles.scss
@use '@angular/material' as mat;

$primary-palette: mat.define-palette(mat.$orange-palette, 600);
$accent-palette: mat.define-palette(mat.$blue-gray-palette, 700);

$theme: mat.define-light-theme((
  color: (
    primary: $primary-palette,
    accent: $accent-palette,
  ),
  typography: mat.define-typography-config(),
  density: 0,
));

@include mat.all-component-themes($theme);

// Override Material variables with our tokens
:root {
  --mdc-filled-button-container-color: var(--color-primary);
  --mdc-outlined-button-outline-color: var(--color-border);
  --mat-form-field-container-text-size: var(--font-size-base);
}
```

### Material Modules to Use

| Need | Use |
|------|-----|
| Buttons | `MatButtonModule` |
| Forms | `MatFormFieldModule`, `MatInputModule` |
| Selection | `MatCheckboxModule`, `MatRadioModule`, `MatSelectModule` |
| Tables | `MatTableModule`, `MatSortModule`, `MatPaginatorModule` |
| Dialogs | `MatDialogModule` |
| Feedback | `MatSnackBarModule`, `MatProgressSpinnerModule` |
| Navigation | `MatMenuModule`, `MatTabsModule`, `MatSidenavModule` |
| Cards | `MatCardModule` |
| Icons | `MatIconModule` |
| Chips | `MatChipsModule` |
| Stepper | `MatStepperModule` |

---

## 9. When to Use Tailwind

### ✅ DO Use Tailwind For:

```html
<!-- Layout utilities -->
<div class="flex items-center justify-between gap-4">

<!-- Spacing shortcuts -->
<div class="p-4 mt-6 mb-2">

<!-- Responsive design -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

<!-- Quick flex/grid -->
<div class="flex-1 shrink-0">
```

### ❌ DON'T Use Tailwind For:

```html
<!-- Colors - use tokens -->
<div class="bg-orange-500">  <!-- BAD -->
<div style="background: var(--color-primary)">  <!-- GOOD -->

<!-- Typography - use globals -->
<h1 class="text-4xl font-bold">  <!-- BAD -->
<h1>  <!-- GOOD - styled in globals.css -->

<!-- Component styling - use component CSS -->
<button class="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600">  <!-- BAD -->
<app-button>  <!-- GOOD -->
```

### Tailwind Config (Minimal)

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      // Map to CSS tokens - DON'T duplicate values
      colors: {
        primary: 'var(--color-primary)',
        surface: 'var(--color-surface)',
      },
      spacing: {
        // Use the scale directly, don't map
      },
    },
  },
  plugins: [],
  // Only enable utilities we actually use
  corePlugins: {
    preflight: false, // We use globals.css instead
  },
};
```

---

## Quick Reference

### File Structure

```
shared/
├── primitives/
│   ├── button/
│   ├── form-field/
│   ├── checkbox/
│   ├── select/
│   ├── badge/
│   ├── card/
│   ├── dialog/
│   ├── toast/
│   ├── spinner/
│   └── icon/
├── components/
│   ├── product-card/
│   ├── search-dropdown/
│   ├── fitment-selector/
│   ├── data-table/
│   ├── empty-state/
│   ├── pagination/
│   └── ...
└── layouts/
    ├── main-layout/
    ├── dashboard-layout/
    ├── auth-layout/
    └── checkout-layout/
```

### Import Hierarchy

```
Page
 └── imports Layout
      └── imports Components
           └── imports Primitives
                └── uses Angular Material
                     └── styled by tokens.css
```

### CSS Priority

1. `tokens.css` — Variables only, no rules
2. `globals.css` — Base element styles
3. Angular Material theme — Component library styles
4. Component `.css` files — Encapsulated styles
5. Tailwind utilities — Layout helpers (sparingly)

---

## 10. Responsive Design (Customer Pages)

### 10.1 Breakpoint System

```scss
// styles/_breakpoints.scss
$breakpoints: (
  'sm': 640px,   // Mobile landscape / large phone
  'md': 768px,   // Tablet portrait
  'lg': 1024px,  // Tablet landscape / small desktop
  'xl': 1280px,  // Desktop
  '2xl': 1536px, // Large desktop
);

// Mixin for mobile-first media queries
@mixin respond-to($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}

// Usage
.container {
  padding: var(--space-4);       // Mobile default
  
  @include respond-to('md') {
    padding: var(--space-6);     // Tablet+
  }
  
  @include respond-to('lg') {
    padding: var(--space-8);     // Desktop+
  }
}
```

### 10.2 Responsive Grid Patterns

```scss
// Product Grid - adapts from 1 to 4 columns
.product-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: 1fr;                        // Mobile: 1 col
  
  @include respond-to('sm') {
    grid-template-columns: repeat(2, 1fr);           // 640px+: 2 cols
  }
  
  @include respond-to('lg') {
    grid-template-columns: repeat(3, 1fr);           // 1024px+: 3 cols
  }
  
  @include respond-to('xl') {
    grid-template-columns: repeat(4, 1fr);           // 1280px+: 4 cols
    gap: var(--space-6);
  }
}

// Two-column layout (content + sidebar)
.page-with-sidebar {
  display: flex;
  flex-direction: column;                            // Mobile: stacked
  gap: var(--space-6);
  
  @include respond-to('lg') {
    flex-direction: row;                             // Desktop: side by side
    
    .main-content { flex: 1; }
    .sidebar { width: 320px; flex-shrink: 0; }
  }
}
```

### 10.3 Responsive Component Patterns

```typescript
// Component with responsive prop
@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  // Layout prop - parent decides orientation
  layout = input<'vertical' | 'horizontal'>('vertical');
}
```

```scss
// product-card.component.scss
:host {
  display: block;
}

.product-card {
  display: flex;
  flex-direction: column;                    // Vertical default
  
  &--horizontal {
    flex-direction: row;
    
    .product-image {
      width: 120px;
      flex-shrink: 0;
    }
  }
}

// Auto-switch based on container (future CSS)
@container (min-width: 400px) {
  .product-card {
    flex-direction: row;
  }
}
```

### 10.4 Responsive Typography

```scss
// styles/globals.scss
h1 {
  font-size: var(--font-size-2xl);           // Mobile: 24px
  
  @include respond-to('md') {
    font-size: var(--font-size-3xl);         // Tablet: 30px
  }
  
  @include respond-to('lg') {
    font-size: var(--font-size-4xl);         // Desktop: 36px
  }
}

h2 {
  font-size: var(--font-size-xl);            // Mobile: 20px
  
  @include respond-to('md') {
    font-size: var(--font-size-2xl);         // Tablet+: 24px
  }
}
```

### 10.5 Responsive Spacing

```scss
// Section padding
.section {
  padding: var(--space-6) var(--space-4);    // Mobile
  
  @include respond-to('md') {
    padding: var(--space-8) var(--space-6);  // Tablet
  }
  
  @include respond-to('lg') {
    padding: var(--space-12) var(--space-8); // Desktop
  }
}

// Container max-width
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  
  @include respond-to('md') {
    padding: 0 var(--space-6);
  }
}
```

### 10.6 Mobile Navigation Pattern

```typescript
// shared/components/header/header.component.ts
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  isMobileMenuOpen = signal(false);
  
  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }
}
```

```html
<!-- header.component.html -->
<header class="header">
  <div class="header__container">
    <!-- Logo -->
    <a routerLink="/" class="header__logo">
      <img src="/assets/images/logo.png" alt="SN Auto Parts" />
    </a>
    
    <!-- Desktop Nav (hidden on mobile) -->
    <nav class="header__nav header__nav--desktop">
      <a routerLink="/products">Products</a>
      <a routerLink="/categories">Categories</a>
    </nav>
    
    <!-- Actions -->
    <div class="header__actions">
      <app-button variant="text" icon="search" class="hide-mobile" />
      <app-button variant="text" icon="shopping_cart" />
      <app-button variant="text" icon="person" class="hide-mobile" />
      
      <!-- Mobile menu toggle -->
      <app-button 
        variant="text" 
        [icon]="isMobileMenuOpen() ? 'close' : 'menu'"
        class="show-mobile-only"
        (click)="toggleMobileMenu()"
      />
    </div>
  </div>
  
  <!-- Mobile Nav Drawer -->
  @if (isMobileMenuOpen()) {
    <nav class="header__nav header__nav--mobile">
      <a routerLink="/products" (click)="toggleMobileMenu()">Products</a>
      <a routerLink="/categories" (click)="toggleMobileMenu()">Categories</a>
      <a routerLink="/account" (click)="toggleMobileMenu()">My Account</a>
    </nav>
  }
</header>
```

```scss
// header.component.scss
.header {
  background: var(--color-dark-bg);
  color: white;
}

.header__container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  max-width: 1280px;
  margin: 0 auto;
}

.header__logo img {
  height: 32px;
  
  @include respond-to('md') {
    height: 40px;
  }
}

// Desktop nav - hidden on mobile
.header__nav--desktop {
  display: none;
  
  @include respond-to('md') {
    display: flex;
    gap: var(--space-6);
  }
}

// Mobile nav - full width drawer
.header__nav--mobile {
  display: flex;
  flex-direction: column;
  background: var(--color-dark-surface);
  padding: var(--space-4);
  
  a {
    padding: var(--space-3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  @include respond-to('md') {
    display: none;
  }
}

// Utility classes
.hide-mobile {
  display: none;
  @include respond-to('md') { display: inline-flex; }
}

.show-mobile-only {
  display: inline-flex;
  @include respond-to('md') { display: none; }
}
```

### 10.7 Responsive Tables (Data Table)

```scss
// For manager/admin tables - horizontal scroll on mobile
.data-table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  table {
    min-width: 800px; // Force horizontal scroll on small screens
  }
}

// Alternative: Card layout on mobile
.responsive-table {
  @include respond-to('lg') {
    // Table layout on desktop
    display: table;
  }
  
  // Card layout on mobile/tablet
  @media (max-width: 1023px) {
    .table-row {
      display: block;
      background: var(--color-surface);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      margin-bottom: var(--space-3);
      
      .table-cell {
        display: flex;
        justify-content: space-between;
        padding: var(--space-2) 0;
        
        &::before {
          content: attr(data-label);
          font-weight: var(--font-weight-medium);
        }
      }
    }
  }
}
```

### 10.8 Touch-Friendly Targets

```scss
// Minimum touch target size: 44x44px (Apple HIG)
.touchable {
  min-height: 44px;
  min-width: 44px;
  padding: var(--space-3);
}

// Larger tap targets on mobile
@media (max-width: 767px) {
  .nav-link,
  .list-item,
  .dropdown-option {
    min-height: 48px;
    padding: var(--space-3) var(--space-4);
  }
}
```

---

## 11. Forms (Reactive Forms Only)

### 11.1 Rules

```typescript
// ❌ NEVER use template-driven forms
<input [(ngModel)]="name">
<form #myForm="ngForm">

// ✅ ALWAYS use Reactive Forms
<input [formControl]="nameControl">
<form [formGroup]="myForm">
```

### 11.2 Form Utils Location

```
core/
└── utils/
    ├── form.utils.ts           # Form builder helpers
    ├── validators.utils.ts     # Custom validators
    └── form-error.utils.ts     # Error message mapping
```

### 11.3 Form Utilities

```typescript
// core/utils/form.utils.ts
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';

/**
 * Field configuration for createControl()
 */
export interface FieldConfig {
  value?: any;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string | RegExp;
  email?: boolean;
  phone?: boolean;
  custom?: (control: AbstractControl) => null | { [key: string]: any };
}

/**
 * Create a FormControl with validators from config
 */
export function createControl(config: FieldConfig = {}): FormControl {
  const validators = [];
  
  if (config.required) validators.push(Validators.required);
  if (config.minLength) validators.push(Validators.minLength(config.minLength));
  if (config.maxLength) validators.push(Validators.maxLength(config.maxLength));
  if (config.min !== undefined) validators.push(Validators.min(config.min));
  if (config.max !== undefined) validators.push(Validators.max(config.max));
  if (config.email) validators.push(Validators.email);
  if (config.pattern) validators.push(Validators.pattern(config.pattern));
  if (config.phone) validators.push(CustomValidators.phone);
  if (config.custom) validators.push(config.custom);
  
  return new FormControl(config.value ?? '', validators);
}

/**
 * Pre-built form templates - USE THESE!
 */
export const FormTemplates = {
  
  login(): FormGroup {
    return new FormGroup({
      email: createControl({ required: true, email: true }),
      password: createControl({ required: true, minLength: 8 }),
      rememberMe: new FormControl(false),
    });
  },

  register(): FormGroup {
    const form = new FormGroup({
      firstName: createControl({ required: true, minLength: 2 }),
      lastName: createControl({ required: true, minLength: 2 }),
      email: createControl({ required: true, email: true }),
      phone: createControl({ phone: true }),
      password: createControl({ required: true, minLength: 8 }),
      confirmPassword: createControl({ required: true }),
      acceptTerms: new FormControl(false, Validators.requiredTrue),
    });
    form.addValidators(CustomValidators.matchFields('password', 'confirmPassword'));
    return form;
  },

  address(): FormGroup {
    return new FormGroup({
      firstName: createControl({ required: true }),
      lastName: createControl({ required: true }),
      company: createControl({}),
      address1: createControl({ required: true }),
      address2: createControl({}),
      city: createControl({ required: true }),
      state: createControl({ required: true }),
      zipCode: createControl({ required: true, pattern: /^\d{5}(-\d{4})?$/ }),
      country: createControl({ required: true, value: 'US' }),
      phone: createControl({ required: true, phone: true }),
      isDefault: new FormControl(false),
    });
  },

  profile(): FormGroup {
    return new FormGroup({
      firstName: createControl({ required: true }),
      lastName: createControl({ required: true }),
      email: createControl({ required: true, email: true }),
      phone: createControl({ phone: true }),
    });
  },

  changePassword(): FormGroup {
    const form = new FormGroup({
      currentPassword: createControl({ required: true }),
      newPassword: createControl({ required: true, minLength: 8 }),
      confirmPassword: createControl({ required: true }),
    });
    form.addValidators(CustomValidators.matchFields('newPassword', 'confirmPassword'));
    return form;
  },

  product(): FormGroup {
    return new FormGroup({
      sku: createControl({ required: true }),
      name: createControl({ required: true, minLength: 3 }),
      slug: createControl({ required: true }),
      description: createControl({}),
      price: createControl({ required: true, min: 0.01 }),
      compareAtPrice: createControl({ min: 0 }),
      costPrice: createControl({ min: 0 }),
      categoryId: createControl({ required: true }),
      brandId: createControl({}),
      stockQuantity: createControl({ required: true, min: 0 }),
      lowStockThreshold: createControl({ min: 0, value: 10 }),
      isActive: new FormControl(true),
      isFeatured: new FormControl(false),
    });
  },

  savedVehicle(): FormGroup {
    return new FormGroup({
      nickname: createControl({ maxLength: 50 }),
      year: createControl({ required: true }),
      make: createControl({ required: true }),
      model: createControl({ required: true }),
      submodel: createControl({}),
      engine: createControl({}),
      isDefault: new FormControl(false),
    });
  },

  inventoryAdjustment(): FormGroup {
    return new FormGroup({
      productId: createControl({ required: true }),
      type: createControl({ required: true }),
      quantity: createControl({ required: true, min: 1 }),
      reason: createControl({ required: true }),
      notes: createControl({}),
    });
  },
};

/**
 * Mark all controls as touched (show errors on submit)
 */
export function markFormTouched(form: FormGroup): void {
  Object.values(form.controls).forEach(control => {
    control.markAsTouched();
    if (control instanceof FormGroup) {
      markFormTouched(control);
    }
  });
}

/**
 * Reset form to initial values
 */
export function resetForm(form: FormGroup, values?: Record<string, any>): void {
  form.reset(values);
  form.markAsPristine();
  form.markAsUntouched();
}
```

### 11.4 Custom Validators

```typescript
// core/utils/validators.utils.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const CustomValidators = {
  
  phone(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(control.value) ? null : { phone: true };
  },

  zipCode(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(control.value) ? null : { zipCode: true };
  },

  matchFields(field1: string, field2: string): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const control1 = form.get(field1);
      const control2 = form.get(field2);
      if (!control1 || !control2) return null;
      
      if (control1.value !== control2.value) {
        control2.setErrors({ ...control2.errors, mismatch: true });
        return { mismatch: true };
      }
      return null;
    };
  },

  creditCard(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = control.value.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(value)) return { creditCard: true };
    
    // Luhn algorithm
    let sum = 0, isEven = false;
    for (let i = value.length - 1; i >= 0; i--) {
      let digit = parseInt(value[i], 10);
      if (isEven) { digit *= 2; if (digit > 9) digit -= 9; }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0 ? null : { creditCard: true };
  },
};
```

### 11.5 Form Error Messages

```typescript
// core/utils/form-error.utils.ts

export const FORM_ERRORS: Record<string, string | ((params: any) => string)> = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minlength: (p) => `Minimum ${p.requiredLength} characters required`,
  maxlength: (p) => `Maximum ${p.requiredLength} characters allowed`,
  min: (p) => `Value must be at least ${p.min}`,
  max: (p) => `Value must be at most ${p.max}`,
  pattern: 'Invalid format',
  phone: 'Please enter a valid phone number',
  zipCode: 'Please enter a valid ZIP code',
  mismatch: 'Fields do not match',
  creditCard: 'Please enter a valid card number',
};

export function getErrorMessage(control: AbstractControl): string {
  if (!control.errors) return '';
  const errorKey = Object.keys(control.errors)[0];
  const errorValue = control.errors[errorKey];
  const message = FORM_ERRORS[errorKey];
  return typeof message === 'function' ? message(errorValue) : message || 'Invalid value';
}

export function shouldShowError(control: AbstractControl): boolean {
  return control.invalid && (control.dirty || control.touched);
}
```

### 11.6 Usage Example

```typescript
// features/auth/login/login.component.ts
import { FormTemplates, markFormTouched } from '@core/utils/form.utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  
  form = FormTemplates.login();  // ← Use pre-built template
  isSubmitting = signal(false);
  
  async onSubmit() {
    if (this.form.invalid) {
      markFormTouched(this.form);  // ← Show all errors
      return;
    }
    
    this.isSubmitting.set(true);
    try {
      await this.auth.login(this.form.value);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
```

```html
<!-- features/auth/login/login.component.html -->
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <app-form-field
    label="Email"
    type="email"
    [control]="form.controls.email"
  />
  
  <app-form-field
    label="Password"
    type="password"
    [control]="form.controls.password"
    [showPasswordToggle]="true"
  />
  
  <app-checkbox [control]="form.controls.rememberMe">
    Remember me
  </app-checkbox>
  
  <app-button type="submit" [fullWidth]="true" [loading]="isSubmitting()">
    Sign In
  </app-button>
</form>
```

### 11.7 Form Templates Summary

| Template | Fields |
|----------|--------|
| `FormTemplates.login()` | email, password, rememberMe |
| `FormTemplates.register()` | firstName, lastName, email, phone, password, confirmPassword, acceptTerms |
| `FormTemplates.address()` | firstName, lastName, company, address1, address2, city, state, zipCode, country, phone, isDefault |
| `FormTemplates.profile()` | firstName, lastName, email, phone |
| `FormTemplates.changePassword()` | currentPassword, newPassword, confirmPassword |
| `FormTemplates.product()` | sku, name, slug, description, price, categoryId, stockQuantity, etc. |
| `FormTemplates.savedVehicle()` | nickname, year, make, model, submodel, engine, isDefault |
| `FormTemplates.inventoryAdjustment()` | productId, type, quantity, reason, notes |

---

## Quick Reference

### Customer Page Checklist

- [ ] Works on 320px width (small mobile)
- [ ] Navigation collapses to hamburger menu
- [ ] Touch targets ≥ 44px
- [ ] Text readable without zooming (≥16px body)
- [ ] Images scale properly
- [ ] Forms are single-column on mobile
- [ ] Buttons are full-width on mobile where appropriate
- [ ] No horizontal scroll (except data tables)

### File Naming Convention

```
shared/
├── primitives/
│   └── button/
│       ├── button.component.ts
│       ├── button.component.html
│       └── button.component.scss
├── components/
│   └── product-card/
│       ├── product-card.component.ts
│       ├── product-card.component.html
│       └── product-card.component.scss
└── layouts/
    └── main-layout/
        ├── main-layout.component.ts
        ├── main-layout.component.html
        └── main-layout.component.scss
```

---

*Build primitives. Compose components. Assemble pages. Stay consistent. Stay responsive.*

