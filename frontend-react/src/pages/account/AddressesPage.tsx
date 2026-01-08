/**
 * Addresses Page
 * 
 * Manage shipping and billing addresses
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from '@mui/material';
import {
  LocationOn,
  Add,
  Edit,
  Delete,
  Close,
  CheckCircle,
} from '@mui/icons-material';
import { Button, Input, Checkbox } from '@/primitives';
import { profileService } from '@/services';
import type { Address, CreateAddressRequest } from '@/models';

interface AddressFormData {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  isBilling: boolean;
}

export default function AddressesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<AddressFormData>({
    defaultValues: {
      country: 'US',
      isDefault: false,
      isBilling: false,
    },
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await profileService.getAddresses();
      setAddresses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    reset({
      country: 'US',
      isDefault: false,
      isBilling: false,
    });
    setDialogOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    reset({
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault,
      isBilling: address.isBilling,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setSaving(true);
      await profileService.deleteAddress(id);
      await loadAddresses();
      setDeleteConfirmId(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete address');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      setSaving(true);
      setError(null);

      const addressData: CreateAddressRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company || undefined,
        address1: data.address1,
        address2: data.address2 || undefined,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        phone: data.phone || undefined,
        isDefault: data.isDefault,
        isBilling: data.isBilling,
      };

      if (editingAddress) {
        await profileService.updateAddress(editingAddress.id, addressData);
      } else {
        await profileService.createAddress(addressData);
      }

      await loadAddresses();
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
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
      <Box className="container" maxWidth="1000px" mx="auto">
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
          <Stack direction="row" alignItems="center" gap={2}>
            <Box
              sx={{
                bgcolor: 'success.light',
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
              }}
            >
              <LocationOn sx={{ fontSize: 28, color: 'success.main' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} color="text.primary">
                Addresses
              </Typography>
              <Typography color="text.secondary">
                Manage your shipping and billing addresses
              </Typography>
            </Box>
          </Stack>
          <Button
            startIcon={<Add />}
            variant="primary"
            onClick={handleAddNew}
          >
            Add Address
          </Button>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Addresses List */}
        {addresses.length > 0 ? (
          <Stack gap={2}>
            {addresses.map((address) => (
              <Box
                key={address.id}
                bgcolor="background.paper"
                borderRadius={2}
                border={1}
                borderColor="border.light"
                p={3}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" gap={1} mb={1}>
                      <Typography fontWeight={700} color="text.primary">
                        {address.firstName} {address.lastName}
                      </Typography>
                      {address.isDefault && (
                        <Chip
                          label="Default"
                          size="small"
                          color="primary"
                          icon={<CheckCircle />}
                          sx={{ height: 24 }}
                        />
                      )}
                      {address.isBilling && (
                        <Chip
                          label="Billing"
                          size="small"
                          variant="outlined"
                          sx={{ height: 24 }}
                        />
                      )}
                    </Stack>

                    {address.company && (
                      <Typography variant="body2" color="text.secondary">
                        {address.company}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {address.address1}
                    </Typography>
                    {address.address2 && (
                      <Typography variant="body2" color="text.secondary">
                        {address.address2}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {address.city}, {address.state} {address.zipCode}
                    </Typography>
                    {address.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {address.phone}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction="row" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(address)}
                      sx={{ color: 'primary.main' }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirmId(address.id)}
                      sx={{ color: 'error.main' }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <Box
            bgcolor="background.paper"
            borderRadius={2}
            border={1}
            borderColor="border.light"
            p={8}
            textAlign="center"
          >
            <LocationOn sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight={700} color="text.primary" mb={1}>
              No addresses yet
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Add your first shipping or billing address
            </Typography>
            <Button startIcon={<Add />} variant="primary" onClick={handleAddNew}>
              Add Address
            </Button>
          </Box>
        )}

        {/* Add/Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => !saving && setDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Typography>
              <IconButton onClick={() => setDialogOpen(false)} disabled={saving}>
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>

          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Stack gap={2.5}>
                <Stack direction="row" gap={2}>
                  <Input
                    label="First Name"
                    {...register('firstName', { required: 'First name is required' })}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    fullWidth
                  />
                  <Input
                    label="Last Name"
                    {...register('lastName', { required: 'Last name is required' })}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    fullWidth
                  />
                </Stack>

                <Input
                  label="Company (Optional)"
                  {...register('company')}
                  fullWidth
                />

                <Input
                  label="Address Line 1"
                  {...register('address1', { required: 'Address is required' })}
                  error={!!errors.address1}
                  helperText={errors.address1?.message}
                  fullWidth
                />

                <Input
                  label="Address Line 2 (Optional)"
                  {...register('address2')}
                  fullWidth
                />

                <Stack direction="row" gap={2}>
                  <Input
                    label="City"
                    {...register('city', { required: 'City is required' })}
                    error={!!errors.city}
                    helperText={errors.city?.message}
                    fullWidth
                  />
                  <Input
                    label="State"
                    {...register('state', { required: 'State is required' })}
                    error={!!errors.state}
                    helperText={errors.state?.message}
                    sx={{ width: '40%' }}
                  />
                </Stack>

                <Stack direction="row" gap={2}>
                  <Input
                    label="ZIP Code"
                    {...register('zipCode', { required: 'ZIP code is required' })}
                    error={!!errors.zipCode}
                    helperText={errors.zipCode?.message}
                    fullWidth
                  />
                  <Input
                    label="Country"
                    {...register('country', { required: 'Country is required' })}
                    error={!!errors.country}
                    helperText={errors.country?.message}
                    fullWidth
                  />
                </Stack>

                <Input
                  label="Phone (Optional)"
                  type="tel"
                  {...register('phone')}
                  fullWidth
                />

                <Divider />

                <Stack gap={1}>
                  <Checkbox
                    label="Set as default shipping address"
                    {...register('isDefault')}
                    checked={watch('isDefault')}
                  />
                  <Checkbox
                    label="Use as billing address"
                    {...register('isBilling')}
                    checked={watch('isBilling')}
                  />
                </Stack>
              </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} /> : undefined}
              >
                {saving ? 'Saving...' : editingAddress ? 'Update' : 'Add Address'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!deleteConfirmId}
          onClose={() => !saving && setDeleteConfirmId(null)}
          maxWidth="xs"
        >
          <DialogTitle>Delete Address?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this address? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmId(null)} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} /> : undefined}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
