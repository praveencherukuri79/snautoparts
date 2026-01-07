import { EntityManager } from '@mikro-orm/core';
import { User, Role, Session } from '../entities/index.js';
import { hashPassword, verifyPassword } from '../utils/crypto.js';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../plugins/error-handler.js';
import { v4 as uuid } from 'uuid';

/**
 * Auth Service
 * 
 * Handles authentication and session management.
 * Works alongside Better Auth for session handling.
 */
export class AuthService {
  constructor(private em: EntityManager) {}

  /**
   * Register a new user
   */
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): Promise<User> {
    // Check if email already exists
    const existing = await this.em.findOne(User, { email: data.email.toLowerCase() });
    if (existing) {
      throw new BadRequestError('Email already registered');
    }

    // Get default customer role
    const customerRole = await this.em.findOne(Role, { name: 'CUSTOMER' });
    if (!customerRole) {
      throw new Error('Default CUSTOMER role not found. Run seeders first.');
    }

    // Create user
    const user = new User();
    user.email = data.email.toLowerCase();
    user.passwordHash = await hashPassword(data.password);
    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.phone = data.phone;
    user.role = customerRole;
    user.isActive = true;
    user.emailVerified = false;

    await this.em.persistAndFlush(user);

    return user;
  }

  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string): Promise<{ user: User; sessionToken: string }> {
    const user = await this.em.findOne(User, { email: email.toLowerCase() }, {
      populate: ['role'],
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is disabled');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    
    // Create session
    const sessionToken = uuid();
    const session = new Session();
    session.token = sessionToken;
    session.user = user;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.em.persistAndFlush([user, session]);

    return { user, sessionToken };
  }

  /**
   * Logout - invalidate session
   */
  async logout(sessionToken: string): Promise<void> {
    const session = await this.em.findOne(Session, { token: sessionToken });
    if (session) {
      await this.em.removeAndFlush(session);
    }
  }

  /**
   * Get user by session token
   */
  async getUserBySession(sessionToken: string): Promise<User | null> {
    const session = await this.em.findOne(Session, { 
      token: sessionToken,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return null;
    }

    const user = await this.em.findOne(User, { id: session.user.id }, {
      populate: ['role'],
    });

    return user;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string): Promise<User> {
    const user = await this.em.findOne(User, { id: userId }, {
      populate: ['role', 'addresses'],
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Update current user profile
   */
  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }): Promise<User> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (data.firstName !== undefined) user.firstName = data.firstName;
    if (data.lastName !== undefined) user.lastName = data.lastName;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.avatarUrl !== undefined) user.avatarUrl = data.avatarUrl;

    await this.em.flush();

    return user;
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    user.passwordHash = await hashPassword(newPassword);
    await this.em.flush();
  }

  /**
   * Request password reset
   * Returns a reset token (in production, send via email)
   */
  async requestPasswordReset(email: string): Promise<string> {
    const user = await this.em.findOne(User, { email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists - return success anyway
      return uuid();
    }

    // Generate reset token
    const resetToken = uuid();
    
    // In production, store this token with expiry and send via email
    // For now, just return it
    
    return resetToken;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // In production, validate the token against stored tokens
    // For now, this is a placeholder
    
    throw new BadRequestError('Password reset not implemented - use email link');
  }

  /**
   * Verify email address
   */
  async verifyEmail(userId: string): Promise<void> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.emailVerified = true;
    await this.em.flush();
  }

  /**
   * Get all roles (for admin role assignment)
   */
  async getRoles(): Promise<Role[]> {
    return this.em.find(Role, { isActive: true }, {
      orderBy: { name: 'ASC' },
    });
  }
}

