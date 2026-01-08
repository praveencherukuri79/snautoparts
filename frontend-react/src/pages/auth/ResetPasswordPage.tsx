import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { logoIcon } from '@/assets/icons';
import { IMAGES } from '@/config';
import { authService } from '@/services';
import type { ResetPasswordRequest } from '@/models';
import { Input, Button, Link, IconButton, Alert } from '@/primitives';
import {
  VisibilityIcon,
  VisibilityOffIcon,
  LockResetIcon,
  CheckCircleIcon,
  RadioButtonUncheckedIcon,
} from '@/icons';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch('password', '');

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

                <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3} textAlign="left">
                  {error && (
                    <Alert severity="error" dismissible onDismiss={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

                  <Box>
                    <Typography component="label" fontWeight={500} color="common.white" mb={1} display="block">
                      New Password
                    </Typography>
                    <Input
                      fullWidth
                      placeholder="Enter new password"
                      type={showPassword ? 'text' : 'password'}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 8, message: 'Min 8 characters' },
                        validate: () => requirements.every((r) => r.met) || 'Password does not meet requirements',
                      })}
                      className="dark-input"
                      endIcon={
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.muted' }}>
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      }
                    />
                    {/* Requirements */}
                    <Stack gap={0.5} mt={2}>
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
                  </Box>

                  <Box>
                    <Typography component="label" fontWeight={500} color="common.white" mb={1} display="block">
                      Confirm Password
                    </Typography>
                    <Input
                      fullWidth
                      placeholder="Re-enter password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      {...register('confirmPassword', {
                        required: 'Confirm password',
                        validate: (value) => value === password || 'Passwords do not match',
                      })}
                      className="dark-input"
                      endIcon={
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: 'text.muted' }}>
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      }
                    />
                  </Box>

                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    fullWidth
                    loading={loading}
                    sx={{ py: 1.5, boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}33` }}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </Stack>
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
