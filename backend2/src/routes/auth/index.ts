import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import fastifyPassport from '@fastify/passport';
import { requireAuth, hashPassword, verifyPassword, type AuthUser } from '../../plugins/passport-auth.js';
import { RoleFeatureConfig, Role, User } from '../../entities/index.js';
import { buildRouteSchema, Security } from '../../utils/openapi.js';
import { BadRequestError, UnauthorizedError } from '../../plugins/error-handler.js';
import { getDefaultFeatureConfig, isFeatureConfig, type FeatureConfig } from '../../utils/feature-config.js';

// ============================================================================
// Schemas
// ============================================================================

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  role: z.string(),
});

const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string(),
  description: z.string().nullable(),
});

const FeatureConfigSchema = z.record(z.unknown());

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

const ProfileUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().nullable().optional(),
});

// ============================================================================
// Routes
// ============================================================================

/**
 * Auth Routes - Passport.js based authentication
 */
export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // -------------------------------------------------------------------------
  // POST /auth/login - Login with email and password
  // -------------------------------------------------------------------------
  fastify.post<{ Body: z.infer<typeof LoginSchema> }>(
    '/login',
    {
      schema: buildRouteSchema({
        summary: 'Login',
        description: 'Authenticate with email and password',
        tags: ['Auth'],
        body: LoginSchema,
        response: {
          200: z.object({ success: z.boolean(), user: UserSchema }),
          401: z.object({ error: z.string() }),
        },
      }),
      preValidation: fastifyPassport.authenticate('local', {
        failureMessage: true,
      }),
    },
    async (request) => {
      const user = request.user as AuthUser;
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || null,
          role: user.role,
        },
      };
    }
  );

  // -------------------------------------------------------------------------
  // POST /auth/register - Register new user
  // -------------------------------------------------------------------------
  fastify.post<{ Body: z.infer<typeof RegisterSchema> }>(
    '/register',
    {
      schema: buildRouteSchema({
        summary: 'Register',
        description: 'Create a new user account',
        tags: ['Auth'],
        body: RegisterSchema,
        response: {
          200: z.object({ success: z.boolean(), user: UserSchema }),
          400: z.object({ error: z.string() }),
        },
      }),
    },
    async (request) => {
      const { email, password, firstName, lastName, phone } = request.body;
      const em = request.em;

      // Check if email already exists
      const existingUser = await em.findOne(User, { email: email.toLowerCase() });
      if (existingUser) {
        throw new BadRequestError('Email already registered');
      }

      // Get default CUSTOMER role
      let customerRole = await em.findOne(Role, { name: 'CUSTOMER' });
      if (!customerRole) {
        customerRole = em.create(Role, {
          name: 'CUSTOMER',
          displayName: 'Customer',
          description: 'Default customer role',
          isActive: true,
        });
        em.persist(customerRole);
      }

      // Create user
      const passwordHash = await hashPassword(password);
      const user = new User();
      user.email = email.toLowerCase();
      user.passwordHash = passwordHash;
      user.firstName = firstName;
      user.lastName = lastName;
      user.phone = phone || undefined;
      user.role = customerRole;
      user.isActive = true;
      user.emailVerified = false;

      await em.persistAndFlush(user);

      // Log user in automatically
      await request.logIn({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: customerRole.name,
        roleId: customerRole.id,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || null,
          role: customerRole.name,
        },
      };
    }
  );

  // -------------------------------------------------------------------------
  // POST /auth/logout - Logout current user
  // -------------------------------------------------------------------------
  fastify.post(
    '/logout',
    {
      schema: buildRouteSchema({
        summary: 'Logout',
        description: 'End the current session',
        tags: ['Auth'],
        response: {
          200: z.object({ success: z.boolean() }),
        },
      }),
    },
    async (request) => {
      await request.logOut();
      return { success: true };
    }
  );

  // -------------------------------------------------------------------------
  // GET /auth/session - Check session status
  // -------------------------------------------------------------------------
  fastify.get(
    '/session',
    {
      schema: buildRouteSchema({
        summary: 'Get session',
        description: 'Check if user is authenticated and get session info',
        tags: ['Auth'],
        response: {
          200: z.object({
            authenticated: z.boolean(),
            user: UserSchema.nullable(),
          }),
        },
      }),
    },
    async (request) => {
      if (!request.user) {
        return { authenticated: false, user: null };
      }

      const user = request.user as AuthUser;
      return {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || null,
          role: user.role,
        },
      };
    }
  );

  // -------------------------------------------------------------------------
  // POST /auth/change-password - Change password
  // -------------------------------------------------------------------------
  fastify.post<{ Body: z.infer<typeof ChangePasswordSchema> }>(
    '/change-password',
    {
      preHandler: [requireAuth],
      schema: buildRouteSchema({
        summary: 'Change password',
        description: 'Change the current user password',
        tags: ['Auth'],
        security: Security.authenticated,
        body: ChangePasswordSchema,
        response: {
          200: z.object({ success: z.boolean() }),
          401: z.object({ error: z.string() }),
        },
      }),
    },
    async (request) => {
      const authUser = request.user as AuthUser;
      const { currentPassword, newPassword } = request.body;

      const em = request.em;
      const user = await em.findOneOrFail(User, { id: authUser.id });

      // Verify current password
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Update password
      user.passwordHash = await hashPassword(newPassword);
      await em.flush();

      return { success: true };
    }
  );

  // -------------------------------------------------------------------------
  // PATCH /auth/profile - Update user profile
  // -------------------------------------------------------------------------
  fastify.patch<{ Body: z.infer<typeof ProfileUpdateSchema> }>(
    '/profile',
    {
      preHandler: [requireAuth],
      schema: buildRouteSchema({
        summary: 'Update profile',
        description: 'Update the current user profile',
        tags: ['Auth'],
        security: Security.authenticated,
        body: ProfileUpdateSchema,
        response: {
          200: UserSchema,
          401: z.object({ error: z.string() }),
        },
      }),
    },
    async (request) => {
      const authUser = request.user as AuthUser;
      const { firstName, lastName, phone } = request.body;

      const em = request.em;
      const user = await em.findOneOrFail(User, { id: authUser.id });

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone !== undefined) user.phone = phone || undefined;

      await em.flush();

      // Update session
      await request.logIn({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: authUser.role,
        roleId: authUser.roleId,
      });

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || null,
        role: authUser.role,
      };
    }
  );
  // GET /auth/me - Get current authenticated user
  fastify.get('/me', {
    preHandler: [requireAuth],
    schema: buildRouteSchema({
      summary: 'Get current user',
      description: 'Returns the currently authenticated user profile',
      tags: ['Auth'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: UserSchema }),
        401: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Not authenticated' });
    }

    return {
      data: {
        id: request.user.id,
        email: request.user.email,
        firstName: request.user.firstName,
        lastName: request.user.lastName,
        phone: request.user.phone,
        role: request.user.role,
      },
    };
  });

  // GET /auth/feature-config - Get feature configuration for user's role
  fastify.get('/feature-config', {
    preHandler: [requireAuth],
    schema: buildRouteSchema({
      summary: 'Get feature configuration',
      description: 'Returns the feature configuration for the authenticated user\'s role. Used by the frontend to determine which features to display.',
      tags: ['Auth'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: FeatureConfigSchema }),
        401: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Not authenticated' });
    }

    // Try to get from database first, fall back to default
    let featureConfig: FeatureConfig;

    if (request.user.roleId) {
      const dbConfig = await request.em.findOne(RoleFeatureConfig, { role: request.user.roleId });
      if (dbConfig?.config && isFeatureConfig(dbConfig.config)) {
        featureConfig = dbConfig.config;
      } else {
        featureConfig = getDefaultFeatureConfig(request.user.role);
      }
    } else {
      featureConfig = getDefaultFeatureConfig(request.user.role);
    }

    return { data: featureConfig };
  });

  // GET /auth/roles - Get available roles (for admin UI)
  fastify.get('/roles', {
    preHandler: [requireAuth],
    schema: buildRouteSchema({
      summary: 'List available roles',
      description: 'Returns all active roles (admin only)',
      tags: ['Auth'],
      security: Security.authenticated,
      response: {
        200: z.object({ data: z.array(RoleSchema) }),
        403: z.object({ error: z.string() }),
      },
    }),
  }, async (request, reply) => {
    // Only admins can view roles
    if (request.user?.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'Insufficient permissions' });
    }

    const roles = await request.em.find(Role, { isActive: true }, {
      orderBy: { name: 'ASC' },
    });

    return {
      data: roles.map((r) => ({
        id: r.id,
        name: r.name,
        displayName: r.displayName,
        description: r.description,
      })),
    };
  });
};
