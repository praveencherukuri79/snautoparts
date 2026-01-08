import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Stack, Typography, Divider, FormControlLabel, Checkbox as MuiCheckbox } from '@mui/material';
import { useState } from 'react';
import { logoIcon, googleIcon } from '@/assets/icons';
import { IMAGES } from '@/config';
import { useAuth } from '@/hooks';
import type { RegisterRequest } from '@/models';
import { Input, Button, Link, IconButton, Alert } from '@/primitives';
import {
  VisibilityIcon,
  VisibilityOffIcon,
  VerifiedIcon,
  LocalShippingIcon,
} from '@/icons';

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const nameParts = data.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const registerData: RegisterRequest = {
        email: data.email,
        password: data.password,
        firstName,
        lastName,
      };
      
      await registerUser(registerData);
      navigate('/account');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
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
        <Stack direction="row" alignItems="center" gap={2}>
          <Typography color="text.muted" variant="body2" display={{ xs: 'none', sm: 'block' }}>
            Already a member?
          </Typography>
          <Button
            component={RouterLink}
            to="/login"
            variant="outlined"
            className="btn-dark-outlined"
          >
            Sign In
          </Button>
        </Stack>
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
          <Stack position="absolute" sx={{ inset: 0 }} justifyContent="flex-end" p={8} maxWidth={500}>
            <Typography variant="h2" color="common.white" fontWeight={900} lineHeight={1.1} mb={2}>
              Performance<br />starts here.
            </Typography>
            <Typography color="text.muted" fontSize="1.125rem">
              Join thousands of automotive enthusiasts who trust SN Auto Parts.
            </Typography>
            <Stack direction="row" gap={3} mt={4}>
              <Stack direction="row" alignItems="center" gap={1}>
                <VerifiedIcon color="primary" fontSize="small" />
                <Typography color="text.muted" variant="body2">Quality Guaranteed</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={1}>
                <LocalShippingIcon color="primary" fontSize="small" />
                <Typography color="text.muted" variant="body2">Fast Shipping</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        {/* Form Section */}
        <Stack flex={1} justifyContent="center" alignItems="center" p={4} bgcolor="background.surfaceDark">
          <Box width="100%" maxWidth={480}>
            <Typography variant="h4" fontWeight={900} color="common.white" mb={1}>
              Create your account
            </Typography>
            <Typography color="text.muted" mb={4}>
              Start getting exclusive deals on premium auto parts today.
            </Typography>

            <Stack direction="row" gap={2} mb={3}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Box component="img" src={googleIcon} alt="Google" width={20} height={20} />}
                className="btn-dark-outlined"
              >
                Google
              </Button>
              <Button
                variant="outlined"
                fullWidth
                className="btn-dark-outlined"
              >
                Apple
              </Button>
            </Stack>

            <Divider sx={{ mb: 3, '&::before, &::after': { borderColor: 'border.dark' } }}>
              <Typography color="text.muted" variant="caption" fontWeight={700} textTransform="uppercase">
                Or register with email
              </Typography>
            </Divider>

            <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3}>
              {error && (
                <Alert severity="error" dismissible onDismiss={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <Box>
                <Typography component="label" variant="body2" fontWeight={500} color="common.white" mb={1} display="block">
                  Full Name
                </Typography>
                <Input
                  fullWidth
                  placeholder="e.g. John Doe"
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  {...register('fullName', { required: 'Full name is required' })}
                  className="dark-input"
                />
              </Box>

              <Box>
                <Typography component="label" variant="body2" fontWeight={500} color="common.white" mb={1} display="block">
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

              <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
                <Box flex={1}>
                  <Typography component="label" variant="body2" fontWeight={500} color="common.white" mb={1} display="block">
                    Password
                  </Typography>
                  <Input
                    fullWidth
                    placeholder="Min. 8 chars"
                    type={showPassword ? 'text' : 'password'}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                    className="dark-input"
                    endIcon={
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'text.muted' }}>
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    }
                  />
                </Box>
                <Box flex={1}>
                  <Typography component="label" variant="body2" fontWeight={500} color="common.white" mb={1} display="block">
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
              </Stack>

              <FormControlLabel
                control={
                  <MuiCheckbox
                    {...register('acceptTerms', { required: 'You must accept terms' })}
                    sx={{ color: 'border.dark', '&.Mui-checked': { color: 'primary.main' } }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.muted">
                    I agree to the{' '}
                    <Link to="#" external sx={{ color: 'common.white' }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="#" external sx={{ color: 'common.white' }}>Privacy Policy</Link>.
                  </Typography>
                }
              />

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                sx={{ py: 1.5, boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}33` }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Typography color="text.muted" textAlign="center" mt={2}>
                Having trouble?{' '}
                <Link to="#" external sx={{ color: 'primary.main', fontWeight: 500 }}>
                  Contact Support
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
}
