/**
 * Account Settings Page
 * 
 * Manage account preferences, security, and notifications
 * Uses FormBuilder for clean form management
 */

import { useState, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import {
  Box,
  Stack,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Switch,
  styled,
} from '@mui/material';
import { LockIcon, NotificationsIcon, PersonIcon, DeleteIcon } from '@/icons';
import { Button } from '@/primitives';
import { FormBuilder } from '@/components/FormBuilder';
import type { FormConfig } from '@/components/FormBuilder';
import { authAtom } from '@/state/atoms';
import { profileService } from '@/services';
import { useDialog } from '@/services/dialogService';
import type { UserProfile } from '@/models';

// Styled components
const SectionIcon = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 28,
  display: 'flex',
  alignItems: 'center',
}));

const SectionCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.border?.light}`,
  padding: theme.spacing(3),
}));

// Password change form configuration
const passwordFormConfig: FormConfig = {
  fields: [
    {
      name: 'currentPassword',
      type: 'password',
      label: 'Current Password',
      validation: {
        required: 'Current password is required',
      },
      colSpan: { xs: 12 },
    },
    {
      name: 'newPassword',
      type: 'password',
      label: 'New Password',
      validation: {
        required: 'New password is required',
        minLength: {
          value: 8,
          message: 'Password must be at least 8 characters',
        },
      },
      colSpan: { xs: 12 },
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirm New Password',
      validation: {
        required: 'Please confirm your password',
      },
      colSpan: { xs: 12 },
    },
  ],
  spacing: 2.5,
  mode: 'onSubmit',
};

export default function SettingsPage() {
  const auth = useRecoilValue(authAtom);
  const dialog = useDialog();
  const [loading, setLoading] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Notification preferences state
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await dialog.confirm({
      title: 'Delete Account?',
      message: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      isDangerous: true,
      icon: <DeleteIcon sx={{ color: 'error.main' }} />,
    });

    if (!confirmed) return;

    try {
      setError(null);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Account deletion request submitted');
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    }
  };

  const onPasswordSubmit = async (data: any) => {
    try {
      setChangingPassword(true);
      setError(null);
      setSuccess(null);

      if (data.newPassword !== data.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // TODO: Call API to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Password changed successfully');
      setShowPasswordForm(false);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
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
      <Box className="container">
        <Typography variant="h4" fontWeight={700} color="text.primary" mb={1}>
          Account Settings
        </Typography>
        <Typography color="text.secondary" mb={4}>
          Manage your account preferences and security settings
        </Typography>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Stack spacing={4}>
          {/* Security Section */}
          <Box>
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <SectionIcon><LockIcon /></SectionIcon>
              <Typography variant="h6" fontWeight={600}>
                Security
              </Typography>
            </Stack>
            
            <SectionCard>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600} mb={0.5}>
                      Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Change your account password
                    </Typography>
                  </Box>
                  {!showPasswordForm && (
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      Change Password
                    </Button>
                  )}
                </Stack>

                {/* Password Change Form - Using FormBuilder! */}
                {showPasswordForm && (
                  <>
                    <Divider />
                    <FormBuilder
                      config={passwordFormConfig}
                      onSubmit={onPasswordSubmit}
                      actions={
                        <Stack direction="row" gap={2} justifyContent="flex-end">
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setShowPasswordForm(false);
                              setError(null);
                            }}
                            disabled={changingPassword}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={changingPassword}
                            startIcon={changingPassword ? <CircularProgress size={16} /> : <LockIcon />}
                          >
                            {changingPassword ? 'Updating...' : 'Update Password'}
                          </Button>
                        </Stack>
                      }
                    />
                  </>
                )}
              </Stack>
            </SectionCard>
          </Box>

          {/* Notification Preferences */}
          <Box>
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <SectionIcon><NotificationsIcon /></SectionIcon>
              <Typography variant="h6" fontWeight={600}>
                Notifications
              </Typography>
            </Stack>
            
            <SectionCard>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box flex={1}>
                    <Typography fontWeight={600} mb={0.5}>
                      Order Updates
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive email notifications about your orders
                    </Typography>
                  </Box>
                  <Switch
                    checked={orderUpdates}
                    onChange={(e) => setOrderUpdates(e.target.checked)}
                    color="primary"
                  />
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box flex={1}>
                    <Typography fontWeight={600} mb={0.5}>
                      Promotions & Offers
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive emails about new products and special offers
                    </Typography>
                  </Box>
                  <Switch
                    checked={promotions}
                    onChange={(e) => setPromotions(e.target.checked)}
                    color="primary"
                  />
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box flex={1}>
                    <Typography fontWeight={600} mb={0.5}>
                      Newsletter
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive our monthly newsletter with tips and updates
                    </Typography>
                  </Box>
                  <Switch
                    checked={newsletter}
                    onChange={(e) => setNewsletter(e.target.checked)}
                    color="primary"
                  />
                </Stack>
              </Stack>
            </SectionCard>
          </Box>

          {/* Account Management */}
          <Box>
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <SectionIcon><PersonIcon /></SectionIcon>
              <Typography variant="h6" fontWeight={600}>
                Account Management
              </Typography>
            </Stack>
            
            <SectionCard>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600} mb={0.5}>
                      Email Address
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {profile?.email || auth.user?.email || 'Not available'}
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600} mb={0.5}>
                      Download Your Data
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Request a copy of your account data
                    </Typography>
                  </Box>
                  <Button variant="outlined" size="small">
                    Request Data
                  </Button>
                </Stack>

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600} mb={0.5} color="error.main">
                      Delete Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Permanently delete your account and all data
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteAccount}
                    sx={{ color: 'error.main', borderColor: 'error.main' }}
                  >
                    Delete Account
                  </Button>
                </Stack>
              </Stack>
            </SectionCard>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

