import { EntityManager } from '@mikro-orm/core';
import { User, Role, Address } from '../entities/index.js';
import { NotFoundError, BadRequestError } from '../plugins/error-handler.js';
import { generateToken } from '../utils/crypto.js';

/**
 * User Service
 * 
 * Handles user management for admins.
 */
export class UserService {
  constructor(private em: EntityManager) {}

  /**
   * Get all users with pagination
   */
  async getUsers(options: {
    search?: string;
    roleId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: User[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (options.search) {
      where.$or = [
        { email: { $like: `%${options.search}%` } },
        { firstName: { $like: `%${options.search}%` } },
        { lastName: { $like: `%${options.search}%` } },
      ];
    }

    if (options.roleId) {
      where.role = options.roleId;
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    const [users, total] = await this.em.findAndCount(User, where, {
      populate: ['role'],
      orderBy: { createdAt: 'DESC' },
      limit,
      offset,
    });

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    return this.em.findOne(User, { id }, {
      populate: ['role', 'addresses'],
    });
  }

  /**
   * Create a new user (admin function)
   */
  async createUser(input: {
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    phone?: string;
    isActive?: boolean;
  }): Promise<User> {
    // Check for duplicate email
    const existing = await this.em.findOne(User, { email: input.email.toLowerCase() });
    if (existing) {
      throw new BadRequestError('Email already exists');
    }

    // Get role
    const role = await this.em.findOne(Role, { id: input.roleId });
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Admin-created users get a random password hash (they should use password reset)
    const placeholderPasswordHash = `admin-created:${generateToken(16)}`;

    const user = new User();
    user.email = input.email.toLowerCase();
    user.passwordHash = placeholderPasswordHash;
    user.firstName = input.firstName;
    user.lastName = input.lastName;
    user.role = role;
    user.phone = input.phone;
    user.isActive = input.isActive ?? true;
    user.emailVerified = false; // Admin-created users need to verify

    await this.em.persistAndFlush(user);
    return user;
  }

  /**
   * Update a user
   */
  async updateUser(
    id: string,
    input: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      roleId?: string;
      isActive?: boolean;
    },
  ): Promise<User> {
    const user = await this.em.findOne(User, { id });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (input.firstName !== undefined) user.firstName = input.firstName;
    if (input.lastName !== undefined) user.lastName = input.lastName;
    if (input.phone !== undefined) user.phone = input.phone;
    if (input.isActive !== undefined) user.isActive = input.isActive;

    if (input.roleId) {
      const role = await this.em.findOne(Role, { id: input.roleId });
      if (!role) {
        throw new NotFoundError('Role not found');
      }
      user.role = role;
    }

    await this.em.flush();
    return user;
  }

  /**
   * Delete a user (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    const user = await this.em.findOne(User, { id });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.isActive = false;
    await this.em.flush();
  }

  /**
   * Get all roles
   */
  async getRoles(): Promise<Role[]> {
    return this.em.find(Role, { isActive: true }, {
      orderBy: { name: 'ASC' },
    });
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleId: string): Promise<User> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const role = await this.em.findOne(Role, { id: roleId });
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    user.role = role;
    await this.em.flush();
    return user;
  }
}

export function createUserService(em: EntityManager): UserService {
  return new UserService(em);
}

