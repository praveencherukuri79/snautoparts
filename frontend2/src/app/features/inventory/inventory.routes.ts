import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '@shared/layouts/dashboard-layout/dashboard-layout.component';

export const inventoryRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/admin/inventory/inventory.component').then(
            (m) => m.InventoryComponent
          ),
      },
      {
        path: 'low-stock',
        loadComponent: () =>
          import('@features/admin/inventory/low-stock/low-stock.component').then(
            (m) => m.LowStockComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('@features/admin/inventory/inventory-detail/inventory-detail.component').then(
            (m) => m.InventoryDetailComponent
          ),
      },
    ],
  },
];

