/**
 * Form Field Component
 * 
 * Renders individual form field based on configuration
 * Supports auth-specific styling and extended input types
 */

import React, { useState } from 'react';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  InputLabel,
  Typography,
  Slider,
  Switch,
} from '@mui/material';
import { Input, Checkbox, IconButton } from '@/primitives';
import { VisibilityIcon, VisibilityOffIcon } from '@/icons';
import type { FieldConfig } from './types';

interface FormFieldProps {
  config: FieldConfig;
  control: Control<any>;
  errors: FieldErrors;
  formValues?: any;
  formAuthStyle?: boolean; // Global auth style from FormConfig
}

export const FormField: React.FC<FormFieldProps> = ({
  config,
  control,
  errors,
  formValues,
  formAuthStyle = false,
}) => {
  const {
    name,
    type,
    label,
    placeholder,
    helperText,
    validation,
    customValidators,
    options,
    rows,
    min,
    max,
    step,
    accept,
    multiple,
    disabled,
    readOnly,
    startIcon,
    endIcon,
    authStyle,
    customComponent: CustomComponent,
    condition,
    componentProps,
  } = config;

  // Password visibility toggle for auth style
  const [showPassword, setShowPassword] = useState(false);

  // Check condition to show/hide field
  if (condition && !condition(formValues)) {
    return null;
  }

  // Determine if auth styling is enabled
  const isAuthStyle = authStyle?.enabled || (formAuthStyle && authStyle !== undefined);

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  // Custom validation logic
  const enhancedValidation = {
    ...validation,
    validate: {
      ...(typeof validation?.validate === 'function' 
        ? { custom: validation.validate }
        : validation?.validate),
      // Add custom validators
      ...(customValidators?.reduce((acc, validator, index) => {
        acc[`custom_${index}`] = async (value: any) => {
          const result = await validator(value, formValues);
          return result === true ? true : result;
        };
        return acc;
      }, {} as Record<string, any>)),
    },
  };

  // Custom component
  if (CustomComponent) {
    return (
      <Controller
        name={name}
        control={control}
        rules={enhancedValidation}
        render={({ field }) => (
          <CustomComponent
            {...field}
            {...componentProps}
            label={label}
            error={!!error}
            helperText={errorMessage || helperText}
            disabled={disabled}
          />
        )}
      />
    );
  }

  // ============================================
  // AUTH STYLE RENDERING (Dark theme)
  // ============================================
  if (isAuthStyle && (type === 'text' || type === 'email' || type === 'password' || type === 'tel' || type === 'url' || type === 'search' || type === 'number')) {
    return (
      <Controller
        name={name}
        control={control}
        rules={enhancedValidation}
        render={({ field }) => (
          <Box>
            {label && (
              <Typography
                component="label"
                fontWeight={500}
                color="common.white"
                mb={1}
                display="block"
              >
                {label}
              </Typography>
            )}
            <Input
              {...field}
              {...componentProps}
              type={type === 'password' && authStyle?.showPasswordToggle && showPassword ? 'text' : type}
              placeholder={placeholder}
              error={!!error}
              helperText={errorMessage || helperText}
              disabled={disabled || readOnly}
              className="dark-input"
              fullWidth
              startIcon={startIcon}
              endIcon={
                type === 'password' && authStyle?.showPasswordToggle ? (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: 'text.muted' }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ) : endIcon
              }
            />
            {authStyle?.action && (
              <Box mt={1}>
                {authStyle.action}
              </Box>
            )}
          </Box>
        )}
      />
    );
  }

  // ============================================
  // CHECKBOX
  // ============================================
  if (type === 'checkbox') {
    return (
      <Controller
        name={name}
        control={control}
        rules={enhancedValidation}
        render={({ field }) => (
          <Checkbox
            {...field}
            {...componentProps}
            checked={field.value || false}
            label={label}
            disabled={disabled}
          />
        )}
      />
    );
  }

  // ============================================
  // SWITCH
  // ============================================
  if (type === 'switch') {
    return (
      <Controller
        name={name}
        control={control}
        rules={enhancedValidation}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                {...field}
                {...componentProps}
                checked={field.value || false}
                disabled={disabled}
              />
            }
            label={label}
          />
        )}
      />
    );
  }

  // ============================================
  // RADIO GROUP
  // ============================================
  if (type === 'radio') {
    return (
      <Controller
        name={name}
        control={control}
        rules={enhancedValidation}
        render={({ field }) => (
          <FormControl error={!!error} disabled={disabled}>
            {label && <InputLabel>{label}</InputLabel>}
            <RadioGroup {...field} {...componentProps}>
              {options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                  disabled={option.disabled}
                />
              ))}
            </RadioGroup>
            {(errorMessage || helperText) && (
              <FormHelperText>{errorMessage || helperText}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    );
  }

  // ============================================
  // SELECT DROPDOWN
  // ============================================
  if (type === 'select') {
    return (
      <Controller
        name={name}
        control={control}
        rules={enhancedValidation}
        render={({ field }) => (
          <FormControl fullWidth error={!!error}>
            {label && <InputLabel>{label}</InputLabel>}
            <Select
              {...field}
              {...componentProps}
              label={label}
              disabled={disabled}
              displayEmpty
            >
              {placeholder && (
                <MenuItem value="">
                  <em>{placeholder}</em>
                </MenuItem>
              )}
              {options?.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(errorMessage || helperText) && (
              <FormHelperText>{errorMessage || helperText}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    );
  }

  // ============================================
  // RANGE SLIDER
  // ============================================
  if (type === 'range') {
    return (
      <Controller
        name={name}
        control={control}
        rules={enhancedValidation}
        render={({ field }) => (
          <FormControl fullWidth error={!!error}>
            {label && (
              <Typography gutterBottom>
                {label}: {field.value}
              </Typography>
            )}
            <Slider
              {...field}
              {...componentProps}
              min={typeof min === 'number' ? min : 0}
              max={typeof max === 'number' ? max : 100}
              step={typeof step === 'number' ? step : 1}
              disabled={disabled}
              valueLabelDisplay="auto"
            />
            {(errorMessage || helperText) && (
              <FormHelperText>{errorMessage || helperText}</FormHelperText>
            )}
          </FormControl>
        )}
      />
    );
  }

  // ============================================
  // FILE INPUT
  // ============================================
  if (type === 'file') {
    return (
      <Controller
        name={name}
        control={control}
        rules={enhancedValidation}
        render={({ field: { value, onChange, ...field } }) => (
          <FormControl fullWidth error={!!error}>
            {label && <InputLabel shrink>{label}</InputLabel>}
            <TextField
              {...field}
              {...componentProps}
              type="file"
              onChange={(e: any) => {
                const files = e.target.files;
                onChange(multiple ? files : files?.[0]);
              }}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                accept,
                multiple,
              }}
              disabled={disabled}
              error={!!error}
              helperText={errorMessage || helperText}
            />
          </FormControl>
        )}
      />
    );
  }

  // ============================================
  // TEXTAREA
  // ============================================
  if (type === 'textarea') {
    return (
      <Controller
        name={name}
        control={control}
        rules={enhancedValidation}
        render={({ field }) => (
          <TextField
            {...field}
            {...componentProps}
            fullWidth
            multiline
            rows={rows || 4}
            label={label}
            placeholder={placeholder}
            error={!!error}
            helperText={errorMessage || helperText}
            disabled={disabled}
            InputProps={{ readOnly }}
          />
        )}
      />
    );
  }

  // ============================================
  // STANDARD INPUT FIELDS
  // (text, email, password, number, tel, url, search, date, time, datetime-local, month, week, color)
  // ============================================
  return (
    <Controller
      name={name}
      control={control}
      rules={enhancedValidation}
      render={({ field }) => (
        <Input
          {...field}
          {...componentProps}
          type={type}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={errorMessage || helperText}
          disabled={disabled || readOnly}
          startIcon={startIcon}
          endIcon={endIcon}
          inputProps={{
            min,
            max,
            step,
          }}
        />
      )}
    />
  );
};

export default FormField;

