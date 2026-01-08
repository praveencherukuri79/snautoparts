import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, LockReset } from '@mui/icons-material';
import { useState } from 'react';
import { logoIcon } from '@/assets/icons';
import { IMAGES } from '@/config';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = (data: ForgotPasswordFormData) => {
    console.log('Forgot password:', data);
    setIsSubmitted(true);
    // Auto redirect after 5 seconds
    setTimeout(() => navigate('/login'), 5000);
  };

  return (
    <Stack minHeight="100vh" bgcolor="background.surfaceDark">
      {/* Header - Full Width */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" px={{ xs: 3, lg: 5 }} py={2} borderBottom={1} borderColor="border.dark">
        <Stack direction="row" alignItems="center" gap={1} component={RouterLink} to="/" sx={{ textDecoration: 'none' }}>
          <Box component="img" src={logoIcon} alt="Logo" width={32} height={32} />
          <Typography variant="h6" fontWeight={700} color="common.white">
            SN AutoParts
          </Typography>
        </Stack>
        <Button
          component={RouterLink}
          to="/login"
          startIcon={<ArrowBack />}
          className="btn-primary-ghost"
        >
          Back to Login
        </Button>
      </Stack>

      {/* Main Content - Split View */}
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
          {/* Gradient overlays */}
          <Box position="absolute" sx={{ inset: 0, background: 'linear-gradient(to top, var(--color-bg-surface-dark), transparent)' }} />
          <Box position="absolute" sx={{ inset: 0, background: 'linear-gradient(to right, var(--color-bg-surface-dark), transparent 50%)' }} />
          {/* Hero Content - bottom left */}
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
                {/* Icon */}
                <Box
                  mb={3}
                  p={2}
                  borderRadius={3}
                  display="inline-flex"
                  bgcolor="background.inputDark"
                  border={1}
                  borderColor="border.dark"
                >
                  <LockReset sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>

                <Typography variant="h4" fontWeight={900} color="common.white" mb={1}>
                  Reset your password
                </Typography>
                <Typography color="text.muted" mb={4}>
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>

                <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3} textAlign="left">
                  {/* Email */}
                  <Box>
                    <Typography component="label" fontWeight={500} color="common.white" mb={1} display="block">
                      Email Address
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="name@example.com"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      {...register('email', { required: 'Email is required' })}
                      className="dark-input"
                    />
                  </Box>

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ py: 1.5, boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}33` }}
                  >
                    Send Reset Link
                  </Button>

                  {/* Back to Login */}
                  <Typography color="text.muted" textAlign="center">
                    Remember your password?{' '}
                    <Link component={RouterLink} to="/login" color="primary.main" fontWeight={600}>
                      Sign in
                    </Link>
                  </Typography>
                </Stack>
              </>
            ) : (
              <>
                {/* Success State */}
                <Box
                  mb={3}
                  p={2}
                  borderRadius={3}
                  display="inline-flex"
                  bgcolor="success.main"
                >
                  <LockReset sx={{ fontSize: 40, color: 'common.white' }} />
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
                  variant="contained"
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

            {/* Footer Links */}
            <Stack direction="row" justifyContent="center" gap={3} mt={6}>
              <Link href="#" color="text.muted" variant="caption" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                Privacy Policy
              </Link>
              <Link href="#" color="text.muted" variant="caption" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                Terms of Service
              </Link>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
}
