/**
 * Profile Page
 * 
 * User profile management - edit personal information
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { Save, Person } from '@mui/icons-material';
import { Button, Input } from '@/primitives';
import { profileService } from '@/services';
import type { UserProfile, UpdateUserProfileRequest } from '@/models';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      reset({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        email: data.email,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const updateData: UpdateUserProfileRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      };

      await profileService.updateProfile(updateData);
      
      setSuccess(true);
      await loadProfile();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box bgcolor="background.default" minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box bgcolor="background.default" minHeight="100vh" py={4}>
      <Box className="container" maxWidth="800px" mx="auto">
        {/* Header */}
        <Stack direction="row" alignItems="center" gap={2} mb={4}>
          <Box
            sx={{
              bgcolor: 'primary.light',
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
            }}
          >
            <Person sx={{ fontSize: 28, color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={900} color="text.primary">
              Profile Settings
            </Typography>
            <Typography color="text.secondary">
              Manage your personal information
            </Typography>
          </Box>
        </Stack>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully!
          </Alert>
        )}

        {/* Profile Form */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          bgcolor="background.paper"
          borderRadius={2}
          border={1}
          borderColor="border.light"
          p={4}
        >
          <Typography variant="h6" fontWeight={700} mb={3}>
            Personal Information
          </Typography>

          <Stack gap={3}>
            {/* First Name */}
            <Input
              label="First Name"
              {...register('firstName', {
                required: 'First name is required',
                minLength: { value: 2, message: 'First name must be at least 2 characters' },
              })}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              fullWidth
            />

            {/* Last Name */}
            <Input
              label="Last Name"
              {...register('lastName', {
                required: 'Last name is required',
                minLength: { value: 2, message: 'Last name must be at least 2 characters' },
              })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              fullWidth
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              type="tel"
              {...register('phone', {
                pattern: {
                  value: /^[\d\s\-\+\(\)]+$/,
                  message: 'Invalid phone number format',
                },
              })}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              placeholder="+1 (555) 123-4567"
              fullWidth
            />

            <Divider />

            {/* Email (read-only) */}
            <Box>
              <Input
                label="Email Address"
                {...register('email')}
                disabled
                fullWidth
                helperText="Contact support to change your email address"
              />
              {profile?.emailVerified && (
                <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                  ✓ Email verified
                </Typography>
              )}
            </Box>
          </Stack>

          {/* Actions */}
          <Stack direction="row" gap={2} mt={4}>
            <Button
              type="submit"
              variant="primary"
              startIcon={saving ? <CircularProgress size={16} /> : <Save />}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => reset()}
              disabled={saving}
            >
              Cancel
            </Button>
          </Stack>
        </Box>

        {/* Account Info */}
        {profile && (
          <Box
            bgcolor="background.paper"
            borderRadius={2}
            border={1}
            borderColor="border.light"
            p={4}
            mt={3}
          >
            <Typography variant="h6" fontWeight={700} mb={3}>
              Account Information
            </Typography>

            <Stack gap={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Account ID</Typography>
                <Typography fontWeight={600}>{profile.id}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Role</Typography>
                <Typography fontWeight={600}>{profile.role}</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Member Since</Typography>
                <Typography fontWeight={600}>
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
