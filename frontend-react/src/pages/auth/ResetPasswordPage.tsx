import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { useState } from 'react';
import { logoIcon } from '@/assets/icons';
import { IMAGES } from '@/config';

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>();

  const password = watch('password', '');

  // Password requirements
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number or special character', met: /[0-9]|[^A-Za-z0-9]/.test(password) },
  ];

  const onSubmit = (data: ResetPasswordFormData) => {
    console.log('Reset password:', { token, ...data });
    setIsSuccess(true);
    setTimeout(() => navigate('/login'), 3000);
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
                  Create new password
                </Typography>
                <Typography color="text.muted" mb={4}>
                  Your new password must be different from previously used passwords.
                </Typography>

                <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3} textAlign="left">
                  {/* Password */}
                  <Box>
                    <Typography component="label" fontWeight={500} color="common.white" mb={1} display="block">
                      New Password
                    </Typography>
                    <TextField
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
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.muted' }}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    {/* Requirements */}
                    <Stack gap={0.5} mt={2}>
                      {requirements.map((req) => (
                        <Stack key={req.label} direction="row" alignItems="center" gap={1}>
                          {req.met ? (
                            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                          ) : (
                            <RadioButtonUnchecked sx={{ fontSize: 16, color: 'text.muted' }} />
                          )}
                          <Typography variant="body2" color={req.met ? 'success.main' : 'text.muted'}>
                            {req.label}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>

                  {/* Confirm Password */}
                  <Box>
                    <Typography component="label" fontWeight={500} color="common.white" mb={1} display="block">
                      Confirm Password
                    </Typography>
                    <TextField
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
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: 'text.muted' }}>
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
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
                    Reset Password
                  </Button>
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
                  <CheckCircle sx={{ fontSize: 40, color: 'common.white' }} />
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
                  variant="contained"
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
