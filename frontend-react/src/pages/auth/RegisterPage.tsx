import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Stack, Typography, Divider } from '@mui/material';
import { useState } from 'react';
import { logoIcon, googleIcon } from '@/assets/icons';
import { IMAGES } from '@/config';
import { useAuth } from '@/hooks';
import type { RegisterRequest } from '@/models';
import { Button, Link, Alert } from '@/primitives';
import { FormBuilder } from '@/components/FormBuilder';
import type { FormConfig } from '@/components/FormBuilder';
import {
  VerifiedIcon,
  LocalShippingIcon,
  PersonIcon,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Form configuration with auth style
  const registerFormConfig: FormConfig = {
    authStyle: true,
    fields: [
      {
        name: 'fullName',
        type: 'text',
        label: 'Full Name',
        placeholder: 'John Doe',
        validation: {
          required: 'Full name is required',
          minLength: { value: 3, message: 'Name must be at least 3 characters' },
        },
        authStyle: { enabled: true },
        colSpan: { xs: 12 },
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'you@example.com',
        validation: {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        },
        authStyle: { enabled: true },
        colSpan: { xs: 12 },
      },
      {
        name: 'password',
        type: 'password',
        label: 'Password',
        placeholder: 'Create a strong password',
        validation: {
          required: 'Password is required',
          minLength: { value: 8, message: 'Password must be at least 8 characters' },
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
        placeholder: 'Re-enter your password',
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
      {
        name: 'acceptTerms',
        type: 'checkbox',
        label: (
          <Typography component="span" color="text.muted" variant="body2">
            I agree to the{' '}
            <Link to="#" external sx={{ color: 'primary.main' }}>
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="#" external sx={{ color: 'primary.main' }}>
              Privacy Policy
            </Link>
          </Typography>
        ) as any,
        validation: {
          required: 'You must accept the terms',
        },
        colSpan: { xs: 12 },
      },
    ],
    spacing: 2.5,
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

            <Box>
              {/* Social Login Buttons */}
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

              {error && (
                <Alert severity="error" dismissible onDismiss={() => setError(null)} sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <FormBuilder
                config={registerFormConfig}
                onSubmit={onSubmit}
                actions={
                  <>
                    <Button
                      type="submit"
                      variant="primary"
                      size="large"
                      fullWidth
                      loading={loading}
                          startIcon={<PersonIcon />}
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
                  </>
                }
              />
            </Box>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
}
