/**
 * Profile Page
 * 
 * User profile management - edit personal information
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { SaveIcon, PersonIcon } from '@/icons';
import { Button } from '@/primitives';
import { FormBuilder } from '@/components/FormBuilder';
import type { FormConfig } from '@/components/FormBuilder';
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
  const [formKey, setFormKey] = useState(0); // Force form reset

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setFormKey(prev => prev + 1); // Trigger form reset with new data
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

  // Form configuration
  const profileFormConfig: FormConfig = {
    fields: [
      {
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        validation: {
          required: 'First name is required',
          minLength: { value: 2, message: 'First name must be at least 2 characters' },
        },
        colSpan: { xs: 12 },
      },
      {
        name: 'lastName',
        type: 'text',
        label: 'Last Name',
        validation: {
          required: 'Last name is required',
          minLength: { value: 2, message: 'Last name must be at least 2 characters' },
        },
        colSpan: { xs: 12 },
      },
      {
        name: 'phone',
        type: 'tel',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        customValidators: [
          (value) => !value || /^[\d\s\-\+\(\)]+$/.test(value) || 'Invalid phone number format',
        ],
        colSpan: { xs: 12 },
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email Address',
        disabled: true,
        helperText: 'Contact support to change your email address',
        colSpan: { xs: 12 },
      },
    ],
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
    },
    spacing: 3,
    mode: 'onTouched',
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
            <PersonIcon sx={{ fontSize: 28, color: 'primary.main' }} />
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
          bgcolor="background.paper"
          borderRadius={2}
          border={1}
          borderColor="border.light"
          p={4}
        >
          <Typography variant="h6" fontWeight={700} mb={3}>
            Personal Information
          </Typography>

          <FormBuilder
            key={formKey}
            config={profileFormConfig}
            onSubmit={onSubmit}
            actions={
              <>
                {profile?.emailVerified && (
                  <Typography variant="caption" color="success.main" sx={{ mb: 2, display: 'block' }}>
                    ✓ Email verified
                  </Typography>
                )}
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" gap={2}>
                  <Button
                    type="submit"
                    variant="primary"
                    startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setFormKey(prev => prev + 1)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </Stack>
              </>
            }
          />
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
