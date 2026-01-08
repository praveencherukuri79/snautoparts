import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { logoIcon } from '@/assets/icons';
import { IMAGES } from '@/config';
import { authService } from '@/services';
import type { ForgotPasswordRequest } from '@/models';
import { Input, Button, Link, Alert } from '@/primitives';
import { ArrowBackIcon, LockResetIcon } from '@/icons';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestData: ForgotPasswordRequest = {
        email: data.email,
      };
      
      await authService.forgotPassword(requestData);
      
      setIsSubmitted(true);
      setTimeout(() => navigate('/login'), 5000);
    } catch (err: any) {
      console.error('Forgot password failed:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
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
          startIcon={<ArrowBackIcon />}
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
              Don't worry,<br />we got you.
            </Typography>
            <Typography color="text.muted" maxWidth={400} fontSize="1.125rem">
              Password recovery is quick and easy. We'll have you back in the driver's seat in no time.
            </Typography>
          </Stack>
        </Box>

        {/* Form Section */}
        <Stack flex={1} justifyContent="center" alignItems="center" p={4} bgcolor="background.surfaceDark">
          <Box width="100%" maxWidth={480} textAlign="center">
            {!isSubmitted ? (
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
                  Reset your password
                </Typography>
                <Typography color="text.muted" mb={4}>
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>

                <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3} textAlign="left">
                  {error && (
                    <Alert severity="error" dismissible onDismiss={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

                  <Box>
                    <Typography component="label" fontWeight={500} color="common.white" mb={1} display="block">
                      Email Address
                    </Typography>
                    <Input
                      fullWidth
                      placeholder="name@example.com"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      {...register('email', { required: 'Email is required' })}
                      className="dark-input"
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
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <Typography color="text.muted" textAlign="center">
                    Remember your password?{' '}
                    <Link to="/login" sx={{ color: 'primary.main', fontWeight: 600 }}>
                      Sign in
                    </Link>
                  </Typography>
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
                  <LockResetIcon sx={{ fontSize: 40, color: 'common.white' }} />
                </Box>

                <Typography variant="h4" fontWeight={900} color="common.white" mb={1}>
                  Check your email
                </Typography>
                <Typography color="text.muted" mb={4}>
                  If an account exists with that email, we've sent password reset instructions. Check your inbox and spam folder.
                </Typography>

                <Button
                  component={RouterLink}
                  to="/login"
                  variant="primary"
                  size="large"
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Back to Login
                </Button>

                <Typography color="text.muted" textAlign="center" mt={3} variant="body2">
                  Redirecting automatically in 5 seconds...
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
