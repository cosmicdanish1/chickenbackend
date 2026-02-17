-- Database Verification Script
-- Run this to check if all tables and indexes are created correctly

\echo '========================================='
\echo 'POULTRY MANAGEMENT SYSTEM - DATABASE VERIFICATION'
\echo '========================================='
\echo ''

-- Check database connection
\echo 'Database Connection:'
SELECT current_database() as database_name, current_user as connected_as, version();
\echo ''

-- List all tables
\echo '========================================='
\echo '1. ALL TABLES IN DATABASE'
\echo '========================================='
SELECT 
    schemaname as schema,
    tablename as table_name,
    tableowner as owner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
\echo ''

-- Check if required tables exist
\echo '========================================='
\echo '2. REQUIRED TABLES CHECK'
\echo '========================================='
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') 
        THEN '✓ users' 
        ELSE '✗ users (MISSING)' 
    END as status
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'vehicles') 
        THEN '✓ vehicles' 
        ELSE '✗ vehicles (MISSING)' 
    END
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'farmers') 
        THEN '✓ farmers' 
        ELSE '✗ farmers (MISSING)' 
    END
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'retailers') 
        THEN '✓ retailers' 
        ELSE '✗ retailers (MISSING)' 
    END
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'purchase_orders') 
        THEN '✓ purchase_orders' 
        ELSE '✗ purchase_orders (MISSING)' 
    END
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'purchase_order_items') 
        THEN '✓ purchase_order_items' 
        ELSE '✗ purchase_order_items (MISSING)' 
    END
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'sales') 
        THEN '✓ sales' 
        ELSE '✗ sales (MISSING)' 
    END
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'expenses') 
        THEN '✓ expenses' 
        ELSE '✗ expenses (MISSING)' 
    END
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'inventory_items') 
        THEN '✓ inventory_items' 
        ELSE '✗ inventory_items (MISSING)' 
    END
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'settings') 
        THEN '✓ settings' 
        ELSE '✗ settings (MISSING)' 
    END
UNION ALL
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'audit_logs') 
        THEN '✓ audit_logs' 
        ELSE '✗ audit_logs (MISSING)' 
    END;
\echo ''

-- Count records in each table
\echo '========================================='
\echo '3. RECORD COUNTS'
\echo '========================================='
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
SELECT 'audit_logs', COUNT(*) FROM audit_logs
ORDER BY table_name;
\echo ''

-- Check indexes
\echo '========================================='
\echo '4. INDEXES COUNT BY TABLE'
\echo '========================================='
SELECT
    tablename as table_name,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
\echo ''

-- Check foreign keys
\echo '========================================='
\echo '5. FOREIGN KEY CONSTRAINTS'
\echo '========================================='
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
\echo ''

-- Check custom types
\echo '========================================='
\echo '6. CUSTOM ENUM TYPES'
\echo '========================================='
SELECT 
    t.typname as enum_name,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN (
    'user_role', 'user_status', 'vehicle_status', 
    'purchase_order_status', 'product_type', 
    'payment_status', 'expense_category', 'payment_method'
)
GROUP BY t.typname
ORDER BY t.typname;
\echo ''

-- Check table sizes
\echo '========================================='
\echo '7. TABLE SIZES'
\echo '========================================='
SELECT
    schemaname as schema,
    tablename as table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
\echo ''

-- Summary
\echo '========================================='
\echo '8. DATABASE SUMMARY'
\echo '========================================='
SELECT
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
    (SELECT COUNT(*) FROM information_schema.table_constraints 
     WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public') as total_foreign_keys,
    (SELECT COUNT(*) FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid) as total_enum_values;
\echo ''

\echo '========================================='
\echo 'VERIFICATION COMPLETE'
\echo '========================================='
