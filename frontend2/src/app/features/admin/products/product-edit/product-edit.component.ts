import { Component, inject, signal, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductService, NotificationService } from '@core/services';
import { Product } from '@core/models';
import { CardComponent } from '@shared/primitives/card/card.component';
import { FormFieldComponent } from '@shared/primitives/form-field/form-field.component';
import { SelectOption } from '@shared/primitives/select/select.component';
import { ButtonComponent } from '@shared/primitives/button/button.component';
import { SpinnerComponent } from '@shared/primitives/spinner/spinner.component';
import { markFormTouched } from '@shared/utils/form.utils';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    CardComponent,
    FormFieldComponent,
    ButtonComponent,
    SpinnerComponent,
  ],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss',
})
export class ProductEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  id = input<string>();

  product = signal<Product | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    sku: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    description: [''],
    shortDescription: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    compareAtPrice: [null],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    categoryId: [''],
    brandId: [''],
    isActive: [true],
    isFeatured: [false],
  });

  get isEditMode(): boolean {
    return !!this.id();
  }

  // Type-safe form control getters
  get nameControl(): FormControl {
    return this.form.get('name') as FormControl;
  }
  get skuControl(): FormControl {
    return this.form.get('sku') as FormControl;
  }
  get slugControl(): FormControl {
    return this.form.get('slug') as FormControl;
  }
  get shortDescriptionControl(): FormControl {
    return this.form.get('shortDescription') as FormControl;
  }
  get priceControl(): FormControl {
    return this.form.get('price') as FormControl;
  }
  get compareAtPriceControl(): FormControl {
    return this.form.get('compareAtPrice') as FormControl;
  }
  get stockQuantityControl(): FormControl {
    return this.form.get('stockQuantity') as FormControl;
  }

  async ngOnInit(): Promise<void> {
    if (this.isEditMode) {
      this.isLoading.set(true);
      try {
        const product = await this.productService.getProduct(this.id()!);
        this.product.set(product);
        this.form.patchValue(product);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      markFormTouched(this.form);
      return;
    }

    this.isSaving.set(true);
    try {
      if (this.isEditMode) {
        await this.productService.updateProduct(this.id()!, this.form.value);
        this.notification.success('Product updated successfully');
      } else {
        await this.productService.createProduct(this.form.value);
        this.notification.success('Product created successfully');
        this.router.navigate(['/admin/products']);
      }
    } catch {
      this.notification.error('Failed to save product');
    } finally {
      this.isSaving.set(false);
    }
  }
}

