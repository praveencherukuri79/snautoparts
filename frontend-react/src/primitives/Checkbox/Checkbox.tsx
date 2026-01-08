import React from 'react';
import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  FormControlLabel,
  FormHelperText,
  Box,
} from '@mui/material';

export interface CheckboxProps extends Omit<MuiCheckboxProps, 'color'> {
  /** Label for the checkbox */
  label?: string | React.ReactNode;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Label placement */
  labelPlacement?: 'end' | 'start' | 'top' | 'bottom';
}

/**
 * Checkbox Component
 * 
 * Checkbox input with label and error state support.
 * 
 * @example
 * ```tsx
 * <Checkbox label="I agree to the terms" />
 * <Checkbox label="Subscribe to newsletter" checked />
 * <Checkbox error="You must accept the terms" />
 * ```
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  helperText,
  labelPlacement = 'end',
  ...props
}) => {
  const hasError = Boolean(error);

  const checkbox = <MuiCheckbox color="primary" {...props} />;

  if (!label && !error && !helperText) {
    return checkbox;
  }

  return (
    <Box>
      {label ? (
        <FormControlLabel
          control={checkbox}
          label={label}
          labelPlacement={labelPlacement}
          sx={{
            color: hasError ? 'error.main' : 'text.primary',
            '& .MuiFormControlLabel-label': {
              fontSize: '0.875rem',
            },
          }}
        />
      ) : (
        checkbox
      )}
      {(error || helperText) && (
        <FormHelperText error={hasError} sx={{ ml: label ? 4 : 0 }}>
          {error || helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

Checkbox.displayName = 'Checkbox';

export default Checkbox;
