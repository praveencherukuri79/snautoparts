import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  country: z.string().default('US'),
  phone: z.string().optional(),
  isDefault: z.boolean().default(false),
  isBilling: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;

export const updateAddressSchema = addressSchema.partial();

export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export const savedVehicleSchema = z.object({
  nickname: z.string().optional(),
  year: z.coerce.number().int().min(1900).max(2100),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  submodel: z.string().optional(),
  engine: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type SavedVehicleInput = z.infer<typeof savedVehicleSchema>;

