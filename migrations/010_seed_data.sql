-- ============================================
-- SEED DATA SCRIPT
-- Populates all tables with sample data (10 records each)
-- Checks for existing data before inserting
-- ============================================

-- ============================================
-- 1. USERS (Check and Insert)
-- ============================================
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM users) < 2 THEN
        INSERT INTO users (name, email, password_hash, role, status, join_date) VALUES
            ('Admin User', 'admin@azizpoultry.com', '$2b$10$YourHashedPasswordHere', 'admin', 'active', '2024-01-01'),
            ('Manager John', 'john@azizpoultry.com', '$2b$10$YourHashedPasswordHere', 'manager', 'active', '2024-01-15'),
            ('Manager Sarah', 'sarah@azizpoultry.com', '$2b$10$YourHashedPasswordHere', 'manager', 'active', '2024-02-01'),
            ('Staff Mike', 'mike@azizpoultry.com', '$2b$10$YourHashedPasswordHere', 'staff', 'active', '2024-02-15'),
            ('Staff Lisa', 'lisa@azizpoultry.com', '$2b$10$YourHashedPasswordHere', 'staff', 'active', '2024-03-01'),
            ('Staff Tom', 'tom@azizpoultry.com', '$2b$10$YourHashedPasswordHere', 'staff', 'active', '2024-03-15'),
            ('Manager Emma', 'emma@azizpoultry.com', '$2b$10$YourHashedPasswordHere', 'manager', 'active', '2024-04-01'),
            ('Staff David', 'david@azizpoultry.com', '$2b$10$YourHashedPasswordHere', 'staff', 'inactive', '2024-04-15'),
            ('Staff Anna', 'anna@azizpoultry.com', '$2b$10$YourHashedPasswordHere', 'staff', 'active', '2024-05-01'),
            ('Manager Robert', 'robert@azizpoultry.com', '$2b$10$YourHashedPasswordHere', 'manager', 'active', '2024-05-15')
        ON CONFLICT (email) DO NOTHING;
        RAISE NOTICE 'Users seeded successfully';
    ELSE
        RAISE NOTICE 'Users table already has data, skipping...';
    END IF;
END $$;

-- ============================================
-- 2. VEHICLES (Check and Insert)
-- ============================================
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM vehicles) = 0 THEN
        INSERT INTO vehicles (vehicle_number, vehicle_type, driver_name, phone, owner_name, address, total_capacity, petrol_tank_capacity, mileage, join_date, status, note) VALUES
            ('MH-12-AB-1234', 'Truck', 'Rajesh Kumar', '9876543210', 'Aziz Poultry', 'Mumbai, Maharashtra', 5000.00, 200.00, 12.50, '2024-01-01', 'active', 'Main delivery truck'),
            ('MH-12-CD-5678', 'Van', 'Suresh Patil', '9876543211', 'Aziz Poultry', 'Mumbai, Maharashtra', 2000.00, 80.00, 15.00, '2024-01-15', 'active', 'Local delivery van'),
            ('MH-12-EF-9012', 'Truck', 'Amit Shah', '9876543212', 'Aziz Poultry', 'Mumbai, Maharashtra', 5000.00, 200.00, 11.80, '2024-02-01', 'active', 'Long distance truck'),
            ('MH-12-GH-3456', 'Pickup', 'Vijay Singh', '9876543213', 'Aziz Poultry', 'Mumbai, Maharashtra', 1000.00, 60.00, 18.00, '2024-02-15', 'active', 'Small pickup for urgent deliveries'),
            ('MH-12-IJ-7890', 'Van', 'Prakash Joshi', '9876543214', 'Aziz Poultry', 'Mumbai, Maharashtra', 2000.00, 80.00, 14.50, '2024-03-01', 'active', 'Backup delivery van'),
            ('MH-12-KL-2345', 'Truck', 'Ramesh Yadav', '9876543215', 'Aziz Poultry', 'Mumbai, Maharashtra', 5000.00, 200.00, 12.00, '2024-03-15', 'inactive', 'Under maintenance'),
            ('MH-12-MN-6789', 'Van', 'Santosh More', '9876543216', 'Aziz Poultry', 'Mumbai, Maharashtra', 2000.00, 80.00, 15.50, '2024-04-01', 'active', 'City delivery van'),
            ('MH-12-OP-0123', 'Truck', 'Ganesh Pawar', '9876543217', 'Aziz Poultry', 'Mumbai, Maharashtra', 5000.00, 200.00, 11.50, '2024-04-15', 'active', 'Heavy duty truck'),
            ('MH-12-QR-4567', 'Pickup', 'Mahesh Desai', '9876543218', 'Aziz Poultry', 'Mumbai, Maharashtra', 1000.00, 60.00, 17.50, '2024-05-01', 'active', 'Quick delivery pickup'),
            ('MH-12-ST-8901', 'Van', 'Dinesh Kulkarni', '9876543219', 'Aziz Poultry', 'Mumbai, Maharashtra', 2000.00, 80.00, 14.00, '2024-05-15', 'active', 'Regional delivery van');
        RAISE NOTICE 'Vehicles seeded successfully';
    ELSE
        RAISE NOTICE 'Vehicles table already has data, skipping...';
    END IF;
END $$;

-- ============================================
-- 3. FARMERS (Check and Insert)
-- ============================================
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM farmers) = 0 THEN
        INSERT INTO farmers (name, phone, email, address, notes) VALUES
            ('Ramesh Farm', '9123456780', 'ramesh@farm.com', 'Village Shirdi, Ahmednagar, Maharashtra', 'Supplies 5000 eggs weekly'),
            ('Krishna Poultry', '9123456781', 'krishna@poultry.com', 'Village Nashik, Maharashtra', 'Premium quality eggs'),
            ('Ganesh Farms', '9123456782', 'ganesh@farms.com', 'Village Pune, Maharashtra', 'Organic chicken supplier'),
            ('Shiva Poultry', '9123456783', 'shiva@poultry.com', 'Village Satara, Maharashtra', 'Large scale egg producer'),
            ('Lakshmi Farms', '9123456784', 'lakshmi@farms.com', 'Village Kolhapur, Maharashtra', 'Meat chicken specialist'),
            ('Durga Poultry', '9123456785', 'durga@poultry.com', 'Village Sangli, Maharashtra', 'Mixed poultry products'),
            ('Saraswati Farms', '9123456786', 'saraswati@farms.com', 'Village Solapur, Maharashtra', 'Chick supplier'),
            ('Hanuman Poultry', '9123456787', 'hanuman@poultry.com', 'Village Aurangabad, Maharashtra', 'Reliable egg supplier'),
            ('Parvati Farms', '9123456788', 'parvati@farms.com', 'Village Jalgaon, Maharashtra', 'Quality meat supplier'),
            ('Vishnu Poultry', '9123456789', 'vishnu@poultry.com', 'Village Dhule, Maharashtra', 'Bulk egg supplier');
        RAISE NOTICE 'Farmers seeded successfully';
    ELSE
        RAISE NOTICE 'Farmers table already has data, skipping...';
    END IF;
END $$;

-- ============================================
-- 4. RETAILERS (Check and Insert)
-- ============================================
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM retailers) = 0 THEN
        INSERT INTO retailers (name, owner_name, phone, email, address, notes) VALUES
            ('Fresh Mart', 'Sunil Patil', '9234567890', 'sunil@freshmart.com', 'Shop 1, Market Road, Mumbai', 'Weekly orders of 2000 eggs'),
            ('City Supermarket', 'Anil Kumar', 'contact@citysupermarket.com', '9234567891', 'Main Street, Mumbai', 'Large retail chain'),
            ('Quick Stop', 'Rajesh Sharma', '9234567892', 'rajesh@quickstop.com', 'Station Road, Mumbai', 'Daily fresh eggs'),
            ('Green Grocers', 'Priya Desai', '9234567893', 'priya@greengrocers.com', 'Market Square, Mumbai', 'Organic products focus'),
            ('Daily Needs', 'Amit Joshi', '9234567894', 'amit@dailyneeds.com', 'Colony Road, Mumbai', 'Neighborhood store'),
            ('Super Bazaar', 'Vijay Mehta', '9234567895', 'vijay@superbazaar.com', 'Shopping Complex, Mumbai', 'Bulk buyer'),
            ('Fresh Foods', 'Neha Singh', '9234567896', 'neha@freshfoods.com', 'Food Street, Mumbai', 'Premium quality focus'),
            ('Corner Store', 'Rahul Verma', '9234567897', 'rahul@cornerstore.com', 'Corner Plaza, Mumbai', 'Small retail outlet'),
            ('Mega Mart', 'Sanjay Gupta', '9234567898', 'sanjay@megamart.com', 'Highway Road, Mumbai', 'Large format store'),
            ('Local Bazaar', 'Pooja Nair', '9234567899', 'pooja@localbazaar.com', 'Local Market, Mumbai', 'Community store');
        RAISE NOTICE 'Retailers seeded successfully';
    ELSE
        RAISE NOTICE 'Retailers table already has data, skipping...';
    END IF;
END $$;

-- ============================================
-- 5. PURCHASE ORDERS (Check and Insert)
-- ============================================
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM purchase_orders) = 0 THEN
        INSERT INTO purchase_orders (order_number, supplier_name, order_date, due_date, status, total_amount, notes) VALUES
            ('PO-2024-001', 'Feed Suppliers Ltd', '2024-01-05', '2024-01-15', 'received', 50000.00, 'Monthly feed order'),
            ('PO-2024-002', 'Medicine Distributors', '2024-01-10', '2024-01-20', 'received', 15000.00, 'Vaccination supplies'),
            ('PO-2024-003', 'Equipment Co', '2024-01-15', '2024-01-25', 'received', 75000.00, 'New cages and feeders'),
            ('PO-2024-004', 'Feed Suppliers Ltd', '2024-02-05', '2024-02-15', 'received', 52000.00, 'Monthly feed order'),
            ('PO-2024-005', 'Packaging Materials', '2024-02-10', '2024-02-20', 'received', 8000.00, 'Egg cartons and boxes'),
            ('PO-2024-006', 'Feed Suppliers Ltd', '2024-03-05', '2024-03-15', 'received', 51000.00, 'Monthly feed order'),
            ('PO-2024-007', 'Medicine Distributors', '2024-03-10', '2024-03-20', 'pending', 16000.00, 'Quarterly medicine stock'),
            ('PO-2024-008', 'Feed Suppliers Ltd', '2024-04-05', '2024-04-15', 'pending', 53000.00, 'Monthly feed order'),
            ('PO-2024-009', 'Cleaning Supplies', '2024-04-10', '2024-04-20', 'pending', 5000.00, 'Sanitization materials'),
            ('PO-2024-010', 'Equipment Co', '2024-04-15', '2024-04-25', 'pending', 25000.00, 'Maintenance parts');
        RAISE NOTICE 'Purchase orders seeded successfully';
    ELSE
        RAISE NOTICE 'Purchase orders table already has data, skipping...';
    END IF;
END $$;

-- ============================================
-- 6. PURCHASE ORDER ITEMS (Check and Insert)
-- ============================================
DO $$
DECLARE
    po_id BIGINT;
BEGIN
    IF (SELECT COUNT(*) FROM purchase_order_items) = 0 THEN
        -- Get first purchase order ID
        SELECT id INTO po_id FROM purchase_orders ORDER BY id LIMIT 1;
        
        IF po_id IS NOT NULL THEN
            INSERT INTO purchase_order_items (purchase_order_id, description, quantity, unit, unit_cost, line_total) VALUES
                (po_id, 'Layer Feed - Premium', 1000.00, 'kg', 30.00, 30000.00),
                (po_id, 'Broiler Feed - Standard', 500.00, 'kg', 25.00, 12500.00),
                (po_id, 'Vitamin Supplements', 100.00, 'kg', 75.00, 7500.00);
            
            -- Get second purchase order ID
            SELECT id INTO po_id FROM purchase_orders ORDER BY id OFFSET 1 LIMIT 1;
            INSERT INTO purchase_order_items (purchase_order_id, description, quantity, unit, unit_cost, line_total) VALUES
                (po_id, 'Vaccination Doses', 500.00, 'doses', 20.00, 10000.00),
                (po_id, 'Antibiotics', 50.00, 'bottles', 100.00, 5000.00);
            
            RAISE NOTICE 'Purchase order items seeded successfully';
        END IF;
    ELSE
        RAISE NOTICE 'Purchase order items table already has data, skipping...';
    END IF;
END $$;

-- ============================================
-- 7. SALES (Check and Insert)
-- ============================================
DO $$
DECLARE
    retailer_id BIGINT;
BEGIN
    IF (SELECT COUNT(*) FROM sales) = 0 THEN
        -- Get first retailer ID
        SELECT id INTO retailer_id FROM retailers ORDER BY id LIMIT 1;
        
        INSERT INTO sales (invoice_number, customer_name, sale_date, product_type, quantity, unit, unit_price, total_amount, payment_status, amount_received, retailer_id, notes) VALUES
            ('INV-2024-001', 'Fresh Mart', '2024-01-05', 'eggs', 2000.00, 'pieces', 5.00, 10000.00, 'paid', 10000.00, retailer_id, 'Weekly order'),
            ('INV-2024-002', 'City Supermarket', '2024-01-06', 'eggs', 5000.00, 'pieces', 4.80, 24000.00, 'paid', 24000.00, retailer_id, 'Bulk order discount'),
            ('INV-2024-003', 'Quick Stop', '2024-01-07', 'eggs', 1000.00, 'pieces', 5.00, 5000.00, 'paid', 5000.00, retailer_id, 'Daily order'),
            ('INV-2024-004', 'Green Grocers', '2024-01-08', 'meat', 500.00, 'kg', 180.00, 90000.00, 'partial', 50000.00, retailer_id, 'Partial payment received'),
            ('INV-2024-005', 'Daily Needs', '2024-01-09', 'eggs', 1500.00, 'pieces', 5.00, 7500.00, 'paid', 7500.00, retailer_id, 'Regular customer'),
            ('INV-2024-006', 'Super Bazaar', '2024-01-10', 'eggs', 8000.00, 'pieces', 4.50, 36000.00, 'paid', 36000.00, retailer_id, 'Large order'),
            ('INV-2024-007', 'Fresh Foods', '2024-01-11', 'chicks', 200.00, 'pieces', 50.00, 10000.00, 'pending', 0.00, retailer_id, 'Payment due in 7 days'),
            ('INV-2024-008', 'Corner Store', '2024-01-12', 'eggs', 800.00, 'pieces', 5.00, 4000.00, 'paid', 4000.00, retailer_id, 'Small order'),
            ('INV-2024-009', 'Mega Mart', '2024-01-13', 'eggs', 10000.00, 'pieces', 4.30, 43000.00, 'paid', 43000.00, retailer_id, 'Premium customer'),
            ('INV-2024-010', 'Local Bazaar', '2024-01-14', 'meat', 300.00, 'kg', 180.00, 54000.00, 'partial', 30000.00, retailer_id, 'Balance pending');
        RAISE NOTICE 'Sales seeded successfully';
    ELSE
        RAISE NOTICE 'Sales table already has data, skipping...';
    END IF;
END $$;

-- ============================================
-- 8. EXPENSES (Check and Insert)
-- ============================================
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM expenses) = 0 THEN
        INSERT INTO expenses (expense_date, category, description, amount, payment_method, notes) VALUES
            ('2024-01-05', 'feed', 'Monthly feed purchase', 50000.00, 'bank_transfer', 'Regular supplier'),
            ('2024-01-10', 'labor', 'Staff salaries - January', 80000.00, 'bank_transfer', '8 employees'),
            ('2024-01-15', 'medicine', 'Vaccination and medicines', 15000.00, 'cash', 'Quarterly stock'),
            ('2024-01-20', 'utilities', 'Electricity bill', 12000.00, 'bank_transfer', 'Monthly bill'),
            ('2024-01-25', 'transportation', 'Fuel and maintenance', 8000.00, 'cash', 'Vehicle expenses'),
            ('2024-02-05', 'feed', 'Monthly feed purchase', 52000.00, 'bank_transfer', 'Price increase'),
            ('2024-02-10', 'equipment', 'New cages', 75000.00, 'check', 'Expansion'),
            ('2024-02-15', 'maintenance', 'Building repairs', 20000.00, 'cash', 'Roof fixing'),
            ('2024-02-20', 'utilities', 'Water bill', 3000.00, 'bank_transfer', 'Monthly bill'),
            ('2024-02-25', 'other', 'Office supplies', 5000.00, 'cash', 'Stationery and misc');
        RAISE NOTICE 'Expenses seeded successfully';
    ELSE
        RAISE NOTICE 'Expenses table already has data, skipping...';
    END IF;
END $$;

-- ============================================
-- 9. INVENTORY ITEMS (Check and Insert)
-- ============================================
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM inventory_items) = 0 THEN
        INSERT INTO inventory_items (item_type, item_name, quantity, unit, minimum_stock_level, current_stock_level, notes) VALUES
            ('feed', 'Layer Feed Premium', 5000.00, 'kg', 1000.00, 5000.00, 'Main feed for layers'),
            ('feed', 'Broiler Feed Standard', 3000.00, 'kg', 800.00, 3000.00, 'Standard broiler feed'),
            ('medicine', 'Vaccination Doses', 500.00, 'doses', 100.00, 500.00, 'Regular vaccination'),
            ('medicine', 'Antibiotics', 50.00, 'bottles', 10.00, 50.00, 'Emergency medicine'),
            ('equipment', 'Egg Cartons', 10000.00, 'pieces', 2000.00, 10000.00, 'Packaging material'),
            ('equipment', 'Feeding Trays', 200.00, 'pieces', 50.00, 200.00, 'Bird feeding equipment'),
            ('equipment', 'Water Dispensers', 150.00, 'pieces', 30.00, 150.00, 'Automatic water system'),
            ('supplies', 'Cleaning Solution', 100.00, 'liters', 20.00, 100.00, 'Sanitization'),
            ('supplies', 'Disinfectant', 80.00, 'liters', 15.00, 80.00, 'Disease prevention'),
            ('other', 'Spare Parts', 50.00, 'pieces', 10.00, 50.00, 'Equipment maintenance');
        RAISE NOTICE 'Inventory items seeded successfully';
    ELSE
        RAISE NOTICE 'Inventory items table already has data, skipping...';
    END IF;
END $$;

-- ============================================
-- 10. SETTINGS (Check and Insert)
-- ============================================
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM settings WHERE category = 'general') < 2 THEN
        INSERT INTO settings (key, value, category, description) VALUES
            ('currency', 'INR', 'general', 'System currency'),
            ('theme', 'light', 'appearance', 'UI theme (light/dark)'),
            ('company_name', 'Aziz Poultry', 'company', 'Company name'),
            ('company_email', 'info@azizpoultry.com', 'company', 'Company email address'),
            ('company_phone', '+91-9876543210', 'company', 'Company phone number'),
            ('company_address', 'Mumbai, Maharashtra, India', 'company', 'Company address'),
            ('tax_rate', '18', 'financial', 'GST tax rate percentage'),
            ('low_stock_threshold', '100', 'inventory', 'Low stock alert threshold'),
            ('date_format', 'DD/MM/YYYY', 'general', 'Date display format'),
            ('language', 'en', 'general', 'System language')
        ON CONFLICT (key) DO NOTHING;
        RAISE NOTICE 'Settings seeded successfully';
    ELSE
        RAISE NOTICE 'Settings table already has data, skipping...';
    END IF;
END $$;

-- ============================================
-- VERIFICATION - Count all records
-- ============================================
SELECT 
    'users' as table_name, 
    COUNT(*) as record_count,
    CASE WHEN COUNT(*) >= 10 THEN '✓' ELSE '✗' END as status
FROM users
UNION ALL
SELECT 'vehicles', COUNT(*), CASE WHEN COUNT(*) >= 10 THEN '✓' ELSE '✗' END FROM vehicles
UNION ALL
SELECT 'farmers', COUNT(*), CASE WHEN COUNT(*) >= 10 THEN '✓' ELSE '✗' END FROM farmers
UNION ALL
SELECT 'retailers', COUNT(*), CASE WHEN COUNT(*) >= 10 THEN '✓' ELSE '✗' END FROM retailers
UNION ALL
SELECT 'purchase_orders', COUNT(*), CASE WHEN COUNT(*) >= 10 THEN '✓' ELSE '✗' END FROM purchase_orders
UNION ALL
SELECT 'purchase_order_items', COUNT(*), CASE WHEN COUNT(*) >= 5 THEN '✓' ELSE '✗' END FROM purchase_order_items
UNION ALL
SELECT 'sales', COUNT(*), CASE WHEN COUNT(*) >= 10 THEN '✓' ELSE '✗' END FROM sales
UNION ALL
SELECT 'expenses', COUNT(*), CASE WHEN COUNT(*) >= 10 THEN '✓' ELSE '✗' END FROM expenses
UNION ALL
SELECT 'inventory_items', COUNT(*), CASE WHEN COUNT(*) >= 10 THEN '✓' ELSE '✗' END FROM inventory_items
UNION ALL
SELECT 'settings', COUNT(*), CASE WHEN COUNT(*) >= 6 THEN '✓' ELSE '✗' END FROM settings
ORDER BY table_name;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEED DATA SCRIPT COMPLETED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All tables have been populated with sample data';
    RAISE NOTICE 'Check the verification results above';
END $$;
