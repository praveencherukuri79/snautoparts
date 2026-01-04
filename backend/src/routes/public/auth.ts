import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../../schemas/index.js';

// Password hashing utilities
const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

const generateSessionToken = (): string => randomBytes(32).toString('hex');

export const authRoutes = async (fastify: FastifyInstance) => {
  // Register
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    const data = registerSchema.parse(request.body);

    // Check if user exists
    const existingUser = await fastify.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      return reply.status(409).send({
        statusCode: 409,
        error: 'Conflict',
        message: 'An account with this email already exists',
      });
    }

    // Create user and account
    const user = await fastify.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: 'CUSTOMER',
        accounts: {
          create: {
            accountId: uuidv4(),
            providerId: 'credentials',
            password: hashPassword(data.password),
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Create session
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await fastify.prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    reply.setCookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return { data: { user, token } };
  });

  // Login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const data = loginSchema.parse(request.body);

    const user = await fastify.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: {
        accounts: {
          where: { providerId: 'credentials' },
          select: { password: true },
        },
      },
    });

    if (!user || !user.accounts[0]?.password) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    if (!verifyPassword(data.password, user.accounts[0].password)) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Create session
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await fastify.prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    reply.setCookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      },
    };
  });

  // Logout
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies['auth-token'];

    if (token) {
      await fastify.prisma.session.deleteMany({ where: { token } });
    }

    reply.clearCookie('auth-token', { path: '/' });
    return { success: true };
  });

  // Get current user
  fastify.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies['auth-token'] || request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Not authenticated',
      });
    }

    const session = await fastify.prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            image: true,
            createdAt: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Session expired',
      });
    }

    return { data: session.user };
  });

  // Forgot password
  fastify.post('/forgot-password', async (request: FastifyRequest) => {
    const data = forgotPasswordSchema.parse(request.body);

    const user = await fastify.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true, message: 'If an account exists, a reset email has been sent' };
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await fastify.prisma.verification.create({
      data: {
        identifier: data.email.toLowerCase(),
        value: resetToken,
        expiresAt,
      },
    });

    // TODO: Send email with reset link using Resend
    fastify.log.info(`Password reset token for ${data.email}: ${resetToken}`);

    return { success: true, message: 'If an account exists, a reset email has been sent' };
  });

  // Reset password
  fastify.post('/reset-password', async (request: FastifyRequest, reply: FastifyReply) => {
    const data = resetPasswordSchema.parse(request.body);

    const verification = await fastify.prisma.verification.findFirst({
      where: {
        value: data.token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verification) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid or expired reset token',
      });
    }

    const user = await fastify.prisma.user.findUnique({
      where: { email: verification.identifier },
    });

    if (!user) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'User not found',
      });
    }

    // Update password
    await fastify.prisma.account.updateMany({
      where: { userId: user.id, providerId: 'credentials' },
      data: { password: hashPassword(data.password) },
    });

    // Delete verification and all sessions
    await fastify.prisma.verification.delete({ where: { id: verification.id } });
    await fastify.prisma.session.deleteMany({ where: { userId: user.id } });

    return { success: true, message: 'Password has been reset successfully' };
  });
};

