import React from 'react';
import { Box, Container, Paper, Typography, useTheme, useMediaQuery } from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Title displayed above the form */
  title?: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Maximum width of the form container */
  maxWidth?: 'xs' | 'sm' | 'md';
}

/**
 * AuthLayout Component
 * 
 * Layout for authentication pages (login, register, forgot password).
 * Centers the content and provides a clean, focused design.
 * 
 * @example
 * ```tsx
 * <AuthLayout title="Sign In" subtitle="Welcome back!">
 *   <LoginForm />
 * </AuthLayout>
 * ```
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  maxWidth = 'xs',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          component="a"
          href="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.25rem',
              mr: 1.5,
            }}
          >
            SN
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            SN Auto Parts
          </Typography>
        </Box>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: 2,
        }}
      >
        <Container maxWidth={maxWidth}>
          <Paper
            elevation={isMobile ? 0 : 1}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 2,
              bgcolor: isMobile ? 'transparent' : 'background.paper',
            }}
          >
            {(title || subtitle) && (
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                {title && (
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mb: subtitle ? 1 : 0,
                    }}
                  >
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body1" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}

            {children}
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} SN Auto Parts. All rights reserved.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 3,
            mt: 1,
          }}
        >
          {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((link) => (
            <Typography
              key={link}
              component="a"
              href="#"
              variant="body2"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              {link}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

AuthLayout.displayName = 'AuthLayout';

export default AuthLayout;
