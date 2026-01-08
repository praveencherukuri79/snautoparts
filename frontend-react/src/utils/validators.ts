/**
 * Form Validation Utilities
 */

/**
 * Email validator
 * @param email - Email string to validate
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Phone validator (US format)
 * @param phone - Phone string to validate
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Password strength validator
 * @param password - Password to validate
 * @returns Object with validity and array of errors
 */
export const validatePassword = (
  password: string
): { valid: boolean; errors: string[]; strength: 'weak' | 'medium' | 'strong' } => {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    errors.push('At least 8 characters required');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter required');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter required');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('At least one number required');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('At least one special character recommended');
  }

  // Calculate strength
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const criteriaMet = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  if (criteriaMet >= 5) {
    strength = 'strong';
  } else if (criteriaMet >= 3) {
    strength = 'medium';
  }

  return {
    valid: errors.length === 0 || (errors.length === 1 && errors[0].includes('recommended')),
    errors,
    strength,
  };
};

/**
 * Required field validator
 * @param value - Value to check
 */
export const isRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Min length validator
 * @param value - String to check
 * @param minLength - Minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Max length validator
 * @param value - String to check
 * @param maxLength - Maximum length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * URL validator
 * @param url - URL string to validate
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Postal code validator (US format)
 * @param postalCode - Postal code to validate
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  const postalRegex = /^\d{5}(-\d{4})?$/;
  return postalRegex.test(postalCode);
};

/**
 * Credit card number validator (Luhn algorithm)
 * @param cardNumber - Card number to validate
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * CVV validator
 * @param cvv - CVV to validate
 */
export const isValidCvv = (cvv: string): boolean => {
  const cvvRegex = /^\d{3,4}$/;
  return cvvRegex.test(cvv);
};

/**
 * Expiry date validator (MM/YY format)
 * @param expiry - Expiry date to validate
 */
export const isValidExpiry = (expiry: string): boolean => {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

/**
 * SKU validator
 * @param sku - SKU to validate
 */
export const isValidSku = (sku: string): boolean => {
  // SKU should be alphanumeric with optional dashes
  const skuRegex = /^[A-Za-z0-9\-_]+$/;
  return skuRegex.test(sku) && sku.length >= 3 && sku.length <= 50;
};

/**
 * Create validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Field validator factory
 * Creates a validator function for a field
 */
export const createFieldValidator = (
  validators: Array<{
    validate: (value: string) => boolean;
    message: string;
  }>
) => {
  return (value: string): ValidationResult => {
    for (const { validate, message } of validators) {
      if (!validate(value)) {
        return { valid: false, error: message };
      }
    }
    return { valid: true };
  };
};

/**
 * Common field validators
 */
export const validators = {
  email: createFieldValidator([
    { validate: isRequired as (v: string) => boolean, message: 'Email is required' },
    { validate: isValidEmail, message: 'Invalid email address' },
  ]),

  password: createFieldValidator([
    { validate: isRequired as (v: string) => boolean, message: 'Password is required' },
    { validate: (v) => hasMinLength(v, 8), message: 'Password must be at least 8 characters' },
  ]),

  phone: createFieldValidator([
    { validate: isValidPhone, message: 'Invalid phone number' },
  ]),

  postalCode: createFieldValidator([
    { validate: isRequired as (v: string) => boolean, message: 'Postal code is required' },
    { validate: isValidPostalCode, message: 'Invalid postal code' },
  ]),
};
