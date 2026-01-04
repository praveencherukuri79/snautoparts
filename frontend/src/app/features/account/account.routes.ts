import { Routes } from '@angular/router';

export const accountRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'addresses',
    loadComponent: () => import('./addresses/addresses.component').then(m => m.AddressesComponent),
  },
];

