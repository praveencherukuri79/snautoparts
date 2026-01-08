import React, { forwardRef } from 'react';
import {
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Box,
} from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<MuiSelectProps, 'error' | 'variant'> {
  /** Array of options */
  options: SelectOption[];
  /** Error message to display */
  error?: string | boolean;
  /** Helper text below select */
  helperText?: string;
  /** Placeholder text when no value selected */
  placeholder?: string;
}

/**
 * Select Component
 * 
 * Dropdown select field with options.
 * 
 * @example
 * ```tsx
 * <Select
 *   label="Category"
 *   options={[
 *     { value: '1', label: 'Engine Parts' },
 *     { value: '2', label: 'Brake Systems' },
 *   ]}
 * />
 * ```
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      options,
      error,
      helperText,
      placeholder,
      label,
      fullWidth = true,
      size = 'medium',
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;

    return (
      <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
        <FormControl fullWidth={fullWidth} error={hasError} size={size}>
          {label && <InputLabel>{label}</InputLabel>}
          <MuiSelect
            ref={ref}
            label={label}
            displayEmpty={Boolean(placeholder)}
            {...props}
          >
            {placeholder && (
              <MenuItem value="" disabled>
                <em>{placeholder}</em>
              </MenuItem>
            )}
            {options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </MenuItem>
            ))}
          </MuiSelect>
          {(errorMessage || helperText) && (
            <FormHelperText>{errorMessage || helperText}</FormHelperText>
          )}
        </FormControl>
      </Box>
    );
  }
);

Select.displayName = 'Select';

export default Select;
