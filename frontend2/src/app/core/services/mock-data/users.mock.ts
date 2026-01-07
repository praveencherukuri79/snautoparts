/**
 * Mock data generators for Users
 */

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
  roleName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MockUserSession {
  id: string;
  device: string;
  location: string;
  browser: string;
  isCurrent: boolean;
  lastActive: string;
}

export interface MockRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
}

const USER_DATA = [
  { firstName: 'John', lastName: 'Smith', role: 'CUSTOMER' as const },
  { firstName: 'Sarah', lastName: 'Johnson', role: 'CUSTOMER' as const },
  { firstName: 'Michael', lastName: 'Brown', role: 'MANAGER' as const },
  { firstName: 'Emily', lastName: 'Davis', role: 'CUSTOMER' as const },
  { firstName: 'David', lastName: 'Wilson', role: 'ADMIN' as const },
  { firstName: 'Jessica', lastName: 'Martinez', role: 'CUSTOMER' as const },
  { firstName: 'Christopher', lastName: 'Anderson', role: 'MANAGER' as const },
  { firstName: 'Amanda', lastName: 'Taylor', role: 'CUSTOMER' as const },
  { firstName: 'Matthew', lastName: 'Thomas', role: 'CUSTOMER' as const },
  { firstName: 'Ashley', lastName: 'Garcia', role: 'CUSTOMER' as const },
];

const ROLE_DISPLAY: Record<string, string> = {
  'CUSTOMER': 'Customer',
  'MANAGER': 'Manager',
  'ADMIN': 'Administrator',
};

export function generateUsers(count: number = 20): MockUser[] {
  return Array.from({ length: count }, (_, i) => {
    const userData = USER_DATA[i % USER_DATA.length];
    const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);

    return {
      id: `user-${i + 1}`,
      email: `${userData.firstName.toLowerCase()}.${userData.lastName.toLowerCase()}${i > 9 ? i : ''}@email.com`,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: `(555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i).padStart(4, '0')}`,
      role: userData.role,
      roleName: ROLE_DISPLAY[userData.role],
      isActive: Math.random() > 0.1,
      isEmailVerified: Math.random() > 0.2,
      avatarUrl: Math.random() > 0.5 ? `/assets/images/avatars/avatar-${(i % 10) + 1}.jpg` : undefined,
      lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}

export function generateUser(userId: string): MockUser {
  const users = generateUsers(20);
  const user = users.find(u => u.id === userId);
  return user || users[0];
}

export function generateUserSessions(): MockUserSession[] {
  return [
    {
      id: 'session-1',
      device: 'MacBook Pro 16"',
      location: 'San Francisco, US',
      browser: 'Chrome 120',
      isCurrent: true,
      lastActive: 'Now',
    },
    {
      id: 'session-2',
      device: 'iPhone 15 Pro',
      location: 'San Francisco, US',
      browser: 'Safari Mobile',
      isCurrent: false,
      lastActive: 'Last active 2 days ago',
    },
    {
      id: 'session-3',
      device: 'Windows Desktop',
      location: 'New York, US',
      browser: 'Firefox 121',
      isCurrent: false,
      lastActive: 'Last active 5 days ago',
    },
  ];
}

export function generateRoles(): MockRole[] {
  return [
    { id: 'role-1', name: 'CUSTOMER', displayName: 'Customer', description: 'Regular customer with shopping access', isActive: true },
    { id: 'role-2', name: 'MANAGER', displayName: 'Manager', description: 'Operations staff with inventory and order management', isActive: true },
    { id: 'role-3', name: 'ADMIN', displayName: 'Administrator', description: 'Full system access including user and settings management', isActive: true },
  ];
}

export function generateUserStats(userId: string) {
  return {
    totalOrders: Math.floor(5 + Math.random() * 50),
    lifetimeValue: Math.round((500 + Math.random() * 5000) * 100) / 100,
    avgOrderValue: Math.round((50 + Math.random() * 200) * 100) / 100,
    avgReview: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
  };
}

