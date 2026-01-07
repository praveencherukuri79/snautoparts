# Shared Types & Interfaces Setup for Angular 19 + Node.js

### **No root package.json --- Simple Shared Folder Architecture**

This guide explains how to create a **shared TypeScript types/interfaces
layer** used by both:

-   **Angular 19 frontend**
-   **Node.js backend (Fastify / Express / Nest etc.)**

Without: - workspaces\
- npm linking\
- publishing\
- root package.json

Only **TypeScript path mapping**.

------------------------------------------------------------------------

# 📁 Final Folder Structure

    root/
      frontend/
        tsconfig.json
        tsconfig.app.json
      backend/
        tsconfig.json
      shared/
        tsconfig.json
        src/
          index.ts
          user.types.ts
          product.types.ts
          api-response.types.ts

------------------------------------------------------------------------

# 1. Configure `shared/`

## `shared/tsconfig.json`

``` json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

## Example: `shared/src/index.ts`

``` ts
export * from './user.types';
export * from './product.types';
export * from './api-response.types';
```

------------------------------------------------------------------------

# 2. Example Shared Types (detailed)

## `user.types.ts`

``` ts
export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export type UserRole = 'admin' | 'manager' | 'customer';

export interface AuthTokenPayload {
  userId: string;
  role: UserRole;
  exp: number;
}
```

------------------------------------------------------------------------

## `product.types.ts`

``` ts
export interface ProductDto {
  id: string;
  title: string;
  description: string;
  price: number;
  sku: string;
  stockQty: number;
  images: string[];
  category: string;
}

export type ProductCategory =
  | 'engine'
  | 'transmission'
  | 'brakes'
  | 'suspension'
  | 'accessories';
```

------------------------------------------------------------------------

## `api-response.types.ts`

``` ts
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

------------------------------------------------------------------------

# 3. Configure Angular (Frontend)

### Modify `frontend/tsconfig.json` (root)

``` json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@shared/*": ["../shared/src/*"]
    }
  }
}
```

### If Angular uses `tsconfig.app.json` also update it:

`frontend/tsconfig.app.json`:

``` json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": []
  },
  "exclude": [
    "**/*.spec.ts"
  ]
}
```

(Angular will automatically inherit `paths` from the root config.)

------------------------------------------------------------------------

# 4. Using Shared Types in Angular

``` ts
import { UserDto, ProductDto, ApiResponse } from '@shared/index';

loadUser(): Observable<ApiResponse<UserDto>> {
  return this.http.get<ApiResponse<UserDto>>('/api/user');
}
```

------------------------------------------------------------------------

# 5. Configure Backend

`backend/tsconfig.json`:

``` json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@shared/*": ["../shared/src/*"]
    }
  }
}
```

------------------------------------------------------------------------

# 6. Using Shared Types in Backend

### Example in Node.js (Fastify)

``` ts
import { UserDto, ApiResponse } from '@shared/index';

export async function getUserHandler(): Promise<ApiResponse<UserDto>> {
  return {
    success: true,
    data: {
      id: 'u123',
      email: 'test@example.com',
      displayName: 'John',
      role: 'customer',
      createdAt: new Date().toISOString()
    }
  };
}
```

------------------------------------------------------------------------

# 7. Example End‑to‑End Type Safety

### Shared type:

``` ts
export interface CreateOrderDto {
  userId: string;
  productId: string;
  qty: number;
}
```

### Backend:

``` ts
import { CreateOrderDto } from '@shared/index';

fastify.post('/orders', async (req, res) => {
  const body = req.body as CreateOrderDto;

  // body.qty is strongly typed
});
```

### Angular:

``` ts
import { CreateOrderDto } from '@shared/index';

const payload: CreateOrderDto = {
  userId: 'u1',
  productId: 'p1',
  qty: 3
};

this.http.post('/orders', payload);
```

✔ No mismatch\
✔ Perfect type safety\
✔ No duplication

------------------------------------------------------------------------

# 8. Build Notes

### Shared types don't need to be built for dev

Both apps import raw `.ts` files.

### If you need `.d.ts` for CI or packaging:

    cd shared
    tsc -p tsconfig.json

------------------------------------------------------------------------

# 9. Summary

### **Use `shared/` folder + TS paths:**

-   No root package
-   No npm linking
-   No publishing
-   No workspaces\
-   Angular + Node share types instantly

### **Import everywhere using:**

    @shared/...

### **Put all interfaces/types inside:**

    shared/src/*.ts

This is the cleanest setup for Angular + Node monorepo with separate
folders.

------------------------------------------------------------------------

If you want, I can also add: ✔ Versioning strategy\
✔ API DTO folder structure\
✔ Auto‑generated API clients\
✔ Zod schemas synced between FE & BE\
✔ Shared enums, error codes, constants
