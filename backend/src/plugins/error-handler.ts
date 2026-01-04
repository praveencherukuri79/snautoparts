import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

interface ApiError {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
}

export const errorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  request.log.error(error);

  let response: ApiError;

  // Zod validation errors
  if (error instanceof ZodError) {
    response = {
      statusCode: 400,
      error: 'Validation Error',
      message: 'Invalid request data',
      details: error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };
    return reply.status(400).send(response);
  }

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as unknown as { code: string; meta?: { target?: string[] } };
    
    if (prismaError.code === 'P2002') {
      response = {
        statusCode: 409,
        error: 'Conflict',
        message: `Unique constraint violation on ${prismaError.meta?.target?.join(', ') || 'field'}`,
      };
      return reply.status(409).send(response);
    }

    if (prismaError.code === 'P2025') {
      response = {
        statusCode: 404,
        error: 'Not Found',
        message: 'Record not found',
      };
      return reply.status(404).send(response);
    }
  }

  // Custom HTTP errors
  if (error.statusCode) {
    response = {
      statusCode: error.statusCode,
      error: error.name || 'Error',
      message: error.message,
    };
    return reply.status(error.statusCode).send(response);
  }

  // Default server error
  response = {
    statusCode: 500,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message,
  };
  return reply.status(500).send(response);
};

