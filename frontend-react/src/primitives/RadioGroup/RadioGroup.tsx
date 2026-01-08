import React from 'react';
import {
  Radio as MuiRadio,
  RadioGroup as MuiRadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormHelperText,
} from '@mui/material';

export interface RadioOption {
  value: string;
  label: string | React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Radio group name */
  name: string;
  /** Label for the group */
  label?: string;
  /** Array of options */
  options: RadioOption[];
  /** Currently selected value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Layout direction */
  row?: boolean;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * RadioGroup Component
 * 
 * Group of radio buttons with single selection.
 * 
 * @example
 * ```tsx
 * <RadioGroup
 *   name="shipping"
 *   label="Shipping Method"
 *   options={[
 *     { value: 'standard', label: 'Standard (5-7 days)' },
 *     { value: 'express', label: 'Express (2-3 days)' },
 *   ]}
 *   value={selectedShipping}
 *   onChange={setSelectedShipping}
 * />
 * ```
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  row = false,
  error,
  helperText,
  disabled = false,
}) => {
  const hasError = Boolean(error);

  return (
    <FormControl error={hasError} disabled={disabled}>
      {label && (
        <FormLabel sx={{ mb: 1, fontWeight: 500 }}>{label}</FormLabel>
      )}
      <MuiRadioGroup
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        row={row}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<MuiRadio color="primary" />}
            label={option.label}
            disabled={option.disabled}
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: '0.875rem',
              },
            }}
          />
        ))}
      </MuiRadioGroup>
      {(error || helperText) && (
        <FormHelperText>{error || helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
