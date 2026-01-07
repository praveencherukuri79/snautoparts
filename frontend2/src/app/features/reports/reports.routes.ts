import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '@shared/layouts/dashboard-layout/dashboard-layout.component';

export const reportsRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/admin/reports/reports.component').then(
            (m) => m.ReportsComponent
          ),
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('@features/admin/reports/reports.component').then(
            (m) => m.ReportsComponent
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('@features/admin/reports/order-statistics/order-statistics.component').then(
            (m) => m.OrderStatisticsComponent
          ),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('@features/admin/reports/inventory-report/inventory-report.component').then(
            (m) => m.InventoryReportComponent
          ),
      },
    ],
  },
];
