import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Role, RoleFeatureConfig, User } from '../entities/index.js';
import { hashPassword } from '../utils/crypto.js';

// Default feature configs for each role
const CUSTOMER_CONFIG = {
  role: 'CUSTOMER',
  version: 1,
  features: {
    catalog: { browse: true, search: true, viewDetail: true, fitmentFilter: true },
    cart: { view: true, modify: true, checkout: true },
    orders: { viewOwn: true, viewAll: false, updateStatus: false, cancel: false, viewStatistics: false },
    inventory: { view: false, adjust: false, import: false, viewHistory: false, viewAlerts: false },
    products: { create: false, update: false, delete: false, manageFitment: false, manageImages: false },
    dropship: { viewOrders: false, retryPush: false, manageAffiliates: false },
    users: { viewAll: false, create: false, updateRole: false, delete: false },
    settings: { view: false, update: false },
    audit: { view: false, export: false },
    reports: { salesByDay: false, salesByCategory: false, inventoryValue: false, gmv: false },
  },
  navigation: {
    primary: [
      { id: 'home', label: 'Home', icon: 'home', route: '/' },
      { id: 'products', label: 'Products', icon: 'grid', route: '/products' },
      { id: 'cart', label: 'Cart', icon: 'shopping-cart', route: '/cart', badge: { type: 'count', source: '/api/v1/cart/count' } },
    ],
    secondary: [],
    account: [
      { id: 'orders', label: 'My Orders', icon: 'package', route: '/orders' },
      { id: 'profile', label: 'Profile', icon: 'user', route: '/account/profile' },
      { id: 'addresses', label: 'Addresses', icon: 'map-pin', route: '/account/addresses' },
    ],
  },
  ui: {
    dashboardLayout: 'customer',
    showPriceHistory: false,
    showCostPrice: false,
    showAuditInfo: false,
  },
};

const MANAGER_CONFIG = {
  role: 'MANAGER',
  version: 1,
  features: {
    catalog: { browse: true, search: true, viewDetail: true, fitmentFilter: true },
    cart: { view: false, modify: false, checkout: false },
    orders: { viewOwn: false, viewAll: true, updateStatus: true, cancel: true, viewStatistics: true },
    inventory: { view: true, adjust: true, import: true, viewHistory: true, viewAlerts: true },
    products: { create: true, update: true, delete: true, manageFitment: true, manageImages: true },
    dropship: { viewOrders: true, retryPush: true, manageAffiliates: false },
    users: { viewAll: false, create: false, updateRole: false, delete: false },
    settings: { view: false, update: false },
    audit: { view: false, export: false },
    reports: { salesByDay: true, salesByCategory: true, inventoryValue: true, gmv: false },
  },
  navigation: {
    primary: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
      { id: 'orders', label: 'Orders', icon: 'package', route: '/orders', badge: { type: 'count', source: '/api/v1/orders/pending-count' } },
      { id: 'inventory', label: 'Inventory', icon: 'warehouse', route: '/inventory', badge: { type: 'dot', source: '/api/v1/inventory/has-alerts' } },
      { id: 'products', label: 'Products', icon: 'box', route: '/products' },
      { id: 'dropship', label: 'Drop Ship', icon: 'truck', route: '/dropship' },
      { id: 'reports', label: 'Reports', icon: 'bar-chart', route: '/reports' },
    ],
    secondary: [],
    account: [
      { id: 'profile', label: 'Profile', icon: 'user', route: '/account/profile' },
    ],
  },
  ui: {
    dashboardLayout: 'operations',
    showPriceHistory: true,
    showCostPrice: true,
    showAuditInfo: false,
  },
};

const ADMIN_CONFIG = {
  role: 'ADMIN',
  version: 1,
  features: {
    catalog: { browse: true, search: true, viewDetail: true, fitmentFilter: true },
    cart: { view: false, modify: false, checkout: false },
    orders: { viewOwn: false, viewAll: true, updateStatus: true, cancel: true, viewStatistics: true },
    inventory: { view: true, adjust: true, import: true, viewHistory: true, viewAlerts: true },
    products: { create: true, update: true, delete: true, manageFitment: true, manageImages: true },
    dropship: { viewOrders: true, retryPush: true, manageAffiliates: true },
    users: { viewAll: true, create: true, updateRole: true, delete: true },
    settings: { view: true, update: true },
    audit: { view: true, export: true },
    reports: { salesByDay: true, salesByCategory: true, inventoryValue: true, gmv: true },
  },
  navigation: {
    primary: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
      { id: 'orders', label: 'Orders', icon: 'package', route: '/orders' },
      { id: 'inventory', label: 'Inventory', icon: 'warehouse', route: '/inventory' },
      { id: 'products', label: 'Products', icon: 'box', route: '/products' },
      { id: 'dropship', label: 'Drop Ship', icon: 'truck', route: '/dropship' },
      { id: 'reports', label: 'Reports', icon: 'bar-chart', route: '/reports' },
    ],
    secondary: [
      { id: 'users', label: 'Users', icon: 'users', route: '/users' },
      { id: 'settings', label: 'Settings', icon: 'settings', route: '/settings' },
      { id: 'affiliates', label: 'Affiliates', icon: 'link', route: '/affiliates' },
      { id: 'audit', label: 'Audit Log', icon: 'file-text', route: '/audit' },
    ],
    account: [
      { id: 'profile', label: 'Profile', icon: 'user', route: '/account/profile' },
    ],
  },
  ui: {
    dashboardLayout: 'admin',
    showPriceHistory: true,
    showCostPrice: true,
    showAuditInfo: true,
  },
};

export class RoleSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('Seeding roles and feature configs...');

    // Create roles
    const roles = [
      { name: 'CUSTOMER', displayName: 'Customer', description: 'Regular shoppers and end users', config: CUSTOMER_CONFIG },
      { name: 'MANAGER', displayName: 'Manager', description: 'Operations staff, warehouse, fulfillment', config: MANAGER_CONFIG },
      { name: 'ADMIN', displayName: 'Administrator', description: 'System administrators and owners', config: ADMIN_CONFIG },
    ];

    for (const roleData of roles) {
      // Check if role already exists
      let role = await em.findOne(Role, { name: roleData.name });
      
      if (!role) {
        role = new Role();
        role.name = roleData.name;
        role.displayName = roleData.displayName;
        role.description = roleData.description;
        em.persist(role);
        console.log(`  Created role: ${roleData.name}`);
      } else {
        console.log(`  Role already exists: ${roleData.name}`);
      }

      // Create or update feature config
      let featureConfig = await em.findOne(RoleFeatureConfig, { role });
      
      if (!featureConfig) {
        featureConfig = new RoleFeatureConfig();
        featureConfig.role = role;
        featureConfig.config = roleData.config;
        em.persist(featureConfig);
        console.log(`  Created feature config for: ${roleData.name}`);
      }
    }

    await em.flush();

    // Create test users for each role
    // All test users share the same password: Test123!
    const TEST_PASSWORD = 'Test123!';
    const passwordHash = await hashPassword(TEST_PASSWORD);

    const testUsers = [
      // Customer
      {
        email: 'customer@snautoparts.com',
        firstName: 'John',
        lastName: 'Customer',
        phone: '555-100-1001',
        roleName: 'CUSTOMER',
      },
      // Manager
      {
        email: 'manager@snautoparts.com',
        firstName: 'Sarah',
        lastName: 'Manager',
        phone: '555-200-2002',
        roleName: 'MANAGER',
      },
      // Admin
      {
        email: 'admin@snautoparts.com',
        firstName: 'Mike',
        lastName: 'Admin',
        phone: '555-300-3003',
        roleName: 'ADMIN',
      },
    ];

    console.log(`\n  Creating test users (password for all: ${TEST_PASSWORD})...`);

    for (const userData of testUsers) {
      const existingUser = await em.findOne(User, { email: userData.email });
      
      if (!existingUser) {
        const role = await em.findOne(Role, { name: userData.roleName });
        
        if (role) {
          const user = new User();
          user.email = userData.email;
          user.passwordHash = passwordHash;
          user.firstName = userData.firstName;
          user.lastName = userData.lastName;
          user.phone = userData.phone;
          user.role = role;
          user.emailVerified = true;
          user.isActive = true;
          em.persist(user);
          console.log(`    ✓ ${userData.roleName}: ${userData.email}`);
        }
      } else {
        console.log(`    - ${userData.roleName}: ${userData.email} (already exists)`);
      }
    }

    await em.flush();
    
    console.log('\n  ┌────────────────────────────────────────────────────────┐');
    console.log('  │              TEST LOGIN CREDENTIALS                    │');
    console.log('  ├────────────────────────────────────────────────────────┤');
    console.log('  │  Role      │ Email                      │ Password    │');
    console.log('  ├────────────────────────────────────────────────────────┤');
    console.log('  │  CUSTOMER  │ customer@snautoparts.com   │ Test123!    │');
    console.log('  │  MANAGER   │ manager@snautoparts.com    │ Test123!    │');
    console.log('  │  ADMIN     │ admin@snautoparts.com      │ Test123!    │');
    console.log('  └────────────────────────────────────────────────────────┘');
    
    console.log('\nRoles and feature configs seeded successfully!');
  }
}

