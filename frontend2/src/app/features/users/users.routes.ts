import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '@shared/layouts/dashboard-layout/dashboard-layout.component';

export const usersRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/admin/users/users.component').then(
            (m) => m.UsersComponent
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('@features/admin/users/user-form/user-form.component').then(
            (m) => m.UserFormComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('@features/admin/users/user-detail/user-detail.component').then(
            (m) => m.UserDetailComponent
          ),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('@features/admin/users/user-form/user-form.component').then(
            (m) => m.UserFormComponent
          ),
      },
    ],
  },
];

