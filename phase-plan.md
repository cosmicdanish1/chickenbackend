## Poultry Management System – Backend Phase Plan

This document tracks backend implementation progress by phases. Use the checkboxes to mark items as they are completed.

Legend:
- ✅ = completed
- ☐ = pending / not started

---

### Phase 0 – Architecture Design

High-level backend and data architecture, DB design, environment configuration, and basic health checks.

- ✅ **Backend tech stack decided**
  - NestJS, TypeScript, PostgreSQL, TypeORM, ConfigModule, class-validator
- ✅ **Database schema**
  - `poultry` PostgreSQL database
  - All core tables defined in `schema.sql` and documented in `db-schema.md`
- ✅ **Backend project skeleton**
  - NestJS app in `backend/` (`main.ts`, `app.module.ts`, `tsconfig*`, `package.json`)
- ✅ **Configuration & environment**
  - `.env.example` with `PORT`, `API_PREFIX`, DB settings, and `FRONTEND_ORIGIN`
  - `ConfigModule` wired globally
- ✅ **API base & CORS**
  - Global prefix from `API_PREFIX` (e.g. `api/v1`)
  - CORS enabled for frontend origin (`http://localhost:3002`)
- ✅ **Validation & error handling foundation**
  - Global `ValidationPipe` with whitelist & transform
- ✅ **Health check endpoint**
  - `GET /api/v1/health` → `{ "status": "ok" }`
- ✅ **Seed data for testing**
  - `seed.sql` with fake data for vehicles, farmers, retailers, inventory_items, expenses
- ☐ **Architecture overview doc**
  - Optional diagram / markdown explaining layers, modules, and data flow in more depth

---

### Phase 1 – Authentication, Users, and Master Data

#### 1. Authentication & Authorization

- ✅ **Auth module structure**
  - `auth` module (controller, service, DTOs)
- ✅ **Login & JWT**
  - Email/password login using `users` table
  - JWT access token using env JWT secret & expiry
- ✅ **Roles & guards**
  - JWT auth guard and role-based guard scaffolding
  - Ready to apply to protected routes
- ☐ **Session / token management**
  - Refresh token flow (to be added later if needed)

#### 2. User Management

- ✅ **Users entity & repository integration**
  - TypeORM entity mapped to `users` table
- ✅ **Users module**
  - CRUD endpoints for users (create, list, get, update, deactivate)
- ✅ **Role & status handling**
  - Fields: name, role, status, join_date, last_login
- ✅ **Seed admin user**
  - Admin user with real hashed password aligned with login requirements

#### 3. Master Data Management

##### 3.1 Farmers

- ✅ **Farmers entity**
  - TypeORM entity mapped to `farmers` table
- ✅ **Farmers module**
  - CRUD endpoints
- ✅ **Seed farmers**
  - Sample farmers in `seed.sql`

##### 3.2 Retailers

- ✅ **Retailers entity**
  - TypeORM entity mapped to `retailers` table
- ✅ **Retailers module**
  - CRUD endpoints
- ✅ **Seed retailers**
  - Sample retailers in `seed.sql`

##### 3.3 Vehicles

- ✅ **Vehicles entity**
  - `Vehicle` entity mapped to `vehicles` table
- ✅ **Vehicles module**
  - CRUD endpoints under `/vehicles`
- ✅ **DTOs & validation**
  - Create/update DTOs with class-validator
- ✅ **Seed vehicles**
  - Sample vehicles in `seed.sql`
- ☐ **Frontend integration**
  - Replace localStorage in Vehicles page with real API calls

---

### Phase 2 – Core Operations (Purchases, Sales, Godown, Mortality)

#### 4. Purchase Order Management

- ✅ **Entities**
  - `purchase_orders` and `purchase_order_items` entities
- ✅ **Purchases module**
  - CRUD endpoints for purchase orders & line items
- ✅ **Business rules**
  - Status transitions (pending/received/cancelled)
  - Automatic totals calculation
- ✅ **Date-range filtering API**
  - Query params for date range, supplier, status

#### 5. Sales Order Management

- ✅ **Sales entity**
  - Entity mapped to `sales` table
- ✅ **Sales module**
  - CRUD endpoints for sales
- ✅ **Business rules**
  - Invoice numbering, payment status, totals, amount_received
- ✅ **Date-range filtering API**
  - Query params for date range, customer, product_type, payment_status

#### 6. Godown Management

- ☐ **Schema design**
  - Tables for godowns/locations and stock per godown
- ☐ **Godown module**
  - CRUD endpoints and movement of stock between godowns

#### 7. Mortality

- ☐ **Schema design**
  - Mortality records linked to batches/inventory
- ☐ **Mortality module**
  - Endpoints to record and report mortalities

---

### Phase 3 – Dashboard, Expenses, Reports, Settings, Audit

#### 8. Dashboard

- ✅ **Dashboard aggregate APIs**
  - KPIs: total birds, revenue MTD, expenses MTD, profit MTD
  - Revenue trends, expense breakdown endpoints

#### 9. Expense Management

- ✅ **Expenses entity**
  - Entity mapped to `expenses` table
- ✅ **Expenses module**
  - CRUD endpoints with category & payment method
- ✅ **Seed expenses**
  - Basic expenses in `seed.sql`
- ✅ **Date-range & category filter**
  - API to support UI filters and charts

#### 10. Report Generation

- ☐ **Reporting APIs**
  - Financial summary, sales/expense reports
- ☐ **Exports**
  - CSV/Excel export endpoints (if required)

#### 11. Settings

- ☐ **Settings entity**
  - Entity mapped to `settings` table
- ☐ **Settings module**
  - Read/update settings like currency, theme, etc.

#### 12. Audit Logs

- ☐ **Audit schema**
  - Table(s) to track key actions (who, what, when)
- ☐ **Audit middleware/service**
  - Centralized logging for important operations
- ☐ **Audit query APIs**
  - Endpoints to fetch logs (with filters)

---

As we complete each backend task, we can update this file and tick the corresponding checkbox so you always have a clear view of phase-wise progress.

