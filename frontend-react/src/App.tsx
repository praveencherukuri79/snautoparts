import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isAuthenticatedSelector, userRoleSelector } from '@/state/selectors';
import { authAtom } from '@/state/atoms/authAtom';
import { Spinner } from '@/primitives';
import { MainLayout, DashboardLayout } from '@/layouts';
import NotificationSnackbar from '@/components/NotificationSnackbar';
import type { AuthUser } from '@/models';

// Lazy load pages for code splitting
// Customer pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const ShopPage = lazy(() => import('@/pages/ShopPage'));
const CategoryPage = lazy(() => import('@/pages/CategoryPage'));
const ProductPage = lazy(() => import('@/pages/ProductPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/OrderConfirmationPage'));

// Auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));

// Account pages
const AccountDashboard = lazy(() => import('@/pages/account/AccountDashboard'));
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'));
const AddressesPage = lazy(() => import('@/pages/account/AddressesPage'));
const VehiclesPage = lazy(() => import('@/pages/account/VehiclesPage'));
const OrdersPage = lazy(() => import('@/pages/account/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/pages/account/OrderDetailPage'));

// Manager/Admin Dashboard pages
const DashboardHome = lazy(() => import('@/pages/dashboard/DashboardHome'));
const InventoryListPage = lazy(() => import('@/pages/dashboard/InventoryListPage'));
const InventoryDetailPage = lazy(() => import('@/pages/dashboard/InventoryDetailPage'));
const OrdersManagementPage = lazy(() => import('@/pages/dashboard/OrdersManagementPage'));
const CategoriesManagementPage = lazy(() => import('@/pages/dashboard/CategoriesManagementPage'));
const CustomersPage = lazy(() => import('@/pages/dashboard/CustomersPage'));
const ReportsPage = lazy(() => import('@/pages/dashboard/ReportsPage'));
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage'));

// Error pages
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/**
 * Loading fallback component
 */
const PageLoader: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
    }}
  >
    <Spinner size="lg" text="Loading..." />
  </Box>
);

/**
 * Protected Route Component
 * Redirects to login if not authenticated
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);
  const userRole = useRecoilValue(userRoleSelector);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && userRole && !roles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * Guest Route Component
 * Redirects to home if already authenticated
 */
interface GuestRouteProps {
  children: React.ReactNode;
}

const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  return <>{children}</>;
};

/**
 * Auth Initializer Component
 * Restores auth state from localStorage on app load
 */
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setAuthState = useSetRecoilState(authAtom);

  useEffect(() => {
    // Try to restore auth state from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user: AuthUser = JSON.parse(storedUser);
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user,
          featureConfig: null,
        });
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, [setAuthState]);

  return <>{children}</>;
};

/**
 * Main App Component
 */
const App: React.FC = () => {
  return (
    <AuthInitializer>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes with MainLayout */}
          <Route
            path="/"
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />
          <Route
            path="/shop"
            element={
              <MainLayout>
                <ShopPage />
              </MainLayout>
            }
          />
          <Route
            path="/categories/:slug"
            element={
              <MainLayout>
                <CategoryPage />
              </MainLayout>
            }
          />
          <Route
            path="/product/:id"
            element={
              <MainLayout>
                <ProductPage />
              </MainLayout>
            }
          />
          <Route
            path="/cart"
            element={
              <MainLayout>
                <CartPage />
              </MainLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/order-confirmation/:id"
            element={
              <MainLayout>
                <OrderConfirmationPage />
              </MainLayout>
            }
          />

          {/* Auth routes - Login has its own layout */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <ForgotPasswordPage />
            }
          />
          <Route
            path="/reset-password"
            element={
              <ResetPasswordPage />
            }
          />

          {/* Account routes with MainLayout */}
          <Route
            path="/account"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <AccountDashboard />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/account/profile"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/account/addresses"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <AddressesPage />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/account/vehicles"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <VehiclesPage />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/account/orders"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <OrdersPage />
                </ProtectedRoute>
              </MainLayout>
            }
          />
          <Route
            path="/account/orders/:orderId"
            element={
              <MainLayout>
                <ProtectedRoute>
                  <OrderDetailPage />
                </ProtectedRoute>
              </MainLayout>
            }
          />

          {/* Dashboard routes with DashboardLayout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={['manager', 'admin']}>
                <DashboardLayout title="Dashboard">
                  <DashboardHome />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/inventory"
            element={
              <ProtectedRoute roles={['manager', 'admin']}>
                <DashboardLayout title="Inventory">
                  <InventoryListPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/inventory/:id"
            element={
              <ProtectedRoute roles={['manager', 'admin']}>
                <DashboardLayout title="Product Details">
                  <InventoryDetailPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/orders"
            element={
              <ProtectedRoute roles={['manager', 'admin']}>
                <DashboardLayout title="Orders">
                  <OrdersManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/categories"
            element={
              <ProtectedRoute roles={['manager', 'admin']}>
                <DashboardLayout title="Categories">
                  <CategoriesManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/customers"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout title="Customers">
                  <CustomersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reports/*"
            element={
              <ProtectedRoute roles={['manager', 'admin']}>
                <DashboardLayout title="Reports">
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings/*"
            element={
              <ProtectedRoute roles={['admin']}>
                <DashboardLayout title="Settings">
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 page */}
          <Route
            path="*"
            element={
              <MainLayout>
                <NotFoundPage />
              </MainLayout>
            }
          />
        </Routes>
      </Suspense>

      {/* Global notification snackbar */}
      <NotificationSnackbar />
    </AuthInitializer>
  );
};

export default App;
