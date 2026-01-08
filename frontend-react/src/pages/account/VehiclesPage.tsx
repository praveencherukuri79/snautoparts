/**
 * Vehicles Page
 * 
 * Manage saved vehicles for parts fitment
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
  DirectionsCarIcon,
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
import type { SavedVehicle, CreateVehicleRequest } from '@/models';

interface VehicleFormData {
  nickname?: string;
  year: number;
  make: string;
  model: string;
  submodel?: string;
  engine?: string;
  isDefault: boolean;
}

export default function VehiclesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<SavedVehicle[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<SavedVehicle | null>(null);
  const [formKey, setFormKey] = useState(0);
  const dialog = useDialog();

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await profileService.getVehicles();
      setVehicles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingVehicle(null);
    setFormKey(prev => prev + 1);
    setDialogOpen(true);
  };

  const handleEdit = (vehicle: SavedVehicle) => {
    setEditingVehicle(vehicle);
    setFormKey(prev => prev + 1);
    setDialogOpen(true);
  };

  const handleDelete = async (vehicle: SavedVehicle) => {
    const confirmed = await dialog.confirm({
      title: 'Delete Vehicle?',
      message: 'Are you sure you want to delete this vehicle? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      isDangerous: true,
      icon: <DeleteIcon sx={{ color: 'error.main' }} />,
    });

    if (!confirmed) return;

    try {
      setSaving(true);
      await profileService.deleteVehicle(vehicle.id);
      await loadVehicles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete vehicle');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      setSaving(true);
      setError(null);

      const vehicleData: CreateVehicleRequest = {
        nickname: data.nickname || undefined,
        year: data.year,
        make: data.make,
        model: data.model,
        submodel: data.submodel || undefined,
        engine: data.engine || undefined,
        isDefault: data.isDefault,
      };

      if (editingVehicle) {
        await profileService.updateVehicle(editingVehicle.id, vehicleData);
      } else {
        await profileService.createVehicle(vehicleData);
      }

      await loadVehicles();
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  // Form configuration
  const vehicleFormConfig: FormConfig = {
    fields: [
      {
        name: 'nickname',
        type: 'text',
        label: 'Nickname (Optional)',
        placeholder: 'e.g., Daily Driver, Weekend Car',
        colSpan: { xs: 12 },
      },
      {
        name: 'year',
        type: 'number',
        label: 'Year',
        validation: {
          required: 'Year is required',
          min: { value: 1900, message: 'Year must be 1900 or later' },
          max: { value: new Date().getFullYear() + 1, message: 'Invalid year' },
        },
        colSpan: { xs: 12, sm: 6 },
      },
      {
        name: 'make',
        type: 'text',
        label: 'Make',
        placeholder: 'e.g., Toyota, Ford',
        validation: { required: 'Make is required' },
        colSpan: { xs: 12, sm: 6 },
      },
      {
        name: 'model',
        type: 'text',
        label: 'Model',
        placeholder: 'e.g., Camry, F-150',
        validation: { required: 'Model is required' },
        colSpan: { xs: 12 },
      },
      {
        name: 'submodel',
        type: 'text',
        label: 'Submodel (Optional)',
        placeholder: 'e.g., XLE, Lariat',
        colSpan: { xs: 12, sm: 6 },
      },
      {
        name: 'engine',
        type: 'text',
        label: 'Engine (Optional)',
        placeholder: 'e.g., 2.5L 4-Cyl, 5.0L V8',
        colSpan: { xs: 12, sm: 6 },
      },
      {
        name: 'isDefault',
        type: 'checkbox',
        label: 'Set as default vehicle',
        colSpan: { xs: 12 },
      },
    ],
    defaultValues: editingVehicle ? {
      nickname: editingVehicle.nickname || '',
      year: editingVehicle.year,
      make: editingVehicle.make,
      model: editingVehicle.model,
      submodel: editingVehicle.submodel || '',
      engine: editingVehicle.engine || '',
      isDefault: editingVehicle.isDefault,
    } : {
      isDefault: false,
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
                bgcolor: 'info.light',
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
              }}
            >
              <DirectionsCarIcon sx={{ fontSize: 28, color: 'info.main' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} color="text.primary">
                My Vehicles
              </Typography>
              <Typography color="text.secondary">
                Save your vehicles for faster parts search
              </Typography>
            </Box>
          </Stack>
          <Button
            startIcon={<AddIcon />}
            variant="primary"
            onClick={handleAddNew}
          >
            Add Vehicle
          </Button>
        </Stack>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Vehicles List */}
        {vehicles.length > 0 ? (
          <Stack gap={2}>
            {vehicles.map((vehicle) => (
              <Box
                key={vehicle.id}
                bgcolor="background.paper"
                borderRadius={2}
                border={1}
                borderColor="border.light"
                p={3}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                  <Stack direction="row" gap={2} flex={1}>
                    <Box
                      sx={{
                        bgcolor: 'primary.light',
                        p: 2,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <DirectionsCarIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Box>

                    <Box flex={1}>
                      <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                        <Typography variant="h6" fontWeight={700} color="text.primary">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </Typography>
                        {vehicle.isDefault && (
                          <Chip
                            label="Default"
                            size="small"
                            color="primary"
                            icon={<CheckCircleIcon />}
                            sx={{ height: 24 }}
                          />
                        )}
                      </Stack>

                      {vehicle.nickname && (
                        <Typography variant="body2" color="text.secondary" mb={0.5}>
                          "{vehicle.nickname}"
                        </Typography>
                      )}

                      <Stack direction="row" gap={2} flexWrap="wrap">
                        {vehicle.submodel && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Submodel:</strong> {vehicle.submodel}
                          </Typography>
                        )}
                        {vehicle.engine && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Engine:</strong> {vehicle.engine}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>

                  <Stack direction="row" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(vehicle)}
                      sx={{ color: 'primary.main' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(vehicle)}
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
            <DirectionsCarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight={700} color="text.primary" mb={1}>
              No vehicles saved
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Add your vehicle to find compatible parts faster
            </Typography>
            <Button startIcon={<AddIcon />} variant="primary" onClick={handleAddNew}>
              Add Vehicle
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
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </Typography>
              <IconButton onClick={() => setDialogOpen(false)} disabled={saving}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent>
            <FormBuilder
              key={formKey}
              config={vehicleFormConfig}
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
                      {saving ? 'Saving...' : editingVehicle ? 'Update' : 'Add Vehicle'}
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
