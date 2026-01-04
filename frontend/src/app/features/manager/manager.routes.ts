import { Routes } from '@angular/router';

export const managerRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./manager-layout/manager-layout.component').then(m => m.ManagerLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'orders',
        pathMatch: 'full',
      },
      {
        path: 'orders',
        loadComponent: () => import('./orders-dashboard/orders-dashboard.component').then(m => m.OrdersDashboardComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./order-detail/order-detail.component').then(m => m.OrderDetailComponent),
      },
      {
        path: 'inventory',
        loadComponent: () => import('./inventory-list/inventory-list.component').then(m => m.InventoryListComponent),
      },
      {
        path: 'inventory/adjustments',
        loadComponent: () => import('./inventory-adjustments/inventory-adjustments.component').then(m => m.InventoryAdjustmentsComponent),
      },
    ],
  },
];

