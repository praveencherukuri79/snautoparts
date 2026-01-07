import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { featureGuard } from '@core/guards/feature.guard';

export const routes: Routes = [
  // Public routes - always available
  {
    path: '',
    loadComponent: () => import('@features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('@features/catalog/product-listing/product-listing.component').then(m => m.ProductListingComponent),
  },
  {
    path: 'products/:slug',
    loadComponent: () => import('@features/catalog/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
  },
  {
    path: 'categories',
    loadComponent: () => import('@features/catalog/category-listing/category-listing.component').then(m => m.CategoryListingComponent),
  },
  {
    path: 'categories/:slug',
    loadComponent: () => import('@features/catalog/product-listing/product-listing.component').then(m => m.ProductListingComponent),
  },
  {
    path: 'cart',
    loadComponent: () => import('@features/cart/cart.component').then(m => m.CartComponent),
  },
  {
    path: 'track',
    loadComponent: () => import('@features/orders/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent),
  },
  {
    path: 'track/:orderNumber',
    loadComponent: () => import('@features/orders/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent),
  },

  // Auth routes
  {
    path: 'login',
    loadComponent: () => import('@features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('@features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('@features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('@features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },

  // Protected routes - require authentication
  {
    path: 'checkout',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'cart.checkout' },
    loadChildren: () => import('@features/checkout/checkout.routes').then(m => m.checkoutRoutes),
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadChildren: () => import('@features/account/account.routes').then(m => m.accountRoutes),
  },
  {
    path: 'orders',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'orders.viewOwn|orders.viewAll' },
    loadChildren: () => import('@features/orders/orders.routes').then(m => m.ordersRoutes),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('@features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },

  // Manager routes
  {
    path: 'inventory',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'inventory.view' },
    loadChildren: () => import('@features/inventory/inventory.routes').then(m => m.inventoryRoutes),
  },
  {
    path: 'products-manage',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'products.update' },
    loadChildren: () => import('@features/products-management/products.routes').then(m => m.productsRoutes),
  },
  {
    path: 'dropship',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'dropship.viewOrders' },
    loadChildren: () => import('@features/dropship/dropship.routes').then(m => m.dropshipRoutes),
  },
  {
    path: 'reports',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'reports.salesByDay' },
    loadChildren: () => import('@features/reports/reports.routes').then(m => m.reportsRoutes),
  },

  // Admin routes
  {
    path: 'users',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'users.viewAll' },
    loadChildren: () => import('@features/users/users.routes').then(m => m.usersRoutes),
  },
  {
    path: 'settings',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'settings.view' },
    loadChildren: () => import('@features/settings/settings.routes').then(m => m.settingsRoutes),
  },
  {
    path: 'audit',
    canActivate: [authGuard, featureGuard],
    data: { feature: 'audit.view' },
    loadChildren: () => import('@features/audit/audit.routes').then(m => m.auditRoutes),
  },

  // Wildcard
  {
    path: '**',
    redirectTo: '',
  },
];

