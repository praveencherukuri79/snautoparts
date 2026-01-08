/**
 * Vehicles Page
 * 
 * Manage saved vehicles for parts fitment
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
  DirectionsCar,
  Add,
  Edit,
  Delete,
  Close,
  CheckCircle,
} from '@mui/icons-material';
import { Button, Input, Checkbox } from '@/primitives';
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
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<VehicleFormData>({
    defaultValues: {
      isDefault: false,
    },
  });

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
    reset({
      isDefault: false,
    });
    setDialogOpen(true);
  };

  const handleEdit = (vehicle: SavedVehicle) => {
    setEditingVehicle(vehicle);
    reset({
      nickname: vehicle.nickname || '',
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      submodel: vehicle.submodel || '',
      engine: vehicle.engine || '',
      isDefault: vehicle.isDefault,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setSaving(true);
      await profileService.deleteVehicle(id);
      await loadVehicles();
      setDeleteConfirmId(null);
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
              <DirectionsCar sx={{ fontSize: 28, color: 'info.main' }} />
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
            startIcon={<Add />}
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
                      <DirectionsCar sx={{ fontSize: 32, color: 'primary.main' }} />
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
                            icon={<CheckCircle />}
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
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirmId(vehicle.id)}
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
            <DirectionsCar sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight={700} color="text.primary" mb={1}>
              No vehicles saved
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Add your vehicle to find compatible parts faster
            </Typography>
            <Button startIcon={<Add />} variant="primary" onClick={handleAddNew}>
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
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>

          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Stack gap={2.5}>
                <Input
                  label="Nickname (Optional)"
                  {...register('nickname')}
                  placeholder="e.g., Daily Driver, Work Truck"
                  fullWidth
                />

                <Divider />

                <Stack direction="row" gap={2}>
                  <Input
                    label="Year"
                    type="number"
                    {...register('year', {
                      required: 'Year is required',
                      min: { value: 1900, message: 'Invalid year' },
                      max: { value: new Date().getFullYear() + 1, message: 'Invalid year' },
                      valueAsNumber: true,
                    })}
                    error={!!errors.year}
                    helperText={errors.year?.message}
                    placeholder="2020"
                    sx={{ width: '30%' }}
                  />
                  <Input
                    label="Make"
                    {...register('make', { required: 'Make is required' })}
                    error={!!errors.make}
                    helperText={errors.make?.message}
                    placeholder="Honda"
                    fullWidth
                  />
                </Stack>

                <Input
                  label="Model"
                  {...register('model', { required: 'Model is required' })}
                  error={!!errors.model}
                  helperText={errors.model?.message}
                  placeholder="Civic"
                  fullWidth
                />

                <Input
                  label="Submodel (Optional)"
                  {...register('submodel')}
                  placeholder="EX, LX, Sport, etc."
                  fullWidth
                />

                <Input
                  label="Engine (Optional)"
                  {...register('engine')}
                  placeholder="1.5L Turbo, 2.0L V6, etc."
                  fullWidth
                />

                <Divider />

                <Checkbox
                  label="Set as default vehicle"
                  {...register('isDefault')}
                  checked={watch('isDefault')}
                />
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
                {saving ? 'Saving...' : editingVehicle ? 'Update' : 'Add Vehicle'}
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
          <DialogTitle>Delete Vehicle?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this vehicle? This action cannot be undone.
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
