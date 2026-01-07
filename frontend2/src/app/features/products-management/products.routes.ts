import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '@shared/layouts/dashboard-layout/dashboard-layout.component';

export const productsRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/admin/products/products-list/products-list.component').then(
            (m) => m.ProductsListComponent
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('@features/admin/products/product-edit/product-edit.component').then(
            (m) => m.ProductEditComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('@features/admin/products/product-edit/product-edit.component').then(
            (m) => m.ProductEditComponent
          ),
      },
    ],
  },
];

