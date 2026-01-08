import { Routes } from '@angular/router';
import { featureGuard } from '@core/guards/feature.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full',
  },
  {
    path: 'orders',
    loadComponent: () => import('./orders/admin-orders.component').then(m => m.AdminOrdersComponent),
    canActivate: [featureGuard('manage_orders')],
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./orders/order-manage/order-manage.component').then(m => m.OrderManageComponent),
    canActivate: [featureGuard('manage_orders')],
  },
  {
    path: 'products',
    loadComponent: () => import('./products/products-list/products-list.component').then(m => m.ProductsListComponent),
    canActivate: [featureGuard('manage_products')],
  },
  {
    path: 'products/new',
    loadComponent: () => import('./products/product-edit/product-edit.component').then(m => m.ProductEditComponent),
    canActivate: [featureGuard('manage_products')],
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./products/product-edit/product-edit.component').then(m => m.ProductEditComponent),
    canActivate: [featureGuard('manage_products')],
  },
  {
    path: 'inventory',
    loadComponent: () => import('./inventory/inventory.component').then(m => m.InventoryComponent),
    canActivate: [featureGuard('manage_inventory')],
  },
  {
    path: 'dropship',
    loadComponent: () => import('./dropship/dropship.component').then(m => m.DropshipComponent),
    canActivate: [featureGuard('manage_dropship')],
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users.component').then(m => m.UsersComponent),
    canActivate: [featureGuard('manage_users')],
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),
    canActivate: [featureGuard('manage_settings')],
  },
  {
    path: 'audit',
    loadComponent: () => import('./audit/audit.component').then(m => m.AuditComponent),
    canActivate: [featureGuard('view_audit_logs')],
  },
  {
    path: 'reports',
    loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [featureGuard('view_reports')],
  },
];



