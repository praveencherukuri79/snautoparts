import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack, Lock, Verified, LocalShipping } from '@mui/icons-material';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { logoIcon, googleIcon } from '@/assets/icons';
import { IMAGES } from '@/config';
import { authService } from '@/services';
import { authAtom } from '@/state/atoms/authAtom';
import type { LoginRequest } from '@/models';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuthState = useSetRecoilState(authAtom);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const loginData: LoginRequest = {
        email: data.email,
        password: data.password,
      };
      
      const response = await authService.login(loginData);
      
      // Update Recoil auth state
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
        featureConfig: null, // Will be loaded separately if needed
      });
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Redirect to account dashboard
      navigate('/account');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack minHeight="100vh" bgcolor="background.surfaceDark">
      {/* Header - Full Width */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" px={{ xs: 3, lg: 5 }} py={2} borderBottom={1} borderColor="border.dark">
        <Stack direction="row" alignItems="center" gap={1}>
          <Box component="img" src={logoIcon} alt="Logo" width={32} height={32} />
          <Typography variant="h6" fontWeight={700} color="common.white">
            SN AutoParts
          </Typography>
        </Stack>
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBack />}
          className="btn-primary-ghost"
        >
          Return to Shop
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
              Performance<br />starts here.
            </Typography>
            <Typography color="text.muted" maxWidth={400} fontSize="1.125rem">
              Join over 50,000 gearheads who trust SN Auto Parts for their restoration and performance needs.
            </Typography>
            <Stack direction="row" gap={4} mt={4}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Verified color="primary" fontSize="small" />
                <Typography color="text.muted" variant="body2" fontWeight={500}>Quality Guaranteed</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={1}>
                <LocalShipping color="primary" fontSize="small" />
                <Typography color="text.muted" variant="body2" fontWeight={500}>Fast Shipping</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        {/* Form Section */}
        <Stack flex={1} justifyContent="center" alignItems="center" p={4} bgcolor="background.surfaceDark">
          <Box width="100%" maxWidth={480}>
            <Typography variant="h4" fontWeight={900} color="common.white" mb={1}>
              Welcome Back, Gearhead
            </Typography>
            <Typography color="text.muted" mb={4}>
              Access your order history and saved garage.
            </Typography>

            <Stack component="form" onSubmit={handleSubmit(onSubmit)} gap={3}>
              {/* Error Alert */}
              {error && (
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {/* Email */}
              <Box>
                <Typography component="label" fontWeight={500} color="common.white" mb={1} display="block">
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...register('email', { required: 'Email is required' })}
                  className="dark-input"
                />
              </Box>

              {/* Password */}
              <Box>
                <Typography component="label" fontWeight={500} color="common.white" mb={1} display="block">
                  Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  {...register('password', { required: 'Password is required' })}
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
                <Box textAlign="right" mt={1}>
                  <Link component={RouterLink} to="/forgot-password" color="primary.main" variant="body2" fontWeight={500}>
                    Forgot Password?
                  </Link>
                </Box>
              </Box>

              {/* Submit */}
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Lock />}
                sx={{ py: 1.5, boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}33` }}
              >
                {loading ? 'Signing In...' : 'Secure Login'}
              </Button>

              {/* Divider */}
              <Divider sx={{ '&::before, &::after': { borderColor: 'border.dark' } }}>
                <Typography color="text.muted">Or continue with</Typography>
              </Divider>

              {/* Social Buttons */}
              <Stack direction="row" gap={2}>
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
                  Facebook
                </Button>
              </Stack>

              {/* Sign Up Link */}
              <Typography color="text.muted" textAlign="center" mt={2}>
                Don't have an account?{' '}
                <Link component={RouterLink} to="/register" color="primary.main" fontWeight={600}>
                  Sign up for free
                </Link>
              </Typography>

              {/* Footer Links */}
              <Stack direction="row" justifyContent="center" gap={3} mt={6}>
                <Link href="#" color="text.muted" variant="caption" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                  Privacy Policy
                </Link>
                <Link href="#" color="text.muted" variant="caption" sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                  Terms of Service
                </Link>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
}
