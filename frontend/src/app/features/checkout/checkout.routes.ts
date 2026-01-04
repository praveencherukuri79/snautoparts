import { Routes } from '@angular/router';

export const checkoutRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./checkout-layout/checkout-layout.component').then(m => m.CheckoutLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'address',
        pathMatch: 'full',
      },
      {
        path: 'address',
        loadComponent: () => import('./checkout-address/checkout-address.component').then(m => m.CheckoutAddressComponent),
      },
      {
        path: 'shipping',
        loadComponent: () => import('./checkout-shipping/checkout-shipping.component').then(m => m.CheckoutShippingComponent),
      },
      {
        path: 'payment',
        loadComponent: () => import('./checkout-payment/checkout-payment.component').then(m => m.CheckoutPaymentComponent),
      },
      {
        path: 'review',
        loadComponent: () => import('./checkout-review/checkout-review.component').then(m => m.CheckoutReviewComponent),
      },
      {
        path: 'confirmation/:orderId',
        loadComponent: () => import('./checkout-confirmation/checkout-confirmation.component').then(m => m.CheckoutConfirmationComponent),
      },
    ],
  },
];

