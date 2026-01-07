# React Frontend Development Guide

Complete guide to frontend development practices, patterns, and conventions for the SN Auto Parts React application.

## Tech Stack

- **React 18+** - UI library with hooks
- **Material-UI (MUI) v5** - Component library and design system
- **TypeScript** - Type safety
- **Day.js** - Date manipulation and formatting
- **Recoil** - State management
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Vite** - Build tool and dev server

---

## Project Structure

```
frontend_react/
├── src/
│   ├── components/              # Reusable components
│   │   ├── common/             # Common UI components
│   │   │   ├── Button/
│   │   │   ├── Card/
│   │   │   └── Loading/
│   │   ├── layout/             # Layout components
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── Sidebar/
│   │   └── forms/              # Form components
│   │       ├── TextField/
│   │       └── Select/
│   ├── features/               # Feature modules
│   │   ├── auth/               # Authentication
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── components/
│   │   ├── catalog/            # Product catalog
│   │   │   ├── ProductListingPage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   └── components/
│   │   ├── cart/               # Shopping cart
│   │   │   ├── CartPage.tsx
│   │   │   └── components/
│   │   ├── checkout/           # Checkout flow
│   │   │   ├── CheckoutPage.tsx
│   │   │   └── steps/
│   │   ├── orders/             # Order management
│   │   ├── account/            # Account management
│   │   ├── manager/            # Manager dashboard
│   │   └── admin/              # Admin dashboard
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useApi.ts
│   ├── services/               # API services
│   │   ├── api.service.ts      # Base HTTP service
│   │   ├── auth.service.ts
│   │   ├── catalog.service.ts
│   │   ├── cart.service.ts
│   │   └── order.service.ts
│   ├── stores/                 # Recoil atoms/selectors
│   │   ├── auth.atom.ts
│   │   ├── cart.atom.ts
│   │   └── ui.atom.ts
│   ├── types/                  # TypeScript types
│   │   ├── api.types.ts
│   │   ├── product.types.ts
│   │   ├── cart.types.ts
│   │   └── user.types.ts
│   ├── utils/                  # Utility functions
│   │   ├── date.ts             # Day.js setup
│   │   ├── format.ts
│   │   └── validation.ts
│   ├── constants/              # Constants
│   │   └── app.constants.ts
│   ├── theme/                  # MUI theme configuration
│   │   ├── theme.ts
│   │   └── palette.ts
│   ├── routes/                 # Route configuration
│   │   └── AppRouter.tsx
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Entry point
├── public/                     # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .env
```

---

## Getting Started

### Installation

```bash
# Create React app with Vite
npm create vite@latest frontend_react -- --template react-ts

cd frontend_react

# Install dependencies
npm install

# Install required packages
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install recoil
npm install react-router-dom
npm install axios
npm install dayjs
npm install react-hook-form @hookform/resolvers
npm install zod
```

### Package.json Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "recoil": "^0.7.7",
    "react-router-dom": "^6.16.0",
    "axios": "^1.5.0",
    "dayjs": "^1.11.10",
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    "vite": "^4.4.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

### Environment Configuration

**`.env`:**
```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_ENABLE_MOCK_DATA=false
```

**`src/config/env.ts`:**
```typescript
export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
};
```

---

## State Management with Recoil

### Setup

**`src/main.tsx`:**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RecoilRoot } from 'recoil';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import App from './App';
import { theme } from './theme/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </RecoilRoot>
  </React.StrictMode>
);
```

### Atoms (State)

**`src/stores/auth.atom.ts`:**
```typescript
import { atom, selector } from 'recoil';
import { User } from '../types/user.types';

export const authUserAtom = atom<User | null>({
  key: 'authUserAtom',
  default: null,
});

export const isAuthenticatedSelector = selector({
  key: 'isAuthenticatedSelector',
  get: ({ get }) => {
    const user = get(authUserAtom);
    return user !== null;
  },
});

export const userRoleSelector = selector({
  key: 'userRoleSelector',
  get: ({ get }) => {
    const user = get(authUserAtom);
    return user?.role || null;
  },
});
```

**`src/stores/cart.atom.ts`:**
```typescript
import { atom, selector } from 'recoil';
import { Cart } from '../types/cart.types';

export const cartAtom = atom<Cart | null>({
  key: 'cartAtom',
  default: null,
});

export const cartItemCountSelector = selector({
  key: 'cartItemCountSelector',
  get: ({ get }) => {
    const cart = get(cartAtom);
    return cart?.itemCount || 0;
  },
});

export const cartSubtotalSelector = selector({
  key: 'cartSubtotalSelector',
  get: ({ get }) => {
    const cart = get(cartAtom);
    return cart?.subtotal || 0;
  },
});
```

### Using Recoil in Components

```typescript
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import { cartAtom, cartItemCountSelector } from '../stores/cart.atom';
import { Badge } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

// Read-only value
function CartBadge() {
  const itemCount = useRecoilValue(cartItemCountSelector);
  
  return (
    <Badge badgeContent={itemCount} color="error">
      <ShoppingCart />
    </Badge>
  );
}

// Read and write
function CartComponent() {
  const [cart, setCart] = useRecoilState(cartAtom);
  
  const updateCart = (newCart: Cart) => {
    setCart(newCart);
  };
  
  return (
    <div>
      {cart?.items.map(item => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  );
}

// Write-only
function CartActions() {
  const setCart = useSetRecoilState(cartAtom);
  
  const clearCart = () => {
    setCart(null);
  };
  
  return <Button onClick={clearCart}>Clear Cart</Button>;
}
```

---

## Component Patterns

### Functional Components with TypeScript

```typescript
import { FC } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
} from '@mui/material';
import { Product } from '../types/product.types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
}

export const ProductCard: FC<ProductCardProps> = ({ 
  product, 
  onAddToCart 
}) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={product.imageUrl || '/placeholder.png'}
        alt={product.name}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {product.shortDescription}
        </Typography>
        <Typography variant="h6" color="primary">
          ${Number(product.price).toFixed(2)}
        </Typography>
      </CardContent>
      <CardActions>
        <Button 
          variant="contained" 
          fullWidth
          onClick={() => onAddToCart(product.id)}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
};
```

### Custom Hooks Pattern

**`src/hooks/useAuth.ts`:**
```typescript
import { useRecoilState, useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { authUserAtom, isAuthenticatedSelector } from '../stores/auth.atom';
import { authService } from '../services/auth.service';
import { User, LoginRequest } from '../types/auth.types';

export const useAuth = () => {
  const [user, setUser] = useRecoilState(authUserAtom);
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);
  const navigate = useNavigate();
  
  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      navigate('/');
      return response;
    } catch (error) {
      throw error;
    }
  };
  
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      setUser(user);
    } catch {
      setUser(null);
    }
  };
  
  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
};
```

**`src/hooks/useCart.ts`:**
```typescript
import { useRecoilState } from 'recoil';
import { useEffect } from 'react';
import { cartAtom } from '../stores/cart.atom';
import { cartService } from '../services/cart.service';
import { Cart } from '../types/cart.types';

export const useCart = () => {
  const [cart, setCart] = useRecoilState(cartAtom);
  
  const loadCart = async () => {
    try {
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };
  
  const addItem = async (productId: string, quantity: number = 1) => {
    try {
      const updatedCart = await cartService.addItem(productId, quantity);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Failed to add item:', error);
      throw error;
    }
  };
  
  const updateItem = async (itemId: string, quantity: number) => {
    try {
      const updatedCart = await cartService.updateItem(itemId, quantity);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  };
  
  const removeItem = async (itemId: string) => {
    try {
      const updatedCart = await cartService.removeItem(itemId);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      console.error('Failed to remove item:', error);
      throw error;
    }
  };
  
  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart(null);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };
  
  return {
    cart,
    loadCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  };
};
```

---

## Material-UI Integration

### Theme Configuration

**`src/theme/theme.ts`:**
```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#137fec',
      dark: '#0f6bd0',
      light: 'rgba(19, 127, 236, 0.1)',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#374151',
    },
    background: {
      default: '#f6f7f8',
      paper: '#ffffff',
    },
    text: {
      primary: '#111418',
      secondary: '#374151',
    },
    error: {
      main: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#16a34a',
    },
    info: {
      main: '#0ea5e9',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});
```

### Using MUI Components

```typescript
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
  Stack,
  Container,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useRecoilValue } from 'recoil';
import { cartItemCountSelector } from '../stores/cart.atom';

function Header() {
  const itemCount = useRecoilValue(cartItemCountSelector);
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          SN Auto Parts
        </Typography>
        <IconButton color="inherit">
          <SearchIcon />
        </IconButton>
        <IconButton color="inherit" component="a" href="/cart">
          <Badge badgeContent={itemCount} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <IconButton color="inherit" component="a" href="/account">
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
```

---

## Date Handling with Day.js

### Setup

**`src/utils/date.ts`:**
```typescript
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export default dayjs;
```

### Usage Examples

```typescript
import dayjs from '../utils/date';

// Format date
const formatted = dayjs(order.createdAt).format('MMM DD, YYYY');
// Output: "Jan 15, 2024"

// Relative time
const relative = dayjs(order.createdAt).fromNow();
// Output: "2 days ago"

// Custom format
const custom = dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss');

// Timezone conversion
const tzDate = dayjs(order.createdAt).tz('America/New_York');

// Date comparison
const isToday = dayjs(order.createdAt).isSame(dayjs(), 'day');
const isPast = dayjs(order.createdAt).isBefore(dayjs());

// Date manipulation
const nextWeek = dayjs().add(7, 'day');
const lastMonth = dayjs().subtract(1, 'month');
const startOfDay = dayjs().startOf('day');
const endOfMonth = dayjs().endOf('month');
```

### Component Example

```typescript
import { FC } from 'react';
import { Typography } from '@mui/material';
import dayjs from '../utils/date';

interface OrderDateProps {
  date: string;
  format?: 'relative' | 'full' | 'short';
}

export const OrderDate: FC<OrderDateProps> = ({ date, format = 'full' }) => {
  const formatDate = () => {
    switch (format) {
      case 'relative':
        return dayjs(date).fromNow();
      case 'short':
        return dayjs(date).format('MMM DD');
      case 'full':
      default:
        return dayjs(date).format('MMMM DD, YYYY [at] h:mm A');
    }
  };
  
  return (
    <Typography variant="body2" color="text.secondary">
      {formatDate()}
    </Typography>
  );
};
```

---

## API Integration

### Axios Setup

**`src/services/api.service.ts`:**
```typescript
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';

interface ApiResponse<T> {
  data: T;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: env.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // For cookies
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth-token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('auth-token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
  
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data.data;
  }
  
  async getPaginated<T>(
    url: string, 
    params?: Record<string, unknown>
  ): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(url, { params });
    return response.data;
  }
  
  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data.data;
  }
  
  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data.data;
  }
  
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data.data;
  }
}

export const apiService = new ApiService();
```

### Domain Services

**`src/services/auth.service.ts`:**
```typescript
import { apiService } from './api.service';
import { User, LoginRequest, RegisterRequest } from '../types/auth.types';

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      '/public/auth/login',
      { email, password } as LoginRequest
    );
    localStorage.setItem('auth-token', response.token);
    return response;
  },
  
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      '/public/auth/register',
      data
    );
    localStorage.setItem('auth-token', response.token);
    return response;
  },
  
  async logout(): Promise<void> {
    await apiService.post('/public/auth/logout');
    localStorage.removeItem('auth-token');
  },
  
  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/public/auth/me');
  },
  
  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/public/auth/forgot-password', { email });
  },
  
  async resetPassword(token: string, password: string): Promise<void> {
    await apiService.post('/public/auth/reset-password', { token, password });
  },
};
```

**`src/services/cart.service.ts`:**
```typescript
import { apiService } from './api.service';
import { Cart, AddToCartRequest } from '../types/cart.types';

export const cartService = {
  async getCart(): Promise<Cart> {
    return apiService.get<Cart>('/customer/cart');
  },
  
  async addItem(productId: string, quantity: number): Promise<Cart> {
    return apiService.post<Cart>(
      '/customer/cart/items',
      { productId, quantity } as AddToCartRequest
    );
  },
  
  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    return apiService.patch<Cart>(
      `/customer/cart/items/${itemId}`,
      { quantity }
    );
  },
  
  async removeItem(itemId: string): Promise<Cart> {
    return apiService.delete<Cart>(`/customer/cart/items/${itemId}`);
  },
  
  async clearCart(): Promise<void> {
    await apiService.delete('/customer/cart');
  },
};
```

---

## Routing

### React Router Setup

**`src/routes/AppRouter.tsx`:**
```typescript
import { FC, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isAuthenticatedSelector, userRoleSelector } from '../stores/auth.atom';
import { Layout } from '../components/layout/Layout';
import { HomePage } from '../features/home/HomePage';
import { ProductListingPage } from '../features/catalog/ProductListingPage';
import { ProductDetailPage } from '../features/catalog/ProductDetailPage';
import { CartPage } from '../features/cart/CartPage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { CheckoutPage } from '../features/checkout/CheckoutPage';
import { OrderHistoryPage } from '../features/orders/OrderHistoryPage';
import { ManagerDashboard } from '../features/manager/ManagerDashboard';
import { AdminDashboard } from '../features/admin/AdminDashboard';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const ManagerRoute: FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);
  const role = useRecoilValue(userRoleSelector);
  
  if (!isAuthenticated || (role !== 'MANAGER' && role !== 'ADMIN')) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute: FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);
  const role = useRecoilValue(userRoleSelector);
  
  if (!isAuthenticated || role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductListingPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route
            path="checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="orders"
            element={
              <PrivateRoute>
                <OrderHistoryPage />
              </PrivateRoute>
            }
          />
          
          {/* Manager routes */}
          <Route
            path="manager/*"
            element={
              <ManagerRoute>
                <ManagerDashboard />
              </ManagerRoute>
            }
          />
          
          {/* Admin routes */}
          <Route
            path="admin/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
```

---

## Forms

### React Hook Form with Zod

**Installation:**
```bash
npm install react-hook-form @hookform/resolvers zod
```

**Example Form:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Box,
  Stack,
  Alert,
} from '@mui/material';

const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  street: z.string().min(1, 'Street address is required'),
  apartment: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().regex(/^\d{5}$/, 'Invalid ZIP code'),
  country: z.string().default('US'),
  phone: z.string().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  defaultValues?: Partial<AddressFormData>;
}

export const AddressForm: FC<AddressFormProps> = ({
  onSubmit,
  defaultValues,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });
  
  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <TextField
          label="First Name"
          {...register('firstName')}
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
          fullWidth
        />
        <TextField
          label="Last Name"
          {...register('lastName')}
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
          fullWidth
        />
        <TextField
          label="Street Address"
          {...register('street')}
          error={!!errors.street}
          helperText={errors.street?.message}
          fullWidth
        />
        <TextField
          label="Apartment/Unit (Optional)"
          {...register('apartment')}
          error={!!errors.apartment}
          helperText={errors.apartment?.message}
          fullWidth
        />
        <TextField
          label="City"
          {...register('city')}
          error={!!errors.city}
          helperText={errors.city?.message}
          fullWidth
        />
        <TextField
          label="State"
          {...register('state')}
          error={!!errors.state}
          helperText={errors.state?.message}
          fullWidth
        />
        <TextField
          label="ZIP Code"
          {...register('zipCode')}
          error={!!errors.zipCode}
          helperText={errors.zipCode?.message}
          fullWidth
        />
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Continue'}
        </Button>
      </Stack>
    </Box>
  );
};
```

---

## Styling

### MUI Styling Options

**1. sx Prop (Recommended):**
```typescript
<Box
  sx={{
    padding: 2,
    backgroundColor: 'primary.main',
    color: 'white',
    borderRadius: 2,
    '&:hover': {
      backgroundColor: 'primary.dark',
    },
    [theme.breakpoints.down('sm')]: {
      padding: 1,
    },
  }}
>
  Content
</Box>
```

**2. styled Components:**
```typescript
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  transition: theme.transitions.create(['box-shadow'], {
    duration: theme.transitions.duration.short,
  }),
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));
```

**3. CSS Modules:**
```typescript
import styles from './ProductCard.module.css';

<div className={styles.card}>
  <div className={styles.title}>Product Name</div>
</div>
```

---

## Building and Deployment

### Development

```bash
npm run dev
# Runs on http://localhost:5173
```

### Production Build

```bash
npm run build
# Output: dist/
```

### Vite Configuration

**`vite.config.ts`:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
});
```

---

## Best Practices

### DO

- ✅ Use TypeScript strictly
- ✅ Use Recoil for global state
- ✅ Use React Hook Form for forms
- ✅ Use MUI components consistently
- ✅ Create custom hooks for reusable logic
- ✅ Use Day.js for all date operations
- ✅ Handle loading and error states
- ✅ Use React.memo for expensive components
- ✅ Lazy load routes
- ✅ Validate forms with Zod
- ✅ Use proper TypeScript types
- ✅ Handle errors gracefully

### DON'T

- ❌ Use useState for global state
- ❌ Mix date libraries (use Day.js only)
- ❌ Hardcode styles (use theme)
- ❌ Skip error handling
- ❌ Ignore TypeScript errors
- ❌ Use any types
- ❌ Mutate state directly
- ❌ Skip loading states
- ❌ Create unnecessary re-renders
- ❌ Use class components (use functional components)
- ❌ Skip form validation

---

## Example: Complete Feature Implementation

**`src/features/cart/CartPage.tsx`:**
```typescript
import { FC, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Divider,
  Container,
  CircularProgress,
  Alert,
} from '@mui/material';
import { cartAtom, cartSubtotalSelector } from '../../stores/cart.atom';
import { useCart } from '../../hooks/useCart';
import { CartItem } from './components/CartItem';

export const CartPage: FC = () => {
  const cart = useRecoilValue(cartAtom);
  const subtotal = useRecoilValue(cartSubtotalSelector);
  const { loadCart, updateItem, removeItem } = useCart();
  
  useEffect(() => {
    loadCart();
  }, [loadCart]);
  
  if (!cart) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (cart.items.length === 0) {
    return (
      <Container>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button variant="contained" href="/products" sx={{ mt: 2 }}>
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Shopping Cart
        </Typography>
        
        <Stack spacing={2} sx={{ mt: 2 }}>
          {cart.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdate={(quantity) => updateItem(item.id, quantity)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
        </Stack>
        
        <Divider sx={{ my: 3 }} />
        
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Subtotal</Typography>
                <Typography variant="h6">
                  ${subtotal.toFixed(2)}
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                size="large" 
                fullWidth
                href="/checkout"
              >
                Proceed to Checkout
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};
```

---

This guide provides a complete foundation for building the SN Auto Parts frontend with React, MUI, TypeScript, Day.js, and Recoil. Follow the patterns and practices outlined here for consistent, maintainable code.

