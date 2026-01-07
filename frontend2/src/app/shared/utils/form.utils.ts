import {
  AbstractControl,
  FormGroup,
  FormControl,
  ValidatorFn,
  Validators,
} from '@angular/forms';

/**
 * Form Utilities
 * Centralized utilities for Angular Reactive Forms with strong TypeScript types
 */

// ============================================
// ENUMS
// ============================================

/**
 * Form validation error keys
 */
export enum FormErrorKey {
  Required = 'required',
  Email = 'email',
  MinLength = 'minlength',
  MaxLength = 'maxlength',
  Min = 'min',
  Max = 'max',
  MinValue = 'minValue',
  MaxValue = 'maxValue',
  Pattern = 'pattern',
  Phone = 'phone',
  ZipCode = 'zipCode',
  PasswordMismatch = 'passwordMismatch',
  Mismatch = 'mismatch',
}

/**
 * Form field input types
 */
export enum FormFieldType {
  Text = 'text',
  Email = 'email',
  Password = 'password',
  Number = 'number',
  Tel = 'tel',
  Url = 'url',
  Textarea = 'textarea',
  Select = 'select',
  Checkbox = 'checkbox',
  Date = 'date',
}

// ============================================
// FORM VALUE INTERFACES
// ============================================

/**
 * Login form values
 */
export interface LoginFormValue {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Registration form values
 */
export interface RegisterFormValue {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

/**
 * Profile form values
 */
export interface ProfileFormValue {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

/**
 * Change password form values
 */
export interface ChangePasswordFormValue {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Forgot password form values
 */
export interface ForgotPasswordFormValue {
  email: string;
}

/**
 * Reset password form values
 */
export interface ResetPasswordFormValue {
  password: string;
  confirmPassword: string;
}

/**
 * Address form values
 */
export interface AddressFormValue {
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

/**
 * Vehicle form values
 */
export interface VehicleFormValue {
  nickname: string;
  year: number;
  make: string;
  model: string;
  submodel: string;
  engine: string;
  isDefault: boolean;
}

/**
 * Product form values
 */
export interface ProductFormValue {
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  categoryId: string;
  brandId: string;
  stockQuantity: number;
  lowStockThreshold: number;
  weight: number | null;
  isActive: boolean;
  isFeatured: boolean;
}

/**
 * Inventory adjustment form values
 */
export interface InventoryAdjustmentFormValue {
  productId: string;
  type: string;
  quantity: number;
  reason: string;
  notes: string;
  date: string;
}

/**
 * User form values (admin)
 */
export interface UserFormValue {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  roleId: string;
  isActive: boolean;
}

/**
 * Affiliate form values
 */
export interface AffiliateFormValue {
  name: string;
  code: string;
  integrationType: string;
  apiUrl: string;
  apiKey: string;
  email: string;
  ftpHost: string;
  ftpUsername: string;
  ftpPassword: string;
  isEnabled: boolean;
  lowStockThreshold: number;
  autoReorder: boolean;
  priority: number;
  notes: string;
}

/**
 * Contact form values
 */
export interface ContactFormValue {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Settings form values (general)
 */
export interface GeneralSettingsFormValue {
  storeName: string;
  storeEmail: string;
  supportPhone: string;
  storeAddress: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  weightUnit: string;
}

// ============================================
// TYPED FORM GROUPS
// ============================================

export type TypedFormGroup<T> = FormGroup<{
  [K in keyof T]: FormControl<T[K]>;
}>;

export type LoginForm = TypedFormGroup<LoginFormValue>;
export type RegisterForm = TypedFormGroup<RegisterFormValue>;
export type ProfileForm = TypedFormGroup<ProfileFormValue>;
export type ChangePasswordForm = TypedFormGroup<ChangePasswordFormValue>;
export type AddressForm = TypedFormGroup<AddressFormValue>;
export type VehicleForm = TypedFormGroup<VehicleFormValue>;
export type ProductForm = TypedFormGroup<ProductFormValue>;
export type UserForm = TypedFormGroup<UserFormValue>;
export type AffiliateForm = TypedFormGroup<AffiliateFormValue>;

// ============================================
// VALIDATION PATTERNS
// ============================================

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  /** Email pattern */
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  /** US phone pattern */
  phone: /^\+?1?\s*\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
  /** US ZIP code pattern */
  zipCode: /^\d{5}(-\d{4})?$/,
  /** SKU pattern (alphanumeric with dashes) */
  sku: /^[A-Za-z0-9-]+$/,
  /** Slug pattern (lowercase alphanumeric with dashes) */
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  /** Password pattern (min 8 chars, 1 uppercase, 1 lowercase, 1 number) */
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
} as const;

// Legacy exports for backward compatibility
export const EMAIL_PATTERN = ValidationPatterns.email;
export const PHONE_PATTERN = ValidationPatterns.phone;
export const ZIP_CODE_PATTERN = ValidationPatterns.zipCode;
export const SKU_PATTERN = ValidationPatterns.sku;

// ============================================
// CUSTOM VALIDATORS
// ============================================

/**
 * Custom email validator
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;
    return ValidationPatterns.email.test(control.value) ? null : { email: true };
  };
}

/**
 * Custom phone validator
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;
    return ValidationPatterns.phone.test(control.value) ? null : { phone: true };
  };
}

/**
 * Custom ZIP code validator
 */
export function zipCodeValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null;
    return ValidationPatterns.zipCode.test(control.value) ? null : { zipCode: true };
  };
}

/**
 * Confirm password/field match validator
 */
export function confirmPasswordValidator(passwordField: string): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.parent) return null;
    const password = control.parent.get(passwordField);
    if (!password || !control.value) return null;
    return password.value === control.value ? null : { passwordMismatch: true };
  };
}

/**
 * Field match validator (for form group level)
 */
export function matchFieldsValidator(field1: string, field2: string): ValidatorFn {
  return (form: AbstractControl) => {
    const control1 = form.get(field1);
    const control2 = form.get(field2);
    if (!control1 || !control2) return null;
    return control1.value === control2.value ? null : { mismatch: true };
  };
}

/**
 * Min value validator for numbers
 */
export function minValueValidator(min: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value && control.value !== 0) return null;
    const value = parseFloat(control.value);
    return value >= min ? null : { minValue: { min, actual: value } };
  };
}

/**
 * Max value validator for numbers
 */
export function maxValueValidator(max: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value && control.value !== 0) return null;
    const value = parseFloat(control.value);
    return value <= max ? null : { maxValue: { max, actual: value } };
  };
}

/**
 * Custom validators collection
 */
export const CustomValidators = {
  email: emailValidator,
  phone: phoneValidator,
  zipCode: zipCodeValidator,
  confirmPassword: confirmPasswordValidator,
  matchFields: matchFieldsValidator,
  minValue: minValueValidator,
  maxValue: maxValueValidator,
};

// ============================================
// FORM CONTROL FACTORIES
// ============================================

/**
 * Field configuration for createControl()
 */
export interface FieldConfig {
  value?: unknown;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string | RegExp;
  email?: boolean;
  phone?: boolean;
  custom?: ValidatorFn | ValidatorFn[];
  nonNullable?: boolean;
}

/**
 * Create a FormControl with validators from config
 */
export function createControl<T = string>(config: FieldConfig = {}): FormControl<T> {
  const validators: ValidatorFn[] = [];

  if (config.required) validators.push(Validators.required);
  if (config.minLength) validators.push(Validators.minLength(config.minLength));
  if (config.maxLength) validators.push(Validators.maxLength(config.maxLength));
  if (config.min !== undefined) validators.push(Validators.min(config.min));
  if (config.max !== undefined) validators.push(Validators.max(config.max));
  if (config.email) validators.push(emailValidator());
  if (config.pattern) validators.push(Validators.pattern(config.pattern));
  if (config.phone) validators.push(phoneValidator());
  if (config.custom) {
    const customValidators = Array.isArray(config.custom) ? config.custom : [config.custom];
    validators.push(...customValidators);
  }

  return new FormControl(config.value ?? '' as T, {
    nonNullable: config.nonNullable ?? true,
    validators,
  }) as FormControl<T>;
}

/**
 * Create a required text field
 */
export function requiredText(defaultValue = ''): FormControl<string> {
  return new FormControl(defaultValue, {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(1)],
  });
}

/**
 * Create an optional text field
 */
export function optionalText(defaultValue = ''): FormControl<string> {
  return new FormControl(defaultValue, { nonNullable: true });
}

/**
 * Create a required email field
 */
export function requiredEmail(defaultValue = ''): FormControl<string> {
  return new FormControl(defaultValue, {
    nonNullable: true,
    validators: [Validators.required, emailValidator()],
  });
}

/**
 * Create a password field
 */
export function passwordField(minLength = 8): FormControl<string> {
  return new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(minLength)],
  });
}

/**
 * Create a phone field
 */
export function phoneField(required = false): FormControl<string> {
  const validators = required ? [Validators.required, phoneValidator()] : [phoneValidator()];
  return new FormControl('', { nonNullable: true, validators });
}

/**
 * Create a required number field
 */
export function requiredNumber(defaultValue = 0, min?: number, max?: number): FormControl<number> {
  const validators: ValidatorFn[] = [Validators.required];
  if (min !== undefined) validators.push(minValueValidator(min));
  if (max !== undefined) validators.push(maxValueValidator(max));

  return new FormControl(defaultValue, { nonNullable: true, validators });
}

/**
 * Create an optional number field
 */
export function optionalNumber(defaultValue: number | null = null): FormControl<number | null> {
  return new FormControl(defaultValue);
}

/**
 * Create a boolean toggle field
 */
export function booleanField(defaultValue = false): FormControl<boolean> {
  return new FormControl(defaultValue, { nonNullable: true });
}

/**
 * Create a required select field
 */
export function requiredSelect<T>(defaultValue: T | null = null): FormControl<T | null> {
  return new FormControl<T | null>(defaultValue, { validators: [Validators.required] });
}

// ============================================
// FORM STATE HELPERS
// ============================================

/**
 * Check if a form control has an error and has been touched
 */
export function hasError(control: AbstractControl | null, errorKey?: string): boolean {
  if (!control) return false;
  if (!control.invalid || !control.touched) return false;
  if (errorKey) return control.hasError(errorKey);
  return true;
}

/**
 * Check if error should be shown (control is invalid and dirty/touched)
 */
export function shouldShowError(control: AbstractControl | null): boolean {
  if (!control) return false;
  return control.invalid && (control.dirty || control.touched);
}

/**
 * Error message mapping
 */
export const FORM_ERRORS: Record<string, string | ((params: Record<string, unknown>) => string)> = {
  [FormErrorKey.Required]: 'This field is required',
  [FormErrorKey.Email]: 'Please enter a valid email address',
  [FormErrorKey.MinLength]: (p) => `Must be at least ${p['requiredLength']} characters`,
  [FormErrorKey.MaxLength]: (p) => `Must be no more than ${p['requiredLength']} characters`,
  [FormErrorKey.Min]: (p) => `Must be at least ${p['min']}`,
  [FormErrorKey.Max]: (p) => `Must be no more than ${p['max']}`,
  [FormErrorKey.MinValue]: (p) => `Must be at least ${p['min']}`,
  [FormErrorKey.MaxValue]: (p) => `Must be no more than ${p['max']}`,
  [FormErrorKey.Pattern]: 'Invalid format',
  [FormErrorKey.Phone]: 'Please enter a valid phone number',
  [FormErrorKey.ZipCode]: 'Please enter a valid ZIP code',
  [FormErrorKey.PasswordMismatch]: 'Passwords do not match',
  [FormErrorKey.Mismatch]: 'Fields do not match',
};

/**
 * Get the first error message for a control
 */
export function getErrorMessage(
  control: AbstractControl | null,
  customMessages?: Record<string, string>
): string {
  if (!control || !control.errors) return '';

  const mergedMessages = { ...FORM_ERRORS, ...customMessages };
  const errorKey = Object.keys(control.errors)[0];
  const errorValue = control.errors[errorKey];
  const message = mergedMessages[errorKey];

  if (typeof message === 'function') {
    return message(errorValue);
  }

  return message || 'Invalid value';
}

/**
 * Mark all controls in a form as touched (for showing all errors)
 */
export function markAllAsTouched(form: FormGroup): void {
  Object.values(form.controls).forEach(control => {
    control.markAsTouched();
    if (control instanceof FormGroup) {
      markAllAsTouched(control);
    }
  });
}

/**
 * Mark form as touched (alias for markAllAsTouched)
 */
export function markFormTouched(form: FormGroup): void {
  markAllAsTouched(form);
}

/**
 * Reset form to initial values and pristine/untouched state
 */
export function resetForm(form: FormGroup, initialValues?: Record<string, unknown>): void {
  form.reset(initialValues);
  form.markAsPristine();
  form.markAsUntouched();
}

/**
 * Get only the dirty (changed) values from a form
 */
export function getDirtyValues<T extends Record<string, unknown>>(form: FormGroup): Partial<T> {
  const dirtyValues: Partial<T> = {};

  Object.keys(form.controls).forEach(key => {
    const control = form.get(key);
    if (control && control.dirty) {
      dirtyValues[key as keyof T] = control.value;
    }
  });

  return dirtyValues;
}

/**
 * Check if form has any dirty fields
 */
export function hasChanges(form: FormGroup): boolean {
  return Object.values(form.controls).some(control => control.dirty);
}

// ============================================
// FORM VALUE TRANSFORMERS
// ============================================

/**
 * Trim whitespace from all string fields
 */
export function trimFormValues<T extends Record<string, unknown>>(values: T): T {
  const trimmed = { ...values };

  Object.keys(trimmed).forEach(key => {
    const value = trimmed[key as keyof T];
    if (typeof value === 'string') {
      (trimmed as Record<string, unknown>)[key] = value.trim();
    }
  });

  return trimmed;
}

/**
 * Remove empty string values from form data
 */
export function removeEmptyValues<T extends Record<string, unknown>>(values: T): Partial<T> {
  const cleaned: Partial<T> = {};

  Object.entries(values).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key as keyof T] = value as T[keyof T];
    }
  });

  return cleaned;
}

// ============================================
// FORM TEMPLATES
// ============================================

/**
 * Pre-built form group factories with proper typing
 */
export const FormTemplates = {
  /**
   * Login form
   */
  login(): FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
    rememberMe: FormControl<boolean>;
  }> {
    return new FormGroup({
      email: requiredEmail(),
      password: passwordField(),
      rememberMe: booleanField(false),
    });
  },

  /**
   * Registration form
   */
  register(): FormGroup<{
    firstName: FormControl<string>;
    lastName: FormControl<string>;
    email: FormControl<string>;
    phone: FormControl<string>;
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
    acceptTerms: FormControl<boolean>;
  }> {
    return new FormGroup({
      firstName: requiredText(),
      lastName: requiredText(),
      email: requiredEmail(),
      phone: phoneField(false),
      password: passwordField(8),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, confirmPasswordValidator('password')],
      }),
      acceptTerms: new FormControl(false, {
        nonNullable: true,
        validators: [Validators.requiredTrue],
      }),
    });
  },

  /**
   * Profile update form
   */
  profile(): FormGroup<{
    firstName: FormControl<string>;
    lastName: FormControl<string>;
    email: FormControl<string>;
    phone: FormControl<string>;
  }> {
    return new FormGroup({
      firstName: requiredText(),
      lastName: requiredText(),
      email: requiredEmail(),
      phone: phoneField(false),
    });
  },

  /**
   * Change password form
   */
  changePassword(): FormGroup<{
    currentPassword: FormControl<string>;
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }> {
    return new FormGroup({
      currentPassword: passwordField(),
      newPassword: passwordField(8),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, confirmPasswordValidator('newPassword')],
      }),
    });
  },

  /**
   * Address form
   */
  address(): FormGroup<{
    firstName: FormControl<string>;
    lastName: FormControl<string>;
    company: FormControl<string>;
    address1: FormControl<string>;
    address2: FormControl<string>;
    city: FormControl<string>;
    state: FormControl<string | null>;
    zipCode: FormControl<string>;
    country: FormControl<string>;
    phone: FormControl<string>;
    isDefault: FormControl<boolean>;
  }> {
    return new FormGroup({
      firstName: requiredText(),
      lastName: requiredText(),
      company: optionalText(),
      address1: requiredText(),
      address2: optionalText(),
      city: requiredText(),
      state: requiredSelect<string>(),
      zipCode: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, zipCodeValidator()],
      }),
      country: new FormControl('US', { nonNullable: true }),
      phone: phoneField(true),
      isDefault: booleanField(false),
    });
  },

  /**
   * Vehicle form
   */
  vehicle(): FormGroup<{
    nickname: FormControl<string>;
    year: FormControl<number>;
    make: FormControl<string>;
    model: FormControl<string>;
    submodel: FormControl<string>;
    engine: FormControl<string>;
    isDefault: FormControl<boolean>;
  }> {
    return new FormGroup({
      nickname: optionalText(),
      year: requiredNumber(new Date().getFullYear(), 1900, new Date().getFullYear() + 1),
      make: requiredText(),
      model: requiredText(),
      submodel: optionalText(),
      engine: optionalText(),
      isDefault: booleanField(false),
    });
  },

  /**
   * Product form
   */
  product(): FormGroup<{
    sku: FormControl<string>;
    name: FormControl<string>;
    slug: FormControl<string>;
    description: FormControl<string>;
    shortDescription: FormControl<string>;
    price: FormControl<number>;
    compareAtPrice: FormControl<number | null>;
    costPrice: FormControl<number | null>;
    categoryId: FormControl<string>;
    brandId: FormControl<string>;
    stockQuantity: FormControl<number>;
    lowStockThreshold: FormControl<number>;
    isActive: FormControl<boolean>;
    isFeatured: FormControl<boolean>;
  }> {
    return new FormGroup({
      sku: requiredText(),
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      slug: requiredText(),
      description: optionalText(),
      shortDescription: optionalText(),
      price: requiredNumber(0, 0),
      compareAtPrice: optionalNumber(),
      costPrice: optionalNumber(),
      categoryId: requiredText(),
      brandId: optionalText(),
      stockQuantity: requiredNumber(0, 0),
      lowStockThreshold: requiredNumber(10, 0),
      isActive: booleanField(true),
      isFeatured: booleanField(false),
    });
  },

  /**
   * User form (admin)
   */
  user(): FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
    firstName: FormControl<string>;
    lastName: FormControl<string>;
    phone: FormControl<string>;
    roleId: FormControl<string>;
    isActive: FormControl<boolean>;
  }> {
    return new FormGroup({
      email: requiredEmail(),
      password: new FormControl('', { nonNullable: true }),
      firstName: requiredText(),
      lastName: requiredText(),
      phone: phoneField(false),
      roleId: requiredText(),
      isActive: booleanField(true),
    });
  },

  /**
   * Affiliate form
   */
  affiliate(): FormGroup<{
    name: FormControl<string>;
    code: FormControl<string>;
    integrationType: FormControl<string>;
    apiUrl: FormControl<string>;
    apiKey: FormControl<string>;
    email: FormControl<string>;
    ftpHost: FormControl<string>;
    ftpUsername: FormControl<string>;
    ftpPassword: FormControl<string>;
    isEnabled: FormControl<boolean>;
    lowStockThreshold: FormControl<number>;
    autoReorder: FormControl<boolean>;
    priority: FormControl<number>;
    notes: FormControl<string>;
  }> {
    return new FormGroup({
      name: requiredText(),
      code: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(ValidationPatterns.sku)],
      }),
      integrationType: requiredText(),
      apiUrl: optionalText(),
      apiKey: optionalText(),
      email: new FormControl('', { nonNullable: true, validators: [emailValidator()] }),
      ftpHost: optionalText(),
      ftpUsername: optionalText(),
      ftpPassword: optionalText(),
      isEnabled: booleanField(true),
      lowStockThreshold: requiredNumber(5, 0),
      autoReorder: booleanField(false),
      priority: requiredNumber(0, 0, 100),
      notes: optionalText(),
    });
  },

  /**
   * Inventory adjustment form
   */
  inventoryAdjustment(): FormGroup<{
    productId: FormControl<string>;
    type: FormControl<string>;
    quantity: FormControl<number>;
    reason: FormControl<string>;
    notes: FormControl<string>;
    date: FormControl<string>;
  }> {
    return new FormGroup({
      productId: requiredText(),
      type: requiredText(),
      quantity: requiredNumber(0),
      reason: requiredText(),
      notes: optionalText(),
      date: new FormControl(new Date().toISOString().split('T')[0], { nonNullable: true }),
    });
  },

  /**
   * Forgot password form
   */
  forgotPassword(): FormGroup<{
    email: FormControl<string>;
  }> {
    return new FormGroup({
      email: requiredEmail(),
    });
  },

  /**
   * Reset password form
   */
  resetPassword(): FormGroup<{
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
  }> {
    return new FormGroup({
      password: passwordField(8),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, confirmPasswordValidator('password')],
      }),
    });
  },

  /**
   * Contact form
   */
  contact(): FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    subject: FormControl<string>;
    message: FormControl<string>;
  }> {
    return new FormGroup({
      name: requiredText(),
      email: requiredEmail(),
      subject: requiredText(),
      message: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(20)],
      }),
    });
  },
};

// ============================================
// TYPE GUARDS
// ============================================

/**
 * Type guard to check if a value is a valid form error key
 */
export function isFormErrorKey(key: string): key is FormErrorKey {
  return Object.values(FormErrorKey).includes(key as FormErrorKey);
}

/**
 * Type guard to check if control is a FormControl
 */
export function isFormControl(control: AbstractControl): control is FormControl {
  return control instanceof FormControl;
}

/**
 * Type guard to check if control is a FormGroup
 */
export function isFormGroup(control: AbstractControl): control is FormGroup {
  return control instanceof FormGroup;
}
