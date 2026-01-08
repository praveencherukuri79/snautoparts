import { Routes } from '@angular/router';

export const accountRoutes: Routes = [
  {
    path: '',
    redirectTo: 'profile',
    pathMatch: 'full',
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'addresses',
    loadComponent: () => import('./addresses/addresses.component').then(m => m.AddressesComponent),
  },
  {
    path: 'vehicles',
    loadComponent: () => import('./vehicles/vehicles.component').then(m => m.VehiclesComponent),
  },
  {
    path: 'change-password',
    loadComponent: () => import('./change-password/change-password.component').then(m => m.ChangePasswordComponent),
  },
];



