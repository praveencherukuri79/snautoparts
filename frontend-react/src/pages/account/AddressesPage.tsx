/**
 * Addresses Page
 * 
 * Manage shipping and billing addresses
 */

import { useState, useEffect } from 'react';
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
  IconButton,
  Chip,
} from '@mui/material';
import {
  LocationOnIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
  CloseIcon,
  CheckCircleIcon,
} from '@/icons';
import { Button } from '@/primitives';
import { FormBuilder } from '@/components/FormBuilder';
import type { FormConfig } from '@/components/FormBuilder';
import { useDialog } from '@/services/dialogService';
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
  const [formKey, setFormKey] = useState(0);
  const dialog = useDialog();

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
    setFormKey(prev => prev + 1);
    setDialogOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormKey(prev => prev + 1);
    setDialogOpen(true);
  };

  const handleDelete = async (address: Address) => {
    const confirmed = await dialog.confirm({
      title: 'Delete Address?',
      message: 'Are you sure you want to delete this address? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true,
      icon: <DeleteIcon sx={{ color: 'error.main' }} />,
    });

    if (!confirmed) return;

    try {
      setSaving(true);
      await profileService.deleteAddress(address.id);
      await loadAddresses();
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

  // Form configuration
  const addressFormConfig: FormConfig = {
    fields: [
      {
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        validation: { required: 'First name is required' },
        colSpan: { xs: 12, sm: 6 },
      },
      {
        name: 'lastName',
        type: 'text',
        label: 'Last Name',
        validation: { required: 'Last name is required' },
        colSpan: { xs: 12, sm: 6 },
      },
      {
        name: 'company',
        type: 'text',
        label: 'Company (Optional)',
        colSpan: { xs: 12 },
      },
      {
        name: 'address1',
        type: 'text',
        label: 'Address Line 1',
        validation: { required: 'Address is required' },
        colSpan: { xs: 12 },
      },
      {
        name: 'address2',
        type: 'text',
        label: 'Address Line 2 (Optional)',
        colSpan: { xs: 12 },
      },
      {
        name: 'city',
        type: 'text',
        label: 'City',
        validation: { required: 'City is required' },
        colSpan: { xs: 12, sm: 7 },
      },
      {
        name: 'state',
        type: 'text',
        label: 'State',
        validation: { required: 'State is required' },
        colSpan: { xs: 12, sm: 5 },
      },
      {
        name: 'zipCode',
        type: 'text',
        label: 'ZIP Code',
        validation: { required: 'ZIP code is required' },
        colSpan: { xs: 12, sm: 6 },
      },
      {
        name: 'country',
        type: 'text',
        label: 'Country',
        validation: { required: 'Country is required' },
        colSpan: { xs: 12, sm: 6 },
      },
      {
        name: 'phone',
        type: 'tel',
        label: 'Phone (Optional)',
        colSpan: { xs: 12 },
      },
      {
        name: 'isDefault',
        type: 'checkbox',
        label: 'Set as default shipping address',
        colSpan: { xs: 12 },
      },
      {
        name: 'isBilling',
        type: 'checkbox',
        label: 'Use as billing address',
        colSpan: { xs: 12 },
      },
    ],
    defaultValues: editingAddress ? {
      firstName: editingAddress.firstName,
      lastName: editingAddress.lastName,
      company: editingAddress.company || '',
      address1: editingAddress.address1,
      address2: editingAddress.address2 || '',
      city: editingAddress.city,
      state: editingAddress.state,
      zipCode: editingAddress.zipCode,
      country: editingAddress.country,
      phone: editingAddress.phone || '',
      isDefault: editingAddress.isDefault,
      isBilling: editingAddress.isBilling,
    } : {
      country: 'US',
      isDefault: false,
      isBilling: false,
    },
    spacing: 2.5,
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
              <LocationOnIcon sx={{ fontSize: 28, color: 'success.main' }} />
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
            startIcon={<AddIcon />}
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
                          icon={<CheckCircleIcon />}
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
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(address)}
                      sx={{ color: 'error.main' }}
                    >
                      <DeleteIcon fontSize="small" />
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
            <LocationOnIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight={700} color="text.primary" mb={1}>
              No addresses yet
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Add your first shipping or billing address
            </Typography>
            <Button startIcon={<AddIcon />} variant="primary" onClick={handleAddNew}>
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
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent>
            <FormBuilder
              key={formKey}
              config={addressFormConfig}
              onSubmit={onSubmit}
              actions={
                <>
                  <Divider sx={{ mb: 2 }} />
                  <Stack direction="row" justifyContent="flex-end" gap={2}>
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
                  </Stack>
                </>
              }
            />
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}
