// Placeholder page - to be implemented
import React, { useState } from 'react';
import { Box, Typography, Link } from '@mui/material';
import { Button, Input, Checkbox, Divider } from '@/primitives';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Input
          label="First Name"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          required
        />
        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange('lastName')}
          required
        />
      </Box>
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        required
        fullWidth
        sx={{ mb: 2 }}
      />
      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange('password')}
        required
        fullWidth
        sx={{ mb: 2 }}
        helperText="At least 8 characters with uppercase, lowercase, and number"
      />
      <Input
        label="Confirm Password"
        type="password"
        value={formData.passwordConfirmation}
        onChange={handleChange('passwordConfirmation')}
        required
        fullWidth
        sx={{ mb: 2 }}
      />
      
      <Checkbox
        label={
          <Typography variant="body2">
            I agree to the{' '}
            <Link href="/terms" target="_blank">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" target="_blank">Privacy Policy</Link>
          </Typography>
        }
        checked={acceptTerms}
        onChange={(e) => setAcceptTerms(e.target.checked)}
        sx={{ mb: 3 }}
      />

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={isLoading}
        size="large"
      >
        Create Account
      </Button>

      <Divider label="OR" sx={{ my: 3 }} />

      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href="/login" sx={{ fontWeight: 500 }}>
          Sign in
        </Link>
      </Typography>
    </Box>
  );
};

export default RegisterPage;
