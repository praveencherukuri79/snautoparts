import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Authentication middleware
 * Verifies the user is logged in via Better Auth session
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Better Auth plugin sets request.user if authenticated
  if (!request.user) {
    reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }
}

/**
 * Optional authentication middleware
 * Doesn't fail if user is not authenticated, but populates request.user if they are
 */
export async function optionalAuthenticate(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  // Just let it pass - request.user will be set if authenticated, undefined otherwise
  // The route handler can check request.user as needed
}
