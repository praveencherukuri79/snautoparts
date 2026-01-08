/**
 * Form Builder Component
 * 
 * JSON-driven form renderer with react-hook-form integration
 */

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Grid, Box } from '@mui/material';
import { FormField } from './FormField';
import type { FormConfig } from './types';

interface FormBuilderProps {
  /** Form configuration */
  config: FormConfig;
  
  /** Form submit handler */
  onSubmit: (data: any) => void | Promise<void>;
  
  /** Form action buttons (rendered at bottom) */
  actions?: React.ReactNode;
  
  /** Additional props for form element */
  formProps?: React.FormHTMLAttributes<HTMLFormElement>;
  
  /** Callback when form values change */
  onValuesChange?: (values: any) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  config,
  onSubmit,
  actions,
  formProps,
  onValuesChange,
}) => {
  const {
    fields,
    defaultValues,
    spacing = 2.5,
    mode = 'onSubmit',
    authStyle,
  } = config;

  const methods = useForm({
    defaultValues,
    mode,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = methods;

  // Watch all values for conditional fields and onChange callback
  const formValues = watch();

  React.useEffect(() => {
    if (onValuesChange) {
      onValuesChange(formValues);
    }
  }, [formValues, onValuesChange]);

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate {...formProps}>
        <Grid container spacing={spacing}>
          {fields.map((fieldConfig) => {
            const {
              name,
              colSpan = { xs: 12 },
              sx,
            } = fieldConfig;

            return (
              <Grid
                item
                key={name}
                xs={colSpan.xs || 12}
                sm={colSpan.sm}
                md={colSpan.md}
                lg={colSpan.lg}
                sx={sx}
              >
                <FormField
                  config={fieldConfig}
                  control={control}
                  errors={errors}
                  formValues={formValues}
                  formAuthStyle={authStyle}
                />
              </Grid>
            );
          })}
        </Grid>

        {actions && (
          <Box mt={3}>
            {actions}
          </Box>
        )}
      </Box>
    </FormProvider>
  );
};

export default FormBuilder;

