import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { logoIcon } from '@/assets/icons';
import { IMAGES } from '@/config';
import { authService } from '@/services';
import type { ResetPasswordRequest } from '@/models';
import { Button, Link, Alert } from '@/primitives';
import { FormBuilder } from '@/components/FormBuilder';
import type { FormConfig } from '@/components/FormBuilder';
import {
  LockResetIcon,
  CheckCircleIcon,
  RadioButtonUncheckedIcon,
  LockIcon,
} from '@/icons';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number or special character', met: /[0-9]|[^A-Za-z0-9]/.test(password) },
  ];

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const resetData: ResetPasswordRequest = {
        token,
        newPassword: data.password,
      };
      
      await authService.resetPassword(resetData);
      
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      console.error('Reset password failed:', err);
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Form configuration with auth style
  const resetPasswordFormConfig: FormConfig = {
    authStyle: true,
    fields: [
      {
        name: 'password',
        type: 'password',
        label: 'New Password',
        placeholder: 'Enter your new password',
        validation: {
          required: 'Password is required',
          minLength: { value: 8, message: 'Password must be at least 8 characters' },
          pattern: {
            value: /^(?=.*[A-Z])(?=.*[0-9a-zA-Z]).{8,}$/,
            message: 'Password must contain uppercase and number/special char',
          },
        },
        authStyle: {
          enabled: true,
          showPasswordToggle: true,
        },
        colSpan: { xs: 12 },
      },
      {
        name: 'confirmPassword',
        type: 'password',
        label: 'Confirm Password',
        placeholder: 'Re-enter your new password',
        validation: {
          required: 'Please confirm your password',
        },
        customValidators: [
          (value, formValues) => value === formValues.password || 'Passwords do not match',
        ],
        authStyle: {
          enabled: true,
          showPasswordToggle: true,
        },
        colSpan: { xs: 12 },
      },
    ],
    spacing: 3,
    mode: 'onSubmit',
  };

  return (
    <Stack minHeight="100vh" bgcolor="background.surfaceDark">
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" px={{ xs: 3, lg: 5 }} py={2} borderBottom={1} borderColor="border.dark">
        <Link to="/" variant="unstyled">
          <Stack direction="row" alignItems="center" gap={1}>
            <Box component="img" src={logoIcon} alt="Logo" width={32} height={32} />
            <Typography variant="h6" fontWeight={700} color="common.white">
              SN AutoParts
            </Typography>
          </Stack>
        </Link>
        <Button
          component={RouterLink}
          to="/login"
          variant="secondary"
          className="btn-primary-ghost"
        >
          Back to Login
        </Button>
      </Stack>

      {/* Main Content */}
      <Stack direction="row" flex={1}>
        {/* Hero Section */}
        <Box
          display={{ xs: 'none', lg: 'flex' }}
          width="50%"
          position="relative"
          bgcolor="background.dark"
          overflow="hidden"
        >
          <Box
            component="img"
            src={IMAGES.hero.automotive}
            alt="Auto parts"
            width="100%"
            height="100%"
            sx={{ objectFit: 'cover', opacity: 0.6 }}
          />
          <Box position="absolute" sx={{ inset: 0, background: 'linear-gradient(to top, var(--color-bg-surface-dark), transparent)' }} />
          <Box position="absolute" sx={{ inset: 0, background: 'linear-gradient(to right, var(--color-bg-surface-dark), transparent 50%)' }} />
          <Stack position="absolute" sx={{ inset: 0 }} justifyContent="flex-end" p={8}>
            <Typography variant="h2" color="common.white" fontWeight={900} lineHeight={1.1} mb={2}>
              Almost there,<br />let's secure it.
            </Typography>
            <Typography color="text.muted" maxWidth={400} fontSize="1.125rem">
              Create a strong password to protect your account and get back to finding the perfect parts.
            </Typography>
          </Stack>
        </Box>

        {/* Form Section */}
        <Stack flex={1} justifyContent="center" alignItems="center" p={4} bgcolor="background.surfaceDark">
          <Box width="100%" maxWidth={480} textAlign="center">
            {!isSuccess ? (
              <>
                <Box
                  mb={3}
                  p={2}
                  borderRadius={3}
                  display="inline-flex"
                  bgcolor="background.inputDark"
                  border={1}
                  borderColor="border.dark"
                >
                  <LockResetIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>

                <Typography variant="h4" fontWeight={900} color="common.white" mb={1}>
                  Create new password
                </Typography>
                <Typography color="text.muted" mb={4}>
                  Your new password must be different from previously used passwords.
                </Typography>

                <Box textAlign="left">
                  {error && (
                    <Alert severity="error" dismissible onDismiss={() => setError(null)} sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <FormBuilder
                    config={resetPasswordFormConfig}
                    onSubmit={onSubmit}
                    onValuesChange={(values) => setPassword(values.password || '')}
                    actions={
                      <>
                        {/* Password Requirements */}
                        <Stack gap={0.5} mb={3}>
                          {requirements.map((req) => (
                            <Stack key={req.label} direction="row" alignItems="center" gap={1}>
                              {req.met ? (
                                <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                              ) : (
                                <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: 'text.muted' }} />
                              )}
                              <Typography variant="body2" color={req.met ? 'success.main' : 'text.muted'}>
                                {req.label}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>

                        <Button
                          type="submit"
                          variant="primary"
                          size="large"
                          fullWidth
                          loading={loading}
                          startIcon={<LockIcon />}
                          sx={{ py: 1.5, boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}33` }}
                        >
                          {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                      </>
                    }
                  />
                </Box>
              </>
            ) : (
              <>
                <Box
                  mb={3}
                  p={2}
                  borderRadius={3}
                  display="inline-flex"
                  bgcolor="success.main"
                >
                  <CheckCircleIcon sx={{ fontSize: 40, color: 'common.white' }} />
                </Box>

                <Typography variant="h4" fontWeight={900} color="common.white" mb={1}>
                  Password updated!
                </Typography>
                <Typography color="text.muted" mb={4}>
                  Your password has been successfully reset. You can now sign in with your new password.
                </Typography>

                <Button
                  component={RouterLink}
                  to="/login"
                  variant="primary"
                  size="large"
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Sign In
                </Button>

                <Typography color="text.muted" textAlign="center" mt={3} variant="body2">
                  Redirecting automatically...
                </Typography>
              </>
            )}

            <Stack direction="row" justifyContent="center" gap={3} mt={6}>
              <Link to="#" external sx={{ color: 'text.muted', fontSize: '0.75rem', opacity: 0.5, '&:hover': { opacity: 1 } }}>
                Privacy Policy
              </Link>
              <Link to="#" external sx={{ color: 'text.muted', fontSize: '0.75rem', opacity: 0.5, '&:hover': { opacity: 1 } }}>
                Terms of Service
              </Link>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
}
