import { Component, input, ContentChild, AfterContentInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, NgControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export type FormFieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
export type FormFieldAppearance = 'fill' | 'outline';

/**
 * FormField Component
 * Flexible form field wrapper with dual modes:
 * 1. With control input (standalone field using Material)
 * 2. With content projection (custom content)
 */
@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
})
export class FormFieldComponent implements AfterContentInit {
  readonly label = input.required<string>();
  readonly control = input<FormControl>();
  readonly type = input<FormFieldType>('text');
  readonly placeholder = input('');
  readonly hint = input('');
  readonly appearance = input<FormFieldAppearance>('outline');
  readonly prefixIcon = input<string>();
  readonly suffixIcon = input<string>();
  readonly showPasswordToggle = input(false);
  readonly required = input(false);

  @ContentChild(NgControl) ngControl?: NgControl;

  showPassword = signal(false);

  readonly useContentProjection = computed(() => !this.control());

  readonly activeControl = computed(() => {
    const ctrl = this.control();
    if (ctrl) return ctrl;
    if (this.ngControl?.control instanceof FormControl) {
      return this.ngControl.control;
    }
    return null;
  });

  readonly inputType = computed(() => {
    if (this.type() === 'password' && this.showPassword()) {
      return 'text';
    }
    return this.type();
  });

  readonly hasError = computed(() => {
    const ctrl = this.activeControl();
    if (!ctrl) return false;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  });

  readonly errorMessage = computed(() => {
    const ctrl = this.activeControl();
    if (!ctrl || !ctrl.errors) return '';

    const errors = ctrl.errors;
    const label = this.label();

    if (errors['required']) return `${label} is required`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters required`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
    if (errors['min']) return `Value must be at least ${errors['min'].min}`;
    if (errors['max']) return `Value must be at most ${errors['max'].max}`;
    if (errors['pattern']) return 'Invalid format';
    if (errors['passwordMismatch']) return 'Passwords do not match';

    return 'Invalid value';
  });

  ngAfterContentInit(): void {
    // Content projection mode - child control should be available
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }
}
