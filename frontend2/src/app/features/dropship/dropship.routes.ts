import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '@shared/layouts/dashboard-layout/dashboard-layout.component';

export const dropshipRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/admin/dropship/dropship.component').then(
            (m) => m.DropshipComponent
          ),
      },
      {
        path: 'affiliates',
        loadComponent: () =>
          import('@features/admin/affiliates/affiliates.component').then(
            (m) => m.AffiliatesComponent
          ),
      },
      {
        path: 'affiliates/new',
        loadComponent: () =>
          import('@features/admin/affiliates/affiliate-form/affiliate-form.component').then(
            (m) => m.AffiliateFormComponent
          ),
      },
      {
        path: 'affiliates/:id',
        loadComponent: () =>
          import('@features/admin/affiliates/affiliate-detail/affiliate-detail.component').then(
            (m) => m.AffiliateDetailComponent
          ),
      },
      {
        path: 'affiliates/:id/configure',
        loadComponent: () =>
          import('@features/admin/affiliates/affiliate-form/affiliate-form.component').then(
            (m) => m.AffiliateFormComponent
          ),
      },
    ],
  },
];
