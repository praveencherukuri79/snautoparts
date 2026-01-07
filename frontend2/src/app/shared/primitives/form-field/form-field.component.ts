import { Component, Input, ContentChild, AfterContentInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, NgControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export type FormFieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
export type FormFieldAppearance = 'fill' | 'outline';

/**
 * FormFieldComponent - Flexible form field wrapper
 * 
 * Usage Option 1: With control input (standalone field)
 * <app-form-field label="Email" [control]="emailControl" type="email" />
 * 
 * Usage Option 2: With content projection (custom content)
 * <app-form-field label="Email">
 *   <input formControlName="email" type="email" />
 * </app-form-field>
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
  ],
  templateUrl: './form-field.component.html',
  styleUrl: './form-field.component.scss',
})
export class FormFieldComponent implements AfterContentInit {
  // Required inputs
  @Input({ required: true }) label!: string;
  
  // Optional control - if provided, component renders its own input
  // If not provided, component expects content projection
  @Input() control?: FormControl;
  
  // Configuration inputs
  @Input() type: FormFieldType = 'text';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() appearance: FormFieldAppearance = 'outline';
  @Input() prefixIcon?: string;
  @Input() suffixIcon?: string;
  @Input() showPasswordToggle = false;
  @Input() required = false;

  // Content child for content projection mode
  @ContentChild(NgControl) ngControl?: NgControl;

  showPassword = signal(false);
  
  // Mode detection
  get useContentProjection(): boolean {
    return !this.control;
  }

  get activeControl(): FormControl | null {
    if (this.control) return this.control;
    if (this.ngControl?.control instanceof FormControl) {
      return this.ngControl.control;
    }
    return null;
  }

  ngAfterContentInit(): void {
    // Content projection mode - child control should be available
  }

  get inputType(): string {
    if (this.type === 'password' && this.showPassword()) {
      return 'text';
    }
    return this.type;
  }

  get hasError(): boolean {
    const ctrl = this.activeControl;
    if (!ctrl) return false;
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  get errorMessage(): string {
    const ctrl = this.activeControl;
    if (!ctrl || !ctrl.errors) return '';

    const errors = ctrl.errors;
    
    if (errors['required']) return `${this.label} is required`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} characters required`;
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
    if (errors['min']) return `Value must be at least ${errors['min'].min}`;
    if (errors['max']) return `Value must be at most ${errors['max'].max}`;
    if (errors['minValue']) return `Value must be at least ${errors['minValue'].min}`;
    if (errors['maxValue']) return `Value must be at most ${errors['maxValue'].max}`;
    if (errors['pattern']) return 'Invalid format';
    if (errors['phone']) return 'Please enter a valid phone number';
    if (errors['zipCode']) return 'Please enter a valid ZIP code';
    if (errors['passwordMismatch']) return 'Passwords do not match';
    if (errors['mismatch']) return 'Fields do not match';

    return 'Invalid value';
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }
}
