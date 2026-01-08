// Placeholder page - to be implemented
import React, { useState } from 'react';
import { Box, Typography, Link } from '@mui/material';
import { Button, Input, Checkbox, Divider } from '@/primitives';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        sx={{ mb: 2 }}
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        sx={{ mb: 2 }}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Checkbox
          label="Remember me"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <Link href="/forgot-password" sx={{ fontSize: '0.875rem' }}>
          Forgot password?
        </Link>
      </Box>

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
        Sign In
      </Button>

      <Divider label="OR" sx={{ my: 3 }} />

      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        Don't have an account?{' '}
        <Link href="/register" sx={{ fontWeight: 500 }}>
          Sign up
        </Link>
      </Typography>
    </Box>
  );
};

export default LoginPage;
