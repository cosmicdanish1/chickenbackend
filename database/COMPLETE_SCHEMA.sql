-- Aziz Poultry Farm Management System - PostgreSQL Schema
-- This file creates the database, enum types, and all tables.

-- 1. Create database (run once; you may need superuser privileges)
CREATE DATABASE poultry;

-- After creating the database, connect to it before running the rest:
-- \c poultry

-- 2. Extensions (optional but recommended)
CREATE EXTENSION IF NOT EXISTS citext;

-- 3. Enum Types

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE user_status AS ENUM ('active', 'inactive');

CREATE TYPE purchase_status AS ENUM ('pending', 'received', 'cancelled');

CREATE TYPE sale_product_type AS ENUM ('eggs', 'meat', 'chicks', 'other');
CREATE TYPE payment_status_type AS ENUM ('paid', 'pending', 'partial');

CREATE TYPE expense_category_type AS ENUM (
  'feed',
  'labor',
  'medicine',
  'utilities',
  'equipment',
  'maintenance',
  'transportation',
  'other'
);

CREATE TYPE payment_method_type AS ENUM ('cash', 'bank_transfer', 'check', 'credit_card');

CREATE TYPE vehicle_status_type AS ENUM ('active', 'inactive');

-- 4. Tables

-- 4.1 users
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'manager',
  status        user_status NOT NULL DEFAULT 'active',
  join_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.2 inventory_items
CREATE TABLE inventory_items (
  id               BIGSERIAL PRIMARY KEY,
  name             VARCHAR(150) NOT NULL,
  item_type        VARCHAR(50),
  quantity         NUMERIC(14,2) NOT NULL DEFAULT 0,
  unit             VARCHAR(20) NOT NULL,
  min_stock_level  NUMERIC(14,2) NOT NULL DEFAULT 0,
  last_updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_items_last_updated_at ON inventory_items (last_updated_at);

-- 4.3 purchase_orders
CREATE TABLE purchase_orders (
  id           BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  supplier_name VARCHAR(150) NOT NULL,
  order_date   DATE NOT NULL,
  due_date     DATE,
  status       purchase_status NOT NULL DEFAULT 'pending',
  total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchase_orders_order_date ON purchase_orders (order_date);
CREATE INDEX idx_purchase_orders_status ON purchase_orders (status);

-- 4.4 purchase_order_items
CREATE TABLE purchase_order_items (
  id                BIGSERIAL PRIMARY KEY,
  purchase_order_id BIGINT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  description       TEXT NOT NULL,
  quantity          NUMERIC(14,2) NOT NULL,
  unit              VARCHAR(20) NOT NULL,
  unit_cost         NUMERIC(14,2) NOT NULL,
  line_total        NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED
);

CREATE INDEX idx_purchase_order_items_po_id ON purchase_order_items (purchase_order_id);

-- 4.5 sales
CREATE TABLE sales (
  id             BIGSERIAL PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  customer_name  VARCHAR(150) NOT NULL,
  sale_date      DATE NOT NULL,
  product_type   sale_product_type NOT NULL,
  quantity       NUMERIC(14,2) NOT NULL,
  unit           VARCHAR(20),
  unit_price     NUMERIC(14,2) NOT NULL,
  total_amount   NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  payment_status payment_status_type NOT NULL DEFAULT 'pending',
  amount_received NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes          TEXT,
  retailer_id    BIGINT REFERENCES retailers(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_sale_date ON sales (sale_date);
CREATE INDEX idx_sales_product_type ON sales (product_type);
CREATE INDEX idx_sales_payment_status ON sales (payment_status);

-- 4.6 expenses
CREATE TABLE expenses (
  id             BIGSERIAL PRIMARY KEY,
  expense_date   DATE NOT NULL,
  category       expense_category_type NOT NULL,
  description    TEXT NOT NULL,
  amount         NUMERIC(14,2) NOT NULL,
  payment_method payment_method_type NOT NULL,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_expense_date ON expenses (expense_date);
CREATE INDEX idx_expenses_category ON expenses (category);

-- 4.7 farmers
CREATE TABLE farmers (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  phone      VARCHAR(50),
  email      VARCHAR(150),
  address    TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.8 retailers
CREATE TABLE retailers (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  owner_name VARCHAR(150),
  phone      VARCHAR(50),
  email      VARCHAR(150),
  address    TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.9 vehicles
CREATE TABLE vehicles (
  id                  BIGSERIAL PRIMARY KEY,
  vehicle_number      VARCHAR(50) NOT NULL UNIQUE,
  vehicle_type        VARCHAR(50) NOT NULL,
  driver_name         VARCHAR(150) NOT NULL,
  phone               VARCHAR(50) NOT NULL,
  owner_name          VARCHAR(150),
  address             TEXT,
  total_capacity      INTEGER,
  petrol_tank_capacity NUMERIC(10,2),
  mileage             NUMERIC(10,2),
  join_date           DATE NOT NULL,
  status              vehicle_status_type NOT NULL DEFAULT 'active',
  note                TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.10 settings
CREATE TABLE settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Basic seed data (optional examples)

-- Default admin user (change password_hash to a real hash before using in production)
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin User', 'admin@azizpoultry.com', 'REPLACE_WITH_HASH', 'admin');

-- Default currency setting
INSERT INTO settings (key, value)
VALUES ('currency', 'INR');

