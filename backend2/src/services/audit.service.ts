import { EntityManager } from '@mikro-orm/core';
import { AuditLog, User } from '../entities/index.js';

/**
 * Audit action types
 */
export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_RESET'
  | 'ROLE_CHANGE'
  | 'STATUS_CHANGE'
  | 'EXPORT'
  | 'IMPORT';

/**
 * Audit Service
 * 
 * Handles audit logging and querying for admin oversight.
 */
export class AuditService {
  constructor(private em: EntityManager) {}

  /**
   * Create an audit log entry
   */
  async log(
    userId: string | null,
    action: AuditAction,
    entityType: string,
    entityId: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
  ): Promise<AuditLog> {
    let user: User | undefined;
    if (userId) {
      user = await this.em.findOne(User, { id: userId }) ?? undefined;
    }

    const log = this.em.create(AuditLog, {
      user,
      action,
      entityType,
      entityId,
      details: details ?? {},
      ipAddress,
    });

    await this.em.persistAndFlush(log);
    return log;
  }

  /**
   * Get audit logs with filters
   */
  async getLogs(options: {
    userId?: string;
    action?: AuditAction;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ data: AuditLog[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const { page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (options.userId) {
      where.user = options.userId;
    }

    if (options.action) {
      where.action = options.action;
    }

    if (options.entityType) {
      where.entityType = options.entityType;
    }

    if (options.entityId) {
      where.entityId = options.entityId;
    }

    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        (where.createdAt as Record<string, unknown>).$gte = options.startDate;
      }
      if (options.endDate) {
        (where.createdAt as Record<string, unknown>).$lte = options.endDate;
      }
    }

    const [logs, total] = await this.em.findAndCount(AuditLog, where, {
      populate: ['user'],
      orderBy: { createdAt: 'DESC' },
      limit,
      offset,
    });

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get audit statistics
   */
  async getStatistics(startDate?: Date, endDate?: Date): Promise<{
    totalActions: number;
    byAction: Record<string, number>;
    byEntity: Record<string, number>;
    byUser: Array<{ userId: string; userName: string; count: number }>;
  }> {
    const where: Record<string, unknown> = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, unknown>).$gte = startDate;
      }
      if (endDate) {
        (where.createdAt as Record<string, unknown>).$lte = endDate;
      }
    }

    const logs = await this.em.find(AuditLog, where, {
      populate: ['user'],
    });

    const byAction: Record<string, number> = {};
    const byEntity: Record<string, number> = {};
    const byUserMap: Record<string, { userId: string; userName: string; count: number }> = {};

    for (const log of logs) {
      // Count by action
      byAction[log.action] = (byAction[log.action] || 0) + 1;

      // Count by entity type
      byEntity[log.entityType] = (byEntity[log.entityType] || 0) + 1;

      // Count by user
      if (log.user) {
        const user = log.user as User;
        if (!byUserMap[user.id]) {
          byUserMap[user.id] = {
            userId: user.id,
            userName: user.fullName,
            count: 0,
          };
        }
        byUserMap[user.id].count++;
      }
    }

    const byUser = Object.values(byUserMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalActions: logs.length,
      byAction,
      byEntity,
      byUser,
    };
  }

  /**
   * Export audit logs to JSON
   */
  async exportLogs(options: {
    startDate?: Date;
    endDate?: Date;
    format?: 'json' | 'csv';
  }): Promise<string> {
    const where: Record<string, unknown> = {};

    if (options.startDate || options.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        (where.createdAt as Record<string, unknown>).$gte = options.startDate;
      }
      if (options.endDate) {
        (where.createdAt as Record<string, unknown>).$lte = options.endDate;
      }
    }

    const logs = await this.em.find(AuditLog, where, {
      populate: ['user'],
      orderBy: { createdAt: 'DESC' },
    });

    const exportData = logs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      userId: log.user?.id ?? null,
      userEmail: (log.user as User)?.email ?? null,
      details: log.details,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
    }));

    if (options.format === 'csv') {
      // Simple CSV conversion
      const headers = ['id', 'action', 'entityType', 'entityId', 'userId', 'userEmail', 'ipAddress', 'createdAt'];
      const rows = exportData.map((row) =>
        headers.map((h) => JSON.stringify((row as Record<string, unknown>)[h] ?? '')).join(','),
      );
      return [headers.join(','), ...rows].join('\n');
    }

    return JSON.stringify(exportData, null, 2);
  }
}

export function createAuditService(em: EntityManager): AuditService {
  return new AuditService(em);
}

