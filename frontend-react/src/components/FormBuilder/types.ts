/**
 * Form Builder Types
 * 
 * Type definitions for JSON-driven form configuration
 */

import type { RegisterOptions } from 'react-hook-form';
import type { ReactNode } from 'react';

export type FieldType = 
  // Text inputs
  | 'text' 
  | 'email' 
  | 'password' 
  | 'number' 
  | 'tel'
  | 'url'
  | 'search'
  
  // Date/Time inputs
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week'
  
  // Other inputs
  | 'color'
  | 'range'
  | 'file'
  
  // Complex inputs
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch';

export interface FieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

/**
 * Custom validator function
 * Returns true if valid, or error message string if invalid
 */
export type CustomValidator = (
  value: any,
  formValues: any
) => true | string | Promise<true | string>;

/**
 * Auth-specific styling configuration
 */
export interface AuthStyleConfig {
  /** Use auth page styling (dark theme, external labels) */
  enabled: boolean;
  /** Show password toggle icon (only for password fields) */
  showPasswordToggle?: boolean;
  /** Additional action component (e.g., "Forgot Password?" link) */
  action?: ReactNode;
}

export interface FieldConfig {
  /** Field name (used for form registration) */
  name: string;
  
  /** Field type */
  type: FieldType;
  
  /** Field label */
  label?: string;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Help text shown below field */
  helperText?: string;
  
  /** Default value */
  defaultValue?: any;
  
  /** Validation rules (react-hook-form) */
  validation?: RegisterOptions;
  
  /** Custom validators (run after built-in validation) */
  customValidators?: CustomValidator[];
  
  /** Options for select/radio/switch fields */
  options?: FieldOption[];
  
  /** Number of rows for textarea */
  rows?: number;
  
  /** Min/max for number, date, range inputs */
  min?: number | string;
  max?: number | string;
  step?: number | string;
  
  /** Accept attribute for file input */
  accept?: string;
  
  /** Multiple files for file input */
  multiple?: boolean;
  
  /** Is field disabled */
  disabled?: boolean;
  
  /** Is field read-only */
  readOnly?: boolean;
  
  /** Start icon (for text inputs) */
  startIcon?: ReactNode;
  
  /** End icon (for text inputs) */
  endIcon?: ReactNode;
  
  /** Grid column span (responsive) */
  colSpan?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  
  /** Auth page styling configuration */
  authStyle?: AuthStyleConfig;
  
  /** Custom styles */
  sx?: Record<string, any>;
  
  /** Show/hide based on condition */
  condition?: (formValues: any) => boolean;
  
  /** Custom component to render instead of default */
  customComponent?: React.ComponentType<any>;
  
  /** Additional props passed to the input component */
  componentProps?: Record<string, any>;
}

export interface FormConfig {
  /** Form fields configuration */
  fields: FieldConfig[];
  
  /** Form-level default values */
  defaultValues?: Record<string, any>;
  
  /** Form grid spacing */
  spacing?: number;
  
  /** Form mode (onChange, onBlur, onSubmit) */
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
  
  /** Apply auth styling to all fields (can be overridden per field) */
  authStyle?: boolean;
}

