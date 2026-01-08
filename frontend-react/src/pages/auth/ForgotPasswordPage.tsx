// Placeholder page - to be implemented
import React, { useState } from 'react';
import { Box, Typography, Link } from '@mui/material';
import { Button, Input, Alert } from '@/primitives';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setIsLoading(false);
    }, 1000);
  };

  if (submitted) {
    return (
      <Box>
        <Alert severity="success" title="Check your email" sx={{ mb: 3 }}>
          We've sent a password reset link to <strong>{email}</strong>.
          Please check your inbox and follow the instructions.
        </Alert>
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          <Link href="/login">Return to sign in</Link>
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        sx={{ mb: 3 }}
        helperText="Enter the email address associated with your account"
      />

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isLoading}
        size="large"
      >
        Send Reset Link
      </Button>

      <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
        Remember your password?{' '}
        <Link href="/login" sx={{ fontWeight: 500 }}>
          Sign in
        </Link>
      </Typography>
    </Box>
  );
};

export default ForgotPasswordPage;
