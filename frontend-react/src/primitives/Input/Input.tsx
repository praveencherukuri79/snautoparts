import React, { forwardRef } from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  FormHelperText,
  Box,
} from '@mui/material';

export interface InputProps
  extends Omit<TextFieldProps, 'variant' | 'error'> {
  /** Error message to display */
  error?: string | boolean;
  /** Icon to display at the start of input */
  startIcon?: React.ReactNode;
  /** Icon to display at the end of input */
  endIcon?: React.ReactNode;
  /** Helper text below input */
  helperText?: string;
}

/**
 * Input Component
 * 
 * Text input field with support for icons, validation states, and helper text.
 * 
 * @example
 * ```tsx
 * <Input label="Email" placeholder="Enter your email" />
 * <Input label="Search" startIcon={<SearchIcon />} />
 * <Input label="Password" type="password" error="Password is required" />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      startIcon,
      endIcon,
      helperText,
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
        <TextField
          inputRef={ref}
          variant="outlined"
          fullWidth={fullWidth}
          size={size}
          error={hasError}
          InputProps={{
            startAdornment: startIcon ? (
              <InputAdornment position="start">{startIcon}</InputAdornment>
            ) : undefined,
            endAdornment: endIcon ? (
              <InputAdornment position="end">{endIcon}</InputAdornment>
            ) : undefined,
          }}
          {...props}
        />
        {(errorMessage || helperText) && (
          <FormHelperText error={hasError}>
            {errorMessage || helperText}
          </FormHelperText>
        )}
      </Box>
    );
  }
);

Input.displayName = 'Input';

export default Input;
