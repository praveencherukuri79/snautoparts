// Placeholder page - to be implemented
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Button, Input } from '@/primitives';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const token = searchParams.get('token'); // Will be used for actual API call
  
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login');
    }, 1000);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Input
        label="New Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        sx={{ mb: 2 }}
        helperText="At least 8 characters with uppercase, lowercase, and number"
      />
      <Input
        label="Confirm New Password"
        type="password"
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        required
        fullWidth
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
        Reset Password
      </Button>
    </Box>
  );
};

export default ResetPasswordPage;
