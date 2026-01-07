import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import fastifySecureSession from '@fastify/secure-session';
import fastifyPassport from '@fastify/passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../entities/User.js';
import { Role } from '../entities/Role.js';
import { config } from '../config/index.js';
import { UnauthorizedError, ForbiddenError } from './error-handler.js';
import { RoleFeatureConfig } from '../entities/index.js';
import { getDefaultFeatureConfig, checkFeaturePermission, isFeatureConfig, type FeatureConfig } from '../utils/feature-config.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';

// Re-export for use in routes
export { hashPassword, verifyPassword };

// Auth user type exposed on request
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  roleId: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    dataScope?: 'own' | 'all';
  }
  interface PassportUser extends AuthUser {}
}

/**
 * Passport.js Authentication Plugin for Fastify
 */
const passportAuthPluginInner: FastifyPluginAsync = async (fastify) => {
  // Generate a secure key for sessions (32 bytes)
  // In production, use a persistent key from environment
  const sessionKey = Buffer.from(
    config.auth.secret.padEnd(32, '0').slice(0, 32)
  );

  // Register secure session
  await fastify.register(fastifySecureSession, {
    key: sessionKey,
    cookie: {
      path: '/',
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  });

  // Initialize Passport
  await fastify.register(fastifyPassport.initialize());
  await fastify.register(fastifyPassport.secureSession());

  // Configure Local Strategy
  fastifyPassport.use(
    'local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req: any, email: string, password: string, done) => {
        try {
          const fastifyReq = req as FastifyRequest;
          const em = fastifyReq.em;

          // Find user by email
          const user = await em.findOne(User, { email: email.toLowerCase() }, {
            populate: ['role'],
          });

          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          if (!user.isActive) {
            return done(null, false, { message: 'Account is disabled' });
          }

          // Verify password
          const isValid = await verifyPassword(password, user.passwordHash);
          if (!isValid) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Update last login
          user.lastLoginAt = new Date();
          await em.flush();

          // Return user data for session
          const roleName = user.role?.name || 'CUSTOMER';
          return done(null, {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: roleName,
            roleId: user.role?.id || '',
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user to session (store minimal data)
  fastifyPassport.registerUserSerializer(async (user: any) => {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      roleId: user.roleId,
    };
  });

  // Deserialize user from session
  fastifyPassport.registerUserDeserializer(async (serialized: any) => {
    return serialized;
  });

  fastify.log.info('Passport Auth plugin registered');
};

export const passportAuthPlugin = fp(passportAuthPluginInner, {
  name: 'passport-auth',
  dependencies: ['mikro-orm'],
});

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: FastifyRequest): Promise<void> {
  if (!request.user) {
    throw new UnauthorizedError('Authentication required');
  }
}

/**
 * Middleware to optionally authenticate (sets user if session present)
 */
export async function optionalAuth(request: FastifyRequest): Promise<void> {
  // User is automatically set by Passport if session exists
  // Nothing to do here - just a pass-through
}

/**
 * Get feature config for a role from database
 */
async function getFeatureConfig(
  em: any,
  roleId: string,
): Promise<FeatureConfig | null> {
  if (!roleId) return null;

  const dbConfig = await em.findOne(RoleFeatureConfig, { role: roleId });
  if (dbConfig?.config && isFeatureConfig(dbConfig.config)) {
    return dbConfig.config;
  }
  return null;
}

/**
 * Determine data scope based on role and features
 */
function determineDataScope(
  role: string,
  features: string[],
): 'own' | 'all' {
  if (role === 'MANAGER' || role === 'ADMIN') {
    return 'all';
  }

  const hasViewAll = features.some((f) => f.includes('viewAll') || f.includes('manage'));
  return hasViewAll ? 'all' : 'own';
}

/**
 * Middleware to check feature permission
 */
export function requireFeature(feature: string) {
  return async (request: FastifyRequest): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Get feature config from database or use default
    const featureConfig: FeatureConfig = 
      await getFeatureConfig(request.em, request.user.roleId) 
      ?? getDefaultFeatureConfig(request.user.role);

    // Handle OR conditions (feature1|feature2)
    const features = feature.split('|');
    const hasPermission = features.some((f) => checkFeaturePermission(featureConfig, f));

    if (!hasPermission) {
      throw new ForbiddenError('Insufficient permissions');
    }

    // Set data scope based on permissions
    request.dataScope = determineDataScope(request.user.role, features);
  };
}

