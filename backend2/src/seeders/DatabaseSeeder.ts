import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { RoleSeeder } from './RoleSeeder.js';
import { CategorySeeder } from './CategorySeeder.js';
import { ProductSeeder } from './ProductSeeder.js';
import { InventorySeeder } from './InventorySeeder.js';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    // Run seeders in order
    return this.call(em, [
      RoleSeeder,
      CategorySeeder,
      ProductSeeder,
      InventorySeeder, // Real inventory data from XLSX
    ]);
  }
}

