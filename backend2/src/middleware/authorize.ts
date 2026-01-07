import type { FastifyRequest, FastifyReply } from 'fastify';
import { requireFeature } from '../plugins/passport-auth.js';

/**
 * Authorization middleware factory
 * Creates a preHandler that checks if the user has the required feature permission
 * 
 * @param requiredFeature - Feature path like "orders.viewAll" or "inventory.adjust"
 *                          Use | for OR conditions: "orders.viewOwn|orders.viewAll"
 */
export function authorize(requiredFeature: string) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // Must be authenticated first
    if (!request.user) {
      reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    try {
      // Use the existing requireFeature from passport-auth plugin
      await requireFeature(requiredFeature)(request);
    } catch (error: unknown) {
      const err = error as { statusCode?: number; message?: string };
      reply.status(err.statusCode || 403).send({
        statusCode: err.statusCode || 403,
        error: 'Forbidden',
        message: err.message || 'Insufficient permissions',
        requiredFeature,
      });
      return;
    }
  };
}

/**
 * Role-based authorization middleware factory
 * Creates a preHandler that checks if the user has one of the required roles
 * 
 * @param allowedRoles - Array of role names like ["ADMIN"] or ["MANAGER", "ADMIN"]
 */
export function authorizeRoles(...allowedRoles: string[]) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (!request.user) {
      reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const userRole = request.user.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'Access denied for your role',
        requiredRoles: allowedRoles,
      });
      return;
    }
  };
}

/**
 * Data scope helper
 * Determines what data the user should see based on their role
 */
export type DataScope = 'own' | 'all';

export function getDataScope(request: FastifyRequest): DataScope {
  if (!request.user) {
    return 'own';
  }

  // Use the dataScope set by requireFeature middleware
  if (request.dataScope) {
    return request.dataScope;
  }

  // Default based on role
  const role = request.user.role;
  if (role === 'MANAGER' || role === 'ADMIN') {
    return 'all';
  }

  return 'own';
}
