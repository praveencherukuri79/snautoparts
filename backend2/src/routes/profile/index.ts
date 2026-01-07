import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../plugins/passport-auth.js';
import { User, Address, SavedVehicle } from '../../entities/index.js';
import {
  updateProfileSchema,
  addressSchema,
  updateAddressSchema,
  savedVehicleSchema,
} from '../../schemas/profile.schema.js';
import { idParamSchema } from '../../schemas/common.schema.js';
import { NotFoundError } from '../../plugins/error-handler.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';

// ============================================================================
// Schemas
// ============================================================================

const ProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  role: z.string(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const AddressSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  company: z.string().nullable(),
  address1: z.string(),
  address2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  phone: z.string().nullable(),
  isDefault: z.boolean(),
  isBilling: z.boolean(),
  createdAt: z.string().optional(),
});

const SavedVehicleSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string().nullable(),
  year: z.number(),
  make: z.string(),
  model: z.string(),
  submodel: z.string().nullable(),
  engine: z.string().nullable(),
  isDefault: z.boolean(),
  createdAt: z.string().optional(),
});

// ============================================================================
// Routes
// ============================================================================

export const profileRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', requireAuth);

  // GET /profile
  fastify.get('/', {
    schema: buildRouteSchema({
      summary: 'Get user profile',
      description: 'Returns the current user\'s profile information',
      tags: ['Profile'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: ProfileSchema }),
      },
    }),
  }, async (request) => {
    const user = await request.em.findOne(User, { id: request.user!.id }, { populate: ['role'] });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role?.name ?? 'CUSTOMER',
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  });

  // PATCH /profile
  fastify.patch('/', {
    schema: buildRouteSchema({
      summary: 'Update profile',
      description: 'Update the current user\'s profile information',
      tags: ['Profile'],
      security: Security.authenticated,
      body: updateProfileSchema,
      response: {
        200: z.object({ data: ProfileSchema.partial() }),
      },
    }),
  }, async (request) => {
    const input = updateProfileSchema.parse(request.body);
    const user = await request.em.findOneOrFail(User, { id: request.user!.id });

    if (input.firstName !== undefined) user.firstName = input.firstName;
    if (input.lastName !== undefined) user.lastName = input.lastName;
    if (input.phone !== undefined) user.phone = input.phone;

    await request.em.flush();

    return {
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  });

  // ============ ADDRESSES ============

  // GET /profile/addresses
  fastify.get('/addresses', {
    schema: buildRouteSchema({
      summary: 'List addresses',
      description: 'Returns all saved addresses for the current user',
      tags: ['Profile'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: z.array(AddressSchema) }),
      },
    }),
  }, async (request) => {
    const addresses = await request.em.find(
      Address,
      { user: request.user!.id },
      { orderBy: { isDefault: 'DESC', createdAt: 'DESC' } }
    );

    return {
      data: addresses.map((a) => ({
        id: a.id,
        firstName: a.firstName,
        lastName: a.lastName,
        company: a.company,
        address1: a.address1,
        address2: a.address2,
        city: a.city,
        state: a.state,
        zipCode: a.zipCode,
        country: a.country,
        phone: a.phone,
        isDefault: a.isDefault,
        isBilling: a.isBilling,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  });

  // POST /profile/addresses
  fastify.post('/addresses', {
    schema: buildRouteSchema({
      summary: 'Create address',
      description: 'Create a new saved address',
      tags: ['Profile'],
      security: Security.authenticated,
      body: addressSchema,
      response: {
        200: z.object({ data: AddressSchema }),
      },
    }),
  }, async (request) => {
    const input = addressSchema.parse(request.body);
    const user = await request.em.findOneOrFail(User, { id: request.user!.id });

    if (input.isDefault) {
      await request.em.nativeUpdate(Address, { user: request.user!.id, isDefault: true }, { isDefault: false });
    }

    const address = request.em.create(Address, {
      user,
      ...input,
    });

    await request.em.persistAndFlush(address);

    return {
      data: {
        id: address.id,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault,
        isBilling: address.isBilling,
      },
    };
  });

  // PATCH /profile/addresses/:id
  fastify.patch<{ Params: { id: string } }>('/addresses/:id', {
    schema: buildRouteSchema({
      summary: 'Update address',
      description: 'Update an existing saved address',
      tags: ['Profile'],
      security: Security.authenticated,
      params: idParamSchema,
      body: updateAddressSchema,
      response: {
        200: z.object({ data: AddressSchema }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request) => {
    const { id } = idParamSchema.parse(request.params);
    const input = updateAddressSchema.parse(request.body);

    const address = await request.em.findOne(Address, { id, user: request.user!.id });
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    if (input.isDefault) {
      await request.em.nativeUpdate(
        Address,
        { user: request.user!.id, isDefault: true, id: { $ne: id } },
        { isDefault: false }
      );
    }

    Object.assign(address, input);
    await request.em.flush();

    return {
      data: {
        id: address.id,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
        isDefault: address.isDefault,
        isBilling: address.isBilling,
      },
    };
  });

  // DELETE /profile/addresses/:id
  fastify.delete<{ Params: { id: string } }>('/addresses/:id', {
    schema: buildRouteSchema({
      summary: 'Delete address',
      description: 'Delete a saved address',
      tags: ['Profile'],
      security: Security.authenticated,
      params: idParamSchema,
      response: {
        200: z.object({ data: z.object({ message: z.string() }) }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request) => {
    const { id } = idParamSchema.parse(request.params);

    const address = await request.em.findOne(Address, { id, user: request.user!.id });
    if (!address) {
      throw new NotFoundError('Address not found');
    }

    await request.em.removeAndFlush(address);

    return { data: { message: 'Address deleted' } };
  });

  // ============ SAVED VEHICLES ============

  // GET /profile/vehicles
  fastify.get('/vehicles', {
    schema: buildRouteSchema({
      summary: 'List saved vehicles',
      description: 'Returns all saved vehicles for the current user',
      tags: ['Profile'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: z.array(SavedVehicleSchema) }),
      },
    }),
  }, async (request) => {
    const vehicles = await request.em.find(
      SavedVehicle,
      { user: request.user!.id },
      { orderBy: { isDefault: 'DESC', createdAt: 'DESC' } }
    );

    return {
      data: vehicles.map((v) => ({
        id: v.id,
        nickname: v.nickname,
        year: v.year,
        make: v.make,
        model: v.model,
        submodel: v.submodel,
        engine: v.engine,
        isDefault: v.isDefault,
        createdAt: v.createdAt.toISOString(),
      })),
    };
  });

  // POST /profile/vehicles
  fastify.post('/vehicles', {
    schema: buildRouteSchema({
      summary: 'Save a vehicle',
      description: 'Save a vehicle for quick fitment selection',
      tags: ['Profile'],
      security: Security.authenticated,
      body: savedVehicleSchema,
      response: {
        200: z.object({ data: SavedVehicleSchema }),
      },
    }),
  }, async (request) => {
    const input = savedVehicleSchema.parse(request.body);
    const user = await request.em.findOneOrFail(User, { id: request.user!.id });

    if (input.isDefault) {
      await request.em.nativeUpdate(SavedVehicle, { user: request.user!.id, isDefault: true }, { isDefault: false });
    }

    const vehicle = request.em.create(SavedVehicle, {
      user,
      ...input,
    });

    await request.em.persistAndFlush(vehicle);

    return {
      data: {
        id: vehicle.id,
        nickname: vehicle.nickname,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        submodel: vehicle.submodel,
        engine: vehicle.engine,
        isDefault: vehicle.isDefault,
      },
    };
  });

  // DELETE /profile/vehicles/:id
  fastify.delete<{ Params: { id: string } }>('/vehicles/:id', {
    schema: buildRouteSchema({
      summary: 'Remove saved vehicle',
      description: 'Remove a saved vehicle',
      tags: ['Profile'],
      security: Security.authenticated,
      params: idParamSchema,
      response: {
        200: z.object({ data: z.object({ message: z.string() }) }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request) => {
    const { id } = idParamSchema.parse(request.params);

    const vehicle = await request.em.findOne(SavedVehicle, { id, user: request.user!.id });
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    await request.em.removeAndFlush(vehicle);

    return { data: { message: 'Vehicle removed' } };
  });

  // PATCH /profile/vehicles/:id/default
  fastify.patch<{ Params: { id: string } }>('/vehicles/:id/default', {
    schema: buildRouteSchema({
      summary: 'Set default vehicle',
      description: 'Set a vehicle as the default for fitment selection',
      tags: ['Profile'],
      security: Security.authenticated,
      params: idParamSchema,
      response: {
        200: z.object({ data: SavedVehicleSchema }),
        404: z.object({ error: z.string() }),
      },
    }),
  }, async (request) => {
    const { id } = idParamSchema.parse(request.params);

    const vehicle = await request.em.findOne(SavedVehicle, { id, user: request.user!.id });
    if (!vehicle) {
      throw new NotFoundError('Vehicle not found');
    }

    await request.em.nativeUpdate(
      SavedVehicle,
      { user: request.user!.id, isDefault: true, id: { $ne: id } },
      { isDefault: false }
    );

    vehicle.isDefault = true;
    await request.em.flush();

    return {
      data: {
        id: vehicle.id,
        nickname: vehicle.nickname,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        submodel: vehicle.submodel,
        engine: vehicle.engine,
        isDefault: vehicle.isDefault,
      },
    };
  });
};
