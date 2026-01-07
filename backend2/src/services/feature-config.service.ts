import { EntityManager } from '@mikro-orm/core';
import { RoleFeatureConfig, Role } from '../entities/index.js';
import { cacheService } from './cache.service.js';
import { config } from '../config/index.js';

const CACHE_PREFIX = 'feature-config:';

/**
 * Feature Config Service
 * 
 * Manages role-based feature configurations with caching.
 */
export class FeatureConfigService {
  constructor(private em: EntityManager) {}

  /**
   * Get feature config for a role
   */
  async getConfigByRoleId(roleId: string): Promise<Record<string, unknown> | null> {
    const cacheKey = `${CACHE_PREFIX}${roleId}`;

    // Check cache first
    const cached = cacheService.get<Record<string, unknown>>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const roleConfig = await this.em.findOne(RoleFeatureConfig, { role: roleId });
    if (!roleConfig) {
      return null;
    }

    // Cache and return
    cacheService.set(cacheKey, roleConfig.config, config.featureConfigCacheTtl);
    return roleConfig.config;
  }

  /**
   * Get feature config by role name
   */
  async getConfigByRoleName(roleName: string): Promise<Record<string, unknown> | null> {
    const role = await this.em.findOne(Role, { name: roleName });
    if (!role) {
      return null;
    }
    return this.getConfigByRoleId(role.id);
  }

  /**
   * Update feature config for a role
   */
  async updateConfig(roleId: string, newConfig: Record<string, unknown>): Promise<RoleFeatureConfig> {
    let roleConfig = await this.em.findOne(RoleFeatureConfig, { role: roleId });

    if (!roleConfig) {
      const role = await this.em.findOneOrFail(Role, { id: roleId });
      roleConfig = this.em.create(RoleFeatureConfig, {
        role,
        config: newConfig,
        version: 1,
      });
      this.em.persist(roleConfig);
    } else {
      roleConfig.config = newConfig;
      roleConfig.version += 1;
    }

    await this.em.flush();

    // Invalidate cache
    cacheService.delete(`${CACHE_PREFIX}${roleId}`);

    return roleConfig;
  }

  /**
   * Get all role configs
   */
  async getAllConfigs(): Promise<RoleFeatureConfig[]> {
    return this.em.find(RoleFeatureConfig, {}, { populate: ['role'] });
  }

  /**
   * Invalidate cache for a role
   */
  invalidateCache(roleId: string): void {
    cacheService.delete(`${CACHE_PREFIX}${roleId}`);
  }

  /**
   * Invalidate all feature config caches
   */
  invalidateAllCaches(): void {
    cacheService.invalidate(CACHE_PREFIX);
  }
}

export function createFeatureConfigService(em: EntityManager): FeatureConfigService {
  return new FeatureConfigService(em);
}

