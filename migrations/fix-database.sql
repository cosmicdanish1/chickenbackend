-- ============================================
-- QUICK FIX SCRIPT
-- Fixes schema issues and prepares for seeding
-- ============================================

\echo '========================================';
\echo 'FIXING DATABASE SCHEMA';
\echo '========================================';
\echo '';

-- Fix 1: Add missing columns to settings table
\echo '1. Fixing settings table schema...';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS description TEXT;
\echo '   ✓ Settings table updated';
\echo '';

-- Fix 2: Create audit_logs table if it doesn't exist
\echo '2. Creating audit_logs table...';
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- Create indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_entity_id ON audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);

\echo '   ✓ Audit logs table created';
\echo '';

-- Verify tables exist
\echo '3. Verifying all tables...';
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('users', 'vehicles', 'farmers', 'retailers', 'purchase_orders', 
                           'purchase_order_items', 'sales', 'expenses', 'inventory_items', 
                           'settings', 'audit_logs') 
        THEN '✓'
        ELSE '?'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('users', 'vehicles', 'farmers', 'retailers', 'purchase_orders', 
                       'purchase_order_items', 'sales', 'expenses', 'inventory_items', 
                       'settings', 'audit_logs')
ORDER BY table_name;
\echo '';

\echo '========================================';
\echo 'SCHEMA FIXES COMPLETE';
\echo '========================================';
\echo '';
\echo 'Next step: Run seed data script';
\echo 'Command: psql -U postgres -d poultry -f migrations/010_seed_data.sql';
\echo '';
