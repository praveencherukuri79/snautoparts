import { EntityManager } from '@mikro-orm/core';
import { Setting } from '../entities/index.js';
import { NotFoundError } from '../plugins/error-handler.js';
import { cacheService } from './cache.service.js';

const CACHE_PREFIX = 'settings:';
const CACHE_TTL = 300; // 5 minutes

/**
 * Settings Service
 * 
 * Handles application settings management for admins.
 */
export class SettingsService {
  constructor(private em: EntityManager) {}

  /**
   * Get all settings
   */
  async getAllSettings(): Promise<Setting[]> {
    return this.em.find(Setting, {}, {
      orderBy: { category: 'ASC', key: 'ASC' },
    });
  }

  /**
   * Get settings by category
   */
  async getSettingsByCategory(category: string): Promise<Setting[]> {
    return this.em.find(Setting, { category }, {
      orderBy: { key: 'ASC' },
    });
  }

  /**
   * Get a single setting by key
   */
  async getSetting(key: string): Promise<Setting | null> {
    // Check cache first
    const cached = cacheService.get<Setting>(`${CACHE_PREFIX}${key}`);
    if (cached) return cached;

    const setting = await this.em.findOne(Setting, { key });
    if (setting) {
      cacheService.set(`${CACHE_PREFIX}${key}`, setting, CACHE_TTL);
    }
    return setting;
  }

  /**
   * Get setting value by key
   */
  async getSettingValue<T = string>(key: string, defaultValue?: T): Promise<T> {
    const setting = await this.getSetting(key);
    if (!setting) {
      return defaultValue as T;
    }
    return setting.value as T;
  }

  /**
   * Update a setting
   */
  async updateSetting(key: string, value: string): Promise<Setting> {
    let setting = await this.em.findOne(Setting, { key });

    if (!setting) {
      throw new NotFoundError(`Setting not found: ${key}`);
    }

    setting.value = value;
    await this.em.flush();

    // Invalidate cache
    cacheService.delete(`${CACHE_PREFIX}${key}`);

    return setting;
  }

  /**
   * Create or update a setting
   */
  async upsertSetting(
    key: string,
    value: string,
    options?: { category?: string; description?: string; isPublic?: boolean },
  ): Promise<Setting> {
    let setting = await this.em.findOne(Setting, { key });

    if (setting) {
      setting.value = value;
      if (options?.category !== undefined) setting.category = options.category;
      if (options?.description !== undefined) setting.description = options.description;
      if (options?.isPublic !== undefined) setting.isPublic = options.isPublic;
    } else {
      setting = this.em.create(Setting, {
        key,
        value,
        category: options?.category ?? 'general',
        description: options?.description,
        isPublic: options?.isPublic ?? false,
      });
      this.em.persist(setting);
    }

    await this.em.flush();

    // Invalidate cache
    cacheService.delete(`${CACHE_PREFIX}${key}`);

    return setting;
  }

  /**
   * Bulk update settings
   */
  async bulkUpdate(updates: Array<{ key: string; value: string }>): Promise<Setting[]> {
    const settings: Setting[] = [];

    for (const update of updates) {
      let setting = await this.em.findOne(Setting, { key: update.key });

      if (setting) {
        setting.value = update.value;
        settings.push(setting);
        cacheService.delete(`${CACHE_PREFIX}${update.key}`);
      }
    }

    await this.em.flush();
    return settings;
  }

  /**
   * Get public settings only (for frontend)
   */
  async getPublicSettings(): Promise<Record<string, unknown>> {
    const settings = await this.em.find(Setting, { isPublic: true });
    return settings.reduce(
      (acc, s) => {
        acc[s.key] = s.value;
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }
}

export function createSettingsService(em: EntityManager): SettingsService {
  return new SettingsService(em);
}

