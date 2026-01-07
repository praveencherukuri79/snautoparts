import { Routes } from '@angular/router';

export const checkoutRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./checkout-layout/checkout-layout.component').then(m => m.CheckoutLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'shipping',
        pathMatch: 'full',
      },
      {
        path: 'shipping',
        loadComponent: () => import('./shipping-address/shipping-address.component').then(m => m.ShippingAddressComponent),
      },
      {
        path: 'method',
        loadComponent: () => import('./shipping-method/shipping-method.component').then(m => m.ShippingMethodComponent),
      },
      {
        path: 'payment',
        loadComponent: () => import('./payment/payment.component').then(m => m.PaymentComponent),
      },
      {
        path: 'review',
        loadComponent: () => import('./review/review.component').then(m => m.ReviewComponent),
      },
      {
        path: 'confirmation/:orderId',
        loadComponent: () => import('./confirmation/confirmation.component').then(m => m.ConfirmationComponent),
      },
    ],
  },
];


