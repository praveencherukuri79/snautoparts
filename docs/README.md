# SN Auto Parts - Complete Documentation

Welcome to the comprehensive documentation for the SN Auto Parts e-commerce application. This documentation covers all aspects of the system including features, architecture, database schema, API reference, user flows, and development guides.

## Documentation Index

### Getting Started
- **[01. Overview](01-overview.md)** - Application overview, tech stack, architecture summary, and key design decisions

### Core Documentation
- **[02. Features](02-features.md)** - Complete feature documentation for Customer, Manager, and Admin roles
- **[03. Database Schema](03-database.md)** - Complete database schema documentation with ERD diagrams
- **[04. Roles & Permissions](04-roles-permissions.md)** - Role definitions, permission matrix, and authorization details
- **[05. API Reference](05-api-reference.md)** - Complete API endpoint documentation with request/response schemas

### Architecture & Flows
- **[06. User Flows](06-user-flows.md)** - User flow diagrams for authentication, checkout, order processing, and management workflows
- **[07. Architecture](07-architecture.md)** - System architecture, frontend/backend structure, and data flow diagrams

### Development Guides
- **[08. Frontend Guide (Angular)](08-frontend-guide.md)** - Angular frontend development guide, component patterns, and styling approach
- **[React Frontend Guide](frontend_react/README.md)** - React frontend development guide with MUI, TypeScript, Day.js, and Recoil
- **[09. Backend Guide](09-backend-guide.md)** - Backend development guide, route patterns, and service architecture
- **[10. Deployment](10-deployment.md)** - Deployment instructions, environment setup, and configuration guide
- **[11. Development Workflow](11-development-workflow.md)** - Local setup, development practices, and workflow guidelines
- **[12. Troubleshooting](12-troubleshooting.md)** - Common issues, solutions, and debugging tips

## Quick Navigation

### By Role
- **Customer Features** → [02. Features](02-features.md#customer-features)
- **Manager Features** → [02. Features](02-features.md#manager-features)
- **Admin Features** → [02. Features](02-features.md#admin-features)

### By Topic
- **Database** → [03. Database Schema](03-database.md)
- **API Endpoints** → [05. API Reference](05-api-reference.md)
- **Authentication** → [04. Roles & Permissions](04-roles-permissions.md) | [06. User Flows](06-user-flows.md#authentication-flow)
- **Checkout Process** → [06. User Flows](06-user-flows.md#checkout-flow)
- **Order Management** → [06. User Flows](06-user-flows.md#order-fulfillment-flow)

### By Task
- **Setting up locally** → [11. Development Workflow](11-development-workflow.md)
- **Deploying to production** → [10. Deployment](10-deployment.md)
- **Understanding the architecture** → [07. Architecture](07-architecture.md)
- **Adding a new feature** → [08. Frontend Guide (Angular)](08-frontend-guide.md) | [React Frontend Guide](frontend_react/README.md) | [09. Backend Guide](09-backend-guide.md)
- **Troubleshooting issues** → [12. Troubleshooting](12-troubleshooting.md)

## Documentation Structure

This documentation is organized into 12 main sections:

1. **Overview** - High-level introduction to the application
2. **Features** - Detailed feature documentation organized by user role
3. **Database** - Complete schema documentation with diagrams
4. **Roles & Permissions** - Authorization and access control
5. **API Reference** - Complete API endpoint documentation
6. **User Flows** - Visual flow diagrams for key processes
7. **Architecture** - System architecture and design patterns
8. **Frontend Guide** - Frontend development practices
9. **Backend Guide** - Backend development practices
10. **Deployment** - Production deployment guide
11. **Development Workflow** - Local development setup and practices
12. **Troubleshooting** - Common issues and solutions

## Key Information

### Tech Stack
- **Frontend (Angular):** Angular (standalone APIs), Angular Signals, Angular Material, Tailwind CSS
- **Frontend (React):** React 18+, Material-UI (MUI), TypeScript, Day.js, Recoil
- **Backend:** Node.js, Fastify, TypeScript, Prisma, PostgreSQL (Neon)
- **External Services:** Stripe (payments), Resend (email)

### Key Principles
- Monolith architecture (no microservices)
- Standalone frontend and backend projects (no monorepo)
- No TanStack Query
- Angular Signals for state management
- Transaction-safe write operations
- Idempotent checkout process

## Contributing

When updating this documentation:
- Keep information accurate and up-to-date with code changes
- Use clear headings and consistent formatting
- Include code examples where helpful
- Update cross-references when moving content
- Add diagrams using Mermaid syntax for visual clarity

## Support

For questions or issues:
1. Check the [Troubleshooting Guide](12-troubleshooting.md)
2. Review relevant feature documentation
3. Check API reference for endpoint details
4. Review architecture documentation for system understanding

---

**Last Updated:** Documentation generated from codebase analysis

