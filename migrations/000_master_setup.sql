-- Master Database Setup Script
-- This script creates all tables in the correct order with dependencies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS citext;

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS retailers CASCADE;
DROP TABLE IF EXISTS farmers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS vehicle_status CASCADE;
DROP TYPE IF EXISTS purchase_order_status CASCADE;
DROP TYPE IF EXISTS product_type CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS expense_category CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE vehicle_status AS ENUM ('active', 'inactive');
CREATE TYPE purchase_order_status AS ENUM ('pending', 'received', 'cancelled');
CREATE TYPE product_type AS ENUM ('eggs', 'meat', 'chicks', 'other');
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'partial');
CREATE TYPE expense_category AS ENUM ('feed', 'labor', 'medicine', 'utilities', 'equipment', 'maintenance', 'transportation', 'other');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'check', 'credit_card');

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email CITEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'manager',
    status user_status DEFAULT 'active',
    join_date DATE DEFAULT CURRENT_DATE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

COMMENT ON TABLE users IS 'System users with authentication';

-- ============================================
-- 2. VEHICLES TABLE
-- ============================================
CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    driver_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    owner_name VARCHAR(100),
    address TEXT,
    total_capacity DECIMAL(10,2),
    petrol_tank_capacity DECIMAL(10,2),
    mileage DECIMAL(10,2),
    join_date DATE DEFAULT CURRENT_DATE,
    status vehicle_status DEFAULT 'active',
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_vehicle_number ON vehicles(vehicle_number);

COMMENT ON TABLE vehicles IS 'Transportation vehicles';

-- ============================================
-- 3. FARMERS TABLE
-- ============================================
CREATE TABLE farmers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_farmers_name ON farmers(name);

COMMENT ON TABLE farmers IS 'Farmer suppliers';

-- ============================================
-- 4. RETAILERS TABLE
-- ============================================
CREATE TABLE retailers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_retailers_name ON retailers(name);

COMMENT ON TABLE retailers IS 'Retail customers';

-- ============================================
-- 5. PURCHASE ORDERS TABLE
-- ============================================
CREATE TABLE purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(100) NOT NULL,
    order_date DATE NOT NULL,
    due_date DATE,
    status purchase_order_status DEFAULT 'pending',
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_purchase_orders_order_number ON purchase_orders(order_number);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_order_date ON purchase_orders(order_date);

COMMENT ON TABLE purchase_orders IS 'Purchase orders from suppliers';

-- ============================================
-- 6. PURCHASE ORDER ITEMS TABLE
-- ============================================
CREATE TABLE purchase_order_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_cost DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_purchase_order_items_order_id ON purchase_order_items(purchase_order_id);

COMMENT ON TABLE purchase_order_items IS 'Line items for purchase orders';

-- ============================================
-- 7. SALES TABLE
-- ============================================
CREATE TABLE sales (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    sale_date DATE NOT NULL,
    product_type product_type NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50),
    unit_price DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    amount_received DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    retailer_id BIGINT REFERENCES retailers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sales_invoice_number ON sales(invoice_number);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_sales_product_type ON sales(product_type);
CREATE INDEX idx_sales_payment_status ON sales(payment_status);
CREATE INDEX idx_sales_retailer_id ON sales(retailer_id);

COMMENT ON TABLE sales IS 'Sales transactions';

-- ============================================
-- 8. EXPENSES TABLE
-- ============================================
CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    expense_date DATE NOT NULL,
    category expense_category NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method payment_method NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_payment_method ON expenses(payment_method);

COMMENT ON TABLE expenses IS 'Business expenses';

-- ============================================
-- 9. INVENTORY ITEMS TABLE
-- ============================================
CREATE TABLE inventory_items (
    id BIGSERIAL PRIMARY KEY,
    item_type VARCHAR(50) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    minimum_stock_level DECIMAL(10,2) NOT NULL DEFAULT 0,
    current_stock_level DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_items_item_type ON inventory_items(item_type);
CREATE INDEX idx_inventory_items_item_name ON inventory_items(item_name);

COMMENT ON TABLE inventory_items IS 'Inventory stock management';

-- ============================================
-- 10. SETTINGS TABLE
-- ============================================
CREATE TABLE settings (
    id BIGSERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);

COMMENT ON TABLE settings IS 'System settings and configuration';

-- ============================================
-- 11. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    user_email VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX idx_audit_logs_entity_entity_id ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);

COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions';

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Default admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, status) VALUES
    ('Admin User', 'admin@azizpoultry.com', '$2b$10$YourHashedPasswordHere', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- Default settings
INSERT INTO settings (key, value, category, description) VALUES
    ('currency', 'INR', 'general', 'System currency'),
    ('theme', 'light', 'appearance', 'UI theme (light/dark)'),
    ('company_name', 'Aziz Poultry', 'company', 'Company name'),
    ('company_email', '', 'company', 'Company email address'),
    ('company_phone', '', 'company', 'Company phone number'),
    ('company_address', '', 'company', 'Company address')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- List all tables
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'farmers', COUNT(*) FROM farmers
UNION ALL
SELECT 'retailers', COUNT(*) FROM retailers
UNION ALL
SELECT 'purchase_orders', COUNT(*) FROM purchase_orders
UNION ALL
SELECT 'purchase_order_items', COUNT(*) FROM purchase_order_items
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'settings', COUNT(*) FROM settings
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- Show all indexes
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

COMMENT ON SCHEMA public IS 'Poultry Management System Database - All tables created successfully';
