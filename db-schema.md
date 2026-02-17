## Aziz Poultry Farm Management System – Database Design (PostgreSQL)

### 1. Overview

- **Database name**: `poultry`
- **RDBMS**: PostgreSQL
- **Purpose**: Replace current browser `localStorage` data with a normalized relational schema that supports all existing frontend modules.
- **ID strategy**: `BIGSERIAL` primary keys for most tables.
- **Timestamps**: Most tables include `created_at` and `updated_at` audit fields.

### 2. Module → Table Mapping

- **Authentication & Users**
  - `users`

- **Inventory Management**
  - `inventory_items`

- **Purchase Orders**
  - `purchase_orders`
  - `purchase_order_items`

- **Sales Tracking**
  - `sales`

- **Expenses**
  - `expenses`

- **Financial Reports**
  - Uses data from `sales`, `expenses`, `purchase_orders` (read‑only analytic queries)

- **Master Data**
  - `farmers`
  - `retailers`
  - `vehicles`

- **System Settings**
  - `settings`

### 3. Common Conventions

- **Currency**: All monetary amounts are stored as `NUMERIC(14,2)` in Indian Rupees (₹).
- **Dates**:
  - Operational dates (sale date, order date, etc.) use `DATE`.
  - Audit and technical timestamps use `TIMESTAMPTZ`.
- **Enums**: Implemented as PostgreSQL `ENUM` types for safety and consistency.

Defined enum types:

- `user_role`: `admin`, `manager`, `staff`
- `user_status`: `active`, `inactive`
- `purchase_status`: `pending`, `received`, `cancelled`
- `sale_product_type`: `eggs`, `meat`, `chicks`, `other`
- `payment_status_type`: `paid`, `pending`, `partial`
- `expense_category_type`: `feed`, `labor`, `medicine`, `utilities`, `equipment`, `maintenance`, `transportation`, `other`
- `payment_method_type`: `cash`, `bank_transfer`, `check`, `credit_card`
- `vehicle_status_type`: `active`, `inactive`

---

### 4. Table Definitions

#### 4.1 `users`

**Purpose**: Application login, role-based access, and admin user management.

**Columns**:
- `id BIGSERIAL PK` – Unique user identifier.
- `name VARCHAR(100) NOT NULL` – Display name.
- `email CITEXT NOT NULL UNIQUE` – Login email (case-insensitive).
- `password_hash TEXT NOT NULL` – Hashed password (e.g., bcrypt/argon2).
- `role user_role NOT NULL DEFAULT 'manager'` – `admin` / `manager` / `staff`.
- `status user_status NOT NULL DEFAULT 'active'` – Active/inactive flag.
- `join_date DATE NOT NULL DEFAULT CURRENT_DATE` – When the user joined.
- `last_login TIMESTAMPTZ` – Last login timestamp.
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

**Frontend mapping**:
- Users page shows `name`, `role`, `status`, `join_date`, `last_login` and derived statistics.
- Login screen uses `email`/`password_hash`.

---

#### 4.2 `inventory_items`

**Purpose**: Track birds, feed, and supplies inventory with low-stock alerts.

**Columns**:
- `id BIGSERIAL PK`
- `name VARCHAR(150) NOT NULL` – Item name (e.g., "Layer Birds Batch A", "Maize Feed").
- `item_type VARCHAR(50)` – Optional category: `birds`, `feed`, `supplies`, etc.
- `quantity NUMERIC(14,2) NOT NULL DEFAULT 0` – Current stock.
- `unit VARCHAR(20) NOT NULL` – e.g., `kg`, `bags`, `birds`.
- `min_stock_level NUMERIC(14,2) NOT NULL DEFAULT 0` – Threshold for low stock alerts.
- `last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` – For date-range filtering.
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

**Frontend mapping**:
- Inventory table: item type/name, quantity, unit, min stock, status (derived: low stock if `quantity <= min_stock_level`), last updated.
- Date-range filter uses `last_updated_at`.

---

#### 4.3 `purchase_orders`

**Purpose**: Manage supplier purchase orders and high-level PO stats.

**Columns**:
- `id BIGSERIAL PK`
- `order_number VARCHAR(50) NOT NULL UNIQUE` – e.g., `PO-0001`.
- `supplier_name VARCHAR(150) NOT NULL`
- `order_date DATE NOT NULL`
- `due_date DATE`
- `status purchase_status NOT NULL DEFAULT 'pending'`
- `total_amount NUMERIC(14,2) NOT NULL DEFAULT 0` – Sum of line items (redundant but optimized for reporting).
- `notes TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

**Frontend mapping**:
- Purchases page table: order #, supplier, order date, due date, amount (`total_amount`), status.
- Summary cards: total orders, pending orders, total value.
- Date filter uses `order_date`.

---

#### 4.4 `purchase_order_items`

**Purpose**: Line items belonging to purchase orders.

**Columns**:
- `id BIGSERIAL PK`
- `purchase_order_id BIGINT NOT NULL FK → purchase_orders.id ON DELETE CASCADE`
- `description TEXT NOT NULL` – Item description.
- `quantity NUMERIC(14,2) NOT NULL`
- `unit VARCHAR(20) NOT NULL`
- `unit_cost NUMERIC(14,2) NOT NULL`
- `line_total NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED`

**Frontend mapping**:
- Inside PO form: items list with description, quantity, unit cost; total order value is sum of `line_total`.

---

#### 4.5 `sales`

**Purpose**: Record all sales transactions and revenue.

**Columns**:
- `id BIGSERIAL PK`
- `invoice_number VARCHAR(50) NOT NULL UNIQUE` – e.g., `INV-0001`.
- `customer_name VARCHAR(150) NOT NULL`
- `sale_date DATE NOT NULL`
- `product_type sale_product_type NOT NULL` – `eggs`, `meat`, `chicks`, `other`.
- `quantity NUMERIC(14,2) NOT NULL`
- `unit VARCHAR(20)` – e.g., `tray`, `kg`, `birds`.
- `unit_price NUMERIC(14,2) NOT NULL`
- `total_amount NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED`
- `payment_status payment_status_type NOT NULL DEFAULT 'pending'`
- `amount_received NUMERIC(14,2) NOT NULL DEFAULT 0` – Supports partial payments.
- `notes TEXT`
- `retailer_id BIGINT NULL FK → retailers.id` – Optional link if customer is a retailer.
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

**Frontend mapping**:
- Sales table: invoice #, customer, date, product, quantity, amount, payment status.
- Summary cards: total sales count, total revenue (sum `total_amount`), amount received (sum `amount_received`).
- Date filter uses `sale_date`.

---

#### 4.6 `expenses`

**Purpose**: Track operational expenses with category and payment method.

**Columns**:
- `id BIGSERIAL PK`
- `expense_date DATE NOT NULL`
- `category expense_category_type NOT NULL`
- `description TEXT NOT NULL`
- `amount NUMERIC(14,2) NOT NULL`
- `payment_method payment_method_type NOT NULL`
- `notes TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

**Frontend mapping**:
- Expenses table and cards: date, category, description, amount, payment method.
- Category breakdown chart uses `category` and sum of `amount`.
- Recent expenses list uses `expense_date` and `amount`.
- Date filter uses `expense_date`.

---

#### 4.7 `farmers`

**Purpose**: Master data for farmers.

**Columns**:
- `id BIGSERIAL PK`
- `name VARCHAR(150) NOT NULL`
- `phone VARCHAR(50)`
- `email VARCHAR(150)`
- `address TEXT`
- `notes TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

**Frontend mapping**:
- Farmers page with CRUD for farmer records (name + contact info + notes).

---

#### 4.8 `retailers`

**Purpose**: Master data for retailers who buy products.

**Columns**:
- `id BIGSERIAL PK`
- `name VARCHAR(150) NOT NULL` – Retailer shop name.
- `owner_name VARCHAR(150)`
- `phone VARCHAR(50)`
- `email VARCHAR(150)`
- `address TEXT`
- `notes TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

**Frontend mapping**:
- Retailers page shows retailer info and purchase statistics (calculated via joins with `sales`).

---

#### 4.9 `vehicles`

**Purpose**: Track vehicles, drivers, capacity, and status.

**Columns**:
- `id BIGSERIAL PK`
- `vehicle_number VARCHAR(50) NOT NULL UNIQUE`
- `vehicle_type VARCHAR(50) NOT NULL` – e.g., `Truck`, `Mini Truck`, `Pickup Van`.
- `driver_name VARCHAR(150) NOT NULL`
- `phone VARCHAR(50) NOT NULL`
- `owner_name VARCHAR(150)`
- `address TEXT`
- `total_capacity INTEGER` – Total cage capacity.
- `petrol_tank_capacity NUMERIC(10,2)` – Liters.
- `mileage NUMERIC(10,2)` – km per liter.
- `join_date DATE NOT NULL`
- `status vehicle_status_type NOT NULL DEFAULT 'active'`
- `note TEXT`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

**Frontend mapping**:
- Vehicles list and dialogs use these fields exactly (vehicle number, type, driver, phone, owner, address, capacities, mileage, join date, status, notes).

---

#### 4.10 `settings`

**Purpose**: Store global configuration such as currency and theme.

**Columns**:
- `key TEXT PRIMARY KEY` – e.g., `currency`, `theme`, etc.
- `value TEXT NOT NULL` – Serialized value (string/JSON).
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

**Frontend mapping**:
- Settings page uses `currency` (INR by default) and can be extended for theme and other preferences.

---

### 5. How This Supports Frontend Features

- **Dashboard KPIs and charts**:
  - Use aggregates over `inventory_items`, `sales`, `expenses`, and `purchase_orders`.
- **Date-range filtering**:
  - Inventory: `last_updated_at`
  - Purchases: `order_date`
  - Sales: `sale_date`
  - Expenses: `expense_date`
- **Financial reports**:
  - Monthly revenue/expenses/profit: group `sales.total_amount` and `expenses.amount` by month.
  - Product performance: group `sales` by `product_type`.
  - Expense distribution: group `expenses` by `category`.
- **Master data & admin**:
  - Farmers/retailers/vehicles and users map 1:1 with the corresponding tables above.

This document is the source of truth for the initial PostgreSQL schema. The accompanying `schema.sql` file in the same `BackEnd` folder contains the exact `CREATE` statements that implement this design.

