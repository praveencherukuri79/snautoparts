import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full',
      },
      {
        path: 'users',
        loadComponent: () => import('./users-management/users-management.component').then(m => m.UsersManagementComponent),
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings-management/settings-management.component').then(m => m.SettingsManagementComponent),
      },
      {
        path: 'audit',
        loadComponent: () => import('./audit-logs/audit-logs.component').then(m => m.AuditLogsComponent),
      },
    ],
  },
];

