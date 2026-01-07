import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from '@shared/layouts/dashboard-layout/dashboard-layout.component';

export const settingsRoutes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@features/admin/settings/settings.component').then(
            (m) => m.SettingsComponent
          ),
        children: [
          {
            path: '',
            redirectTo: 'general',
            pathMatch: 'full',
          },
          {
            path: 'general',
            loadComponent: () =>
              import('@features/admin/settings/settings-general/settings-general.component').then(
                (m) => m.SettingsGeneralComponent
              ),
          },
          {
            path: 'shipping',
            loadComponent: () =>
              import('@features/admin/settings/settings-shipping/settings-shipping.component').then(
                (m) => m.SettingsShippingComponent
              ),
          },
          {
            path: 'tax',
            loadComponent: () =>
              import('@features/admin/settings/settings-tax/settings-tax.component').then(
                (m) => m.SettingsTaxComponent
              ),
          },
          {
            path: 'integrations',
            loadComponent: () =>
              import('@features/admin/settings/settings-integrations/settings-integrations.component').then(
                (m) => m.SettingsIntegrationsComponent
              ),
          },
        ],
      },
    ],
  },
];
