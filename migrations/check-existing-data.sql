-- ============================================
-- CHECK EXISTING DATA SCRIPT
-- Checks all tables for existing data
-- ============================================

\echo '========================================';
\echo 'CHECKING EXISTING DATA IN ALL TABLES';
\echo '========================================';
\echo '';

-- Check each table and show count
\echo 'Table: users';
SELECT COUNT(*) as count FROM users;
SELECT id, name, email, role, status FROM users LIMIT 5;
\echo '';

\echo 'Table: vehicles';
SELECT COUNT(*) as count FROM vehicles;
SELECT id, vehicle_number, vehicle_type, driver_name, status FROM vehicles LIMIT 5;
\echo '';

\echo 'Table: farmers';
SELECT COUNT(*) as count FROM farmers;
SELECT id, name, phone, email FROM farmers LIMIT 5;
\echo '';

\echo 'Table: retailers';
SELECT COUNT(*) as count FROM retailers;
SELECT id, name, owner_name, phone FROM retailers LIMIT 5;
\echo '';

\echo 'Table: purchase_orders';
SELECT COUNT(*) as count FROM purchase_orders;
SELECT id, order_number, supplier_name, order_date, status, total_amount FROM purchase_orders LIMIT 5;
\echo '';

\echo 'Table: purchase_order_items';
SELECT COUNT(*) as count FROM purchase_order_items;
SELECT id, purchase_order_id, description, quantity, unit_cost FROM purchase_order_items LIMIT 5;
\echo '';

\echo 'Table: sales';
SELECT COUNT(*) as count FROM sales;
SELECT id, invoice_number, customer_name, sale_date, product_type, total_amount FROM sales LIMIT 5;
\echo '';

\echo 'Table: expenses';
SELECT COUNT(*) as count FROM expenses;
SELECT id, expense_date, category, description, amount FROM expenses LIMIT 5;
\echo '';

\echo 'Table: inventory_items';
SELECT COUNT(*) as count FROM inventory_items;
SELECT id, item_type, item_name, quantity, unit FROM inventory_items LIMIT 5;
\echo '';

\echo 'Table: settings';
SELECT COUNT(*) as count FROM settings;
SELECT id, key, value, category FROM settings LIMIT 10;
\echo '';

\echo 'Table: audit_logs';
SELECT COUNT(*) as count FROM audit_logs;
SELECT id, user_email, action, entity, created_at FROM audit_logs LIMIT 5;
\echo '';

\echo '========================================';
\echo 'SUMMARY OF ALL TABLES';
\echo '========================================';

SELECT 
    'users' as table_name, 
    COUNT(*) as record_count
FROM users
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

\echo '';
\echo 'Check complete!';
