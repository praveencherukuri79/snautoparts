# 11. Development Workflow

Complete guide for local development setup and workflow practices.

## Local Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- PostgreSQL database (Neon recommended for cloud, or local Postgres)
- Git

### Initial Setup

1. **Clone Repository:**
   ```bash
   git clone <repository-url>
   cd snautoparts
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your configuration
   
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed database (optional)
   npm run db:seed
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   
   # Edit environment.ts with your API URL
   ```

### Environment Files

#### Backend `.env`

```env
DATABASE_URL="postgresql://user:password@host:5432/snautoparts"
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=debug
AUTH_SECRET="dev-secret-key-change-in-production"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@snautoparts.com"
FRONTEND_URL="http://localhost:4200"
```

#### Frontend `environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  stripePublishableKey: 'pk_test_...',
  enableMockData: false, // Set to true for UI development without backend
};
```

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# App runs on http://localhost:4200
```

### Using Mock Data

For frontend-only development:

1. Set `enableMockData: true` in `environment.ts`
2. Start only frontend:
   ```bash
   cd frontend
   npm start
   ```
3. All API calls will use mock data

---

## Database Workflow

### Creating Migrations

```bash
cd backend

# Make changes to schema.prisma
# Then create migration
npx prisma migrate dev --name descriptive_name

# Example
npx prisma migrate dev --name add_product_fitments
```

### Applying Migrations

```bash
# Development (creates migration and applies)
npx prisma migrate dev

# Production (applies existing migrations)
npx prisma migrate deploy
```

### Resetting Database

```bash
# WARNING: This deletes all data
npx prisma migrate reset

# With seed
npx prisma migrate reset --seed
```

### Viewing Database

```bash
# Open Prisma Studio (GUI)
npx prisma studio

# Opens in browser at http://localhost:5555
```

---

## Code Quality

### TypeScript

- Use strict mode (enabled in `tsconfig.json`)
- No `any` types
- Use proper type definitions
- Enable all strict checks

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Formatting

Use Prettier (if configured):

```bash
# Format all files
npx prettier --write .

# Check formatting
npx prettier --check .
```

---

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Messages

Use conventional commits:

```
feat: add product search functionality
fix: resolve cart quantity update issue
docs: update API documentation
refactor: reorganize route handlers
test: add unit tests for cart service
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push to remote
4. Create pull request
5. Code review
6. Merge to `develop`
7. Deploy to staging
8. Merge to `main` for production

---

## Testing Workflow

### Backend Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm test
```

### E2E Testing (if configured)

```bash
cd frontend
npm run e2e
```

---

## Debugging

### Backend Debugging

**VS Code Launch Configuration:**

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

**Using Node Inspector:**

```bash
node --inspect dist/index.js
```

### Frontend Debugging

- Use browser DevTools
- Angular DevTools extension
- Source maps enabled in development

---

## Common Development Tasks

### Adding a New Feature

1. **Backend:**
   - Create route file in appropriate folder
   - Add Zod schema for validation
   - Implement route handler
   - Add to route index
   - Test with API client

2. **Frontend:**
   - Create component files
   - Add service method
   - Add route configuration
   - Update content file if needed
   - Test in browser

### Adding a New Database Table

1. Update `schema.prisma`
2. Create migration:
   ```bash
   npx prisma migrate dev --name add_new_table
   ```
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
4. Use in code

### Adding a New API Endpoint

1. Create/update Zod schema
2. Add route handler
3. Register route
4. Test endpoint
5. Update API documentation

---

## Mock Data Development

### When to Use Mock Data

- UI/UX development
- Frontend-only development
- Testing without backend
- Demo purposes

### Switching to Mock Data

1. Set `enableMockData: true` in `environment.ts`
2. Ensure mock data matches API response shapes
3. Start only frontend server

### Adding Mock Data

Edit `frontend/src/app/core/services/mock-data/index.ts`:

```typescript
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'TEST-001',
    name: 'Test Product',
    // ... full product object
  },
];
```

---

## Database Seeding

### Seed Script

Located at `backend/prisma/seed.ts`

### Running Seed

```bash
cd backend
npm run db:seed
```

### Custom Seeding

Edit `backend/prisma/seed.ts`:

```typescript
async function main() {
  // Create categories
  const category = await prisma.category.create({
    data: {
      name: 'Engine Parts',
      slug: 'engine-parts',
    },
  });
  
  // Create products
  await prisma.product.create({
    data: {
      sku: 'ENG-001',
      name: 'Oil Filter',
      slug: 'oil-filter',
      price: 19.99,
      categoryId: category.id,
    },
  });
}
```

---

## Hot Reload

### Backend Hot Reload

Uses `tsx` or `ts-node-dev` for development:

```bash
npm run dev
# Automatically restarts on file changes
```

### Frontend Hot Reload

Angular CLI provides hot reload:

```bash
npm start
# Automatically reloads on file changes
```

---

## Code Organization

### File Naming Conventions

- Components: `kebab-case.component.ts`
- Services: `kebab-case.service.ts`
- Routes: `kebab-case.routes.ts`
- Models: `kebab-case.model.ts`

### Import Organization

```typescript
// 1. Angular core
import { Component, inject } from '@angular/core';

// 2. Angular common
import { CommonModule } from '@angular/common';

// 3. Third-party
import { Observable } from 'rxjs';

// 4. Application
import { CartService } from '../core/services/cart.service';
```

---

## Performance Considerations

### Development

- Use mock data for faster iteration
- Disable source maps in production builds
- Use lazy loading for routes

### Production

- Enable AOT compilation
- Minify and compress assets
- Use production builds
- Enable caching

---

## Troubleshooting Development Issues

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Backend
lsof -i :4200  # Frontend

# Kill process
kill -9 <PID>
```

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is running
- Verify network connectivity
- Check firewall rules

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client Issues

```bash
# Regenerate Prisma client
npx prisma generate
```

---

## Best Practices

### DO

- ✅ Keep commits small and focused
- ✅ Write descriptive commit messages
- ✅ Test locally before pushing
- ✅ Use feature branches
- ✅ Keep dependencies updated
- ✅ Document complex logic
- ✅ Use TypeScript strictly
- ✅ Follow code style guidelines

### DON'T

- ❌ Commit sensitive data (.env files)
- ❌ Push directly to main branch
- ❌ Skip testing
- ❌ Ignore TypeScript errors
- ❌ Hardcode configuration
- ❌ Commit generated files
- ❌ Skip code reviews
- ❌ Use `any` types

---

**Next:** [12. Troubleshooting](12-troubleshooting.md) | [Back to Index](README.md)

