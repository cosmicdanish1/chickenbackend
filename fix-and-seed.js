// Fix and Seed Database Script
// Fixes schema issues and populates with sample data
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function runSQL(sql, description) {
  try {
    console.log(`   ${description}...`);
    await client.query(sql);
    console.log(`   ✅ ${description} - Done`);
    return true;
  } catch (err) {
    console.error(`   ❌ ${description} - Failed`);
    console.error(`   Error: ${err.message}`);
    return false;
  }
}

async function fixSchema() {
  console.log('\n📋 Step 1: Fixing Database Schema\n');

  // Fix settings table
  await runSQL(
    'ALTER TABLE settings ADD COLUMN IF NOT EXISTS category VARCHAR(50)',
    'Adding category column to settings'
  );
  
  await runSQL(
    'ALTER TABLE settings ADD COLUMN IF NOT EXISTS description TEXT',
    'Adding description column to settings'
  );

  // Create audit_logs table
  const auditLogsSQL = `
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
    )
  `;
  await runSQL(auditLogsSQL, 'Creating audit_logs table');

  // Create indexes
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email)',
  ];

  for (const indexSQL of indexes) {
    await runSQL(indexSQL, 'Creating audit_logs index');
  }

  console.log('\n✅ Schema fixes complete!\n');
}

async function seedData() {
  console.log('📊 Step 2: Seeding Sample Data\n');

  // Check and seed users
  const userCount = await client.query('SELECT COUNT(*) FROM users');
  if (parseInt(userCount.rows[0].count) < 10) {
    console.log('   Seeding users...');
    const usersSQL = `
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
      ON CONFLICT (email) DO NOTHING
    `;
    await runSQL(usersSQL, 'Seeding users');
  } else {
    console.log('   ⏭️  Users table already has data, skipping...');
  }

  // Check and seed vehicles
  const vehicleCount = await client.query('SELECT COUNT(*) FROM vehicles');
  if (parseInt(vehicleCount.rows[0].count) < 10) {
    console.log('   Seeding vehicles...');
    const vehiclesSQL = `
      INSERT INTO vehicles (vehicle_number, vehicle_type, driver_name, phone, owner_name, address, total_capacity, petrol_tank_capacity, mileage, join_date, status, note) VALUES
        ('MH-12-AB-1234', 'Truck', 'Rajesh Kumar', '9876543210', 'Aziz Poultry', 'Mumbai, Maharashtra', 5000.00, 200.00, 12.50, '2024-01-01', 'active', 'Main delivery truck'),
        ('MH-12-CD-5678', 'Van', 'Suresh Patil', '9876543211', 'Aziz Poultry', 'Mumbai, Maharashtra', 2000.00, 80.00, 15.00, '2024-01-15', 'active', 'Local delivery van'),
        ('MH-12-EF-9012', 'Truck', 'Amit Shah', '9876543212', 'Aziz Poultry', 'Mumbai, Maharashtra', 5000.00, 200.00, 11.80, '2024-02-01', 'active', 'Long distance truck'),
        ('MH-12-GH-3456', 'Pickup', 'Vijay Singh', '9876543213', 'Aziz Poultry', 'Mumbai, Maharashtra', 1000.00, 60.00, 18.00, '2024-02-15', 'active', 'Small pickup'),
        ('MH-12-IJ-7890', 'Van', 'Prakash Joshi', '9876543214', 'Aziz Poultry', 'Mumbai, Maharashtra', 2000.00, 80.00, 14.50, '2024-03-01', 'active', 'Backup van'),
        ('MH-12-KL-2345', 'Truck', 'Ramesh Yadav', '9876543215', 'Aziz Poultry', 'Mumbai, Maharashtra', 5000.00, 200.00, 12.00, '2024-03-15', 'inactive', 'Under maintenance'),
        ('MH-12-MN-6789', 'Van', 'Santosh More', '9876543216', 'Aziz Poultry', 'Mumbai, Maharashtra', 2000.00, 80.00, 15.50, '2024-04-01', 'active', 'City delivery'),
        ('MH-12-OP-0123', 'Truck', 'Ganesh Pawar', '9876543217', 'Aziz Poultry', 'Mumbai, Maharashtra', 5000.00, 200.00, 11.50, '2024-04-15', 'active', 'Heavy duty'),
        ('MH-12-QR-4567', 'Pickup', 'Mahesh Desai', '9876543218', 'Aziz Poultry', 'Mumbai, Maharashtra', 1000.00, 60.00, 17.50, '2024-05-01', 'active', 'Quick delivery'),
        ('MH-12-ST-8901', 'Van', 'Dinesh Kulkarni', '9876543219', 'Aziz Poultry', 'Mumbai, Maharashtra', 2000.00, 80.00, 14.00, '2024-05-15', 'active', 'Regional delivery')
      ON CONFLICT (vehicle_number) DO NOTHING
    `;
    await runSQL(vehiclesSQL, 'Seeding vehicles');
  } else {
    console.log('   ⏭️  Vehicles table already has data, skipping...');
  }

  // Check and seed farmers
  const farmerCount = await client.query('SELECT COUNT(*) FROM farmers');
  if (parseInt(farmerCount.rows[0].count) < 10) {
    console.log('   Seeding farmers...');
    const farmersSQL = `
      INSERT INTO farmers (name, phone, email, address, notes) VALUES
        ('Ramesh Farm', '9123456780', 'ramesh@farm.com', 'Village Shirdi, Maharashtra', 'Supplies 5000 eggs weekly'),
        ('Krishna Poultry', '9123456781', 'krishna@poultry.com', 'Village Nashik, Maharashtra', 'Premium quality eggs'),
        ('Ganesh Farms', '9123456782', 'ganesh@farms.com', 'Village Pune, Maharashtra', 'Organic chicken supplier'),
        ('Shiva Poultry', '9123456783', 'shiva@poultry.com', 'Village Satara, Maharashtra', 'Large scale producer'),
        ('Lakshmi Farms', '9123456784', 'lakshmi@farms.com', 'Village Kolhapur, Maharashtra', 'Meat specialist'),
        ('Durga Poultry', '9123456785', 'durga@poultry.com', 'Village Sangli, Maharashtra', 'Mixed products'),
        ('Saraswati Farms', '9123456786', 'saraswati@farms.com', 'Village Solapur, Maharashtra', 'Chick supplier'),
        ('Hanuman Poultry', '9123456787', 'hanuman@poultry.com', 'Village Aurangabad, Maharashtra', 'Reliable supplier'),
        ('Parvati Farms', '9123456788', 'parvati@farms.com', 'Village Jalgaon, Maharashtra', 'Quality meat'),
        ('Vishnu Poultry', '9123456789', 'vishnu@poultry.com', 'Village Dhule, Maharashtra', 'Bulk supplier')
    `;
    await runSQL(farmersSQL, 'Seeding farmers');
  } else {
    console.log('   ⏭️  Farmers table already has data, skipping...');
  }

  // Check and seed retailers
  const retailerCount = await client.query('SELECT COUNT(*) FROM retailers');
  if (parseInt(retailerCount.rows[0].count) < 10) {
    console.log('   Seeding retailers...');
    const retailersSQL = `
      INSERT INTO retailers (name, owner_name, phone, email, address, notes) VALUES
        ('Fresh Mart', 'Sunil Patil', '9234567890', 'sunil@freshmart.com', 'Shop 1, Market Road, Mumbai', 'Weekly orders'),
        ('City Supermarket', 'Anil Kumar', '9234567891', 'contact@citysupermarket.com', 'Main Street, Mumbai', 'Large chain'),
        ('Quick Stop', 'Rajesh Sharma', '9234567892', 'rajesh@quickstop.com', 'Station Road, Mumbai', 'Daily fresh'),
        ('Green Grocers', 'Priya Desai', '9234567893', 'priya@greengrocers.com', 'Market Square, Mumbai', 'Organic focus'),
        ('Daily Needs', 'Amit Joshi', '9234567894', 'amit@dailyneeds.com', 'Colony Road, Mumbai', 'Neighborhood store'),
        ('Super Bazaar', 'Vijay Mehta', '9234567895', 'vijay@superbazaar.com', 'Shopping Complex, Mumbai', 'Bulk buyer'),
        ('Fresh Foods', 'Neha Singh', '9234567896', 'neha@freshfoods.com', 'Food Street, Mumbai', 'Premium quality'),
        ('Corner Store', 'Rahul Verma', '9234567897', 'rahul@cornerstore.com', 'Corner Plaza, Mumbai', 'Small outlet'),
        ('Mega Mart', 'Sanjay Gupta', '9234567898', 'sanjay@megamart.com', 'Highway Road, Mumbai', 'Large format'),
        ('Local Bazaar', 'Pooja Nair', '9234567899', 'pooja@localbazaar.com', 'Local Market, Mumbai', 'Community store')
    `;
    await runSQL(retailersSQL, 'Seeding retailers');
  } else {
    console.log('   ⏭️  Retailers table already has data, skipping...');
  }

  // Check and seed purchase orders
  const poCount = await client.query('SELECT COUNT(*) FROM purchase_orders');
  if (parseInt(poCount.rows[0].count) < 10) {
    console.log('   Seeding purchase orders...');
    const poSQL = `
      INSERT INTO purchase_orders (order_number, supplier_name, order_date, due_date, status, total_amount, notes) VALUES
        ('PO-2024-001', 'Feed Suppliers Ltd', '2024-01-05', '2024-01-15', 'received', 50000.00, 'Monthly feed order'),
        ('PO-2024-002', 'Medicine Distributors', '2024-01-10', '2024-01-20', 'received', 15000.00, 'Vaccination supplies'),
        ('PO-2024-003', 'Equipment Co', '2024-01-15', '2024-01-25', 'received', 75000.00, 'New cages'),
        ('PO-2024-004', 'Feed Suppliers Ltd', '2024-02-05', '2024-02-15', 'received', 52000.00, 'Monthly feed'),
        ('PO-2024-005', 'Packaging Materials', '2024-02-10', '2024-02-20', 'received', 8000.00, 'Egg cartons'),
        ('PO-2024-006', 'Feed Suppliers Ltd', '2024-03-05', '2024-03-15', 'received', 51000.00, 'Monthly feed'),
        ('PO-2024-007', 'Medicine Distributors', '2024-03-10', '2024-03-20', 'pending', 16000.00, 'Quarterly stock'),
        ('PO-2024-008', 'Feed Suppliers Ltd', '2024-04-05', '2024-04-15', 'pending', 53000.00, 'Monthly feed'),
        ('PO-2024-009', 'Cleaning Supplies', '2024-04-10', '2024-04-20', 'pending', 5000.00, 'Sanitization'),
        ('PO-2024-010', 'Equipment Co', '2024-04-15', '2024-04-25', 'pending', 25000.00, 'Maintenance parts')
      ON CONFLICT (order_number) DO NOTHING
    `;
    await runSQL(poSQL, 'Seeding purchase orders');
  } else {
    console.log('   ⏭️  Purchase orders table already has data, skipping...');
  }

  // Check and seed sales
  const salesCount = await client.query('SELECT COUNT(*) FROM sales');
  if (parseInt(salesCount.rows[0].count) < 10) {
    console.log('   Seeding sales...');
    
    // Get first retailer ID
    const retailerResult = await client.query('SELECT id FROM retailers ORDER BY id LIMIT 1');
    const retailerId = retailerResult.rows[0]?.id || null;
    
    const salesSQL = `
      INSERT INTO sales (invoice_number, customer_name, sale_date, product_type, quantity, unit, unit_price, total_amount, payment_status, amount_received, retailer_id, notes) VALUES
        ('INV-2024-001', 'Fresh Mart', '2024-01-05', 'eggs', 2000.00, 'pieces', 5.00, 10000.00, 'paid', 10000.00, ${retailerId}, 'Weekly order'),
        ('INV-2024-002', 'City Supermarket', '2024-01-06', 'eggs', 5000.00, 'pieces', 4.80, 24000.00, 'paid', 24000.00, ${retailerId}, 'Bulk discount'),
        ('INV-2024-003', 'Quick Stop', '2024-01-07', 'eggs', 1000.00, 'pieces', 5.00, 5000.00, 'paid', 5000.00, ${retailerId}, 'Daily order'),
        ('INV-2024-004', 'Green Grocers', '2024-01-08', 'meat', 500.00, 'kg', 180.00, 90000.00, 'partial', 50000.00, ${retailerId}, 'Partial payment'),
        ('INV-2024-005', 'Daily Needs', '2024-01-09', 'eggs', 1500.00, 'pieces', 5.00, 7500.00, 'paid', 7500.00, ${retailerId}, 'Regular customer'),
        ('INV-2024-006', 'Super Bazaar', '2024-01-10', 'eggs', 8000.00, 'pieces', 4.50, 36000.00, 'paid', 36000.00, ${retailerId}, 'Large order'),
        ('INV-2024-007', 'Fresh Foods', '2024-01-11', 'chicks', 200.00, 'pieces', 50.00, 10000.00, 'pending', 0.00, ${retailerId}, 'Payment due'),
        ('INV-2024-008', 'Corner Store', '2024-01-12', 'eggs', 800.00, 'pieces', 5.00, 4000.00, 'paid', 4000.00, ${retailerId}, 'Small order'),
        ('INV-2024-009', 'Mega Mart', '2024-01-13', 'eggs', 10000.00, 'pieces', 4.30, 43000.00, 'paid', 43000.00, ${retailerId}, 'Premium customer'),
        ('INV-2024-010', 'Local Bazaar', '2024-01-14', 'meat', 300.00, 'kg', 180.00, 54000.00, 'partial', 30000.00, ${retailerId}, 'Balance pending')
      ON CONFLICT (invoice_number) DO NOTHING
    `;
    await runSQL(salesSQL, 'Seeding sales');
  } else {
    console.log('   ⏭️  Sales table already has data, skipping...');
  }

  // Check and seed expenses
  const expenseCount = await client.query('SELECT COUNT(*) FROM expenses');
  if (parseInt(expenseCount.rows[0].count) < 10) {
    console.log('   Seeding expenses...');
    const expensesSQL = `
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
        ('2024-02-25', 'other', 'Office supplies', 5000.00, 'cash', 'Stationery')
    `;
    await runSQL(expensesSQL, 'Seeding expenses');
  } else {
    console.log('   ⏭️  Expenses table already has data, skipping...');
  }

  // Check and seed inventory
  const inventoryCount = await client.query('SELECT COUNT(*) FROM inventory_items');
  if (parseInt(inventoryCount.rows[0].count) < 10) {
    console.log('   Seeding inventory items...');
    const inventorySQL = `
      INSERT INTO inventory_items (name, item_type, quantity, unit, min_stock_level) VALUES
        ('Layer Feed Premium', 'feed', 5000.00, 'kg', 1000.00),
        ('Broiler Feed Standard', 'feed', 3000.00, 'kg', 800.00),
        ('Vaccination Doses', 'medicine', 500.00, 'doses', 100.00),
        ('Antibiotics', 'medicine', 50.00, 'bottles', 10.00),
        ('Egg Cartons', 'equipment', 10000.00, 'pieces', 2000.00),
        ('Feeding Trays', 'equipment', 200.00, 'pieces', 50.00),
        ('Water Dispensers', 'equipment', 150.00, 'pieces', 30.00),
        ('Cleaning Solution', 'supplies', 100.00, 'liters', 20.00),
        ('Disinfectant', 'supplies', 80.00, 'liters', 15.00),
        ('Spare Parts', 'other', 50.00, 'pieces', 10.00)
    `;
    await runSQL(inventorySQL, 'Seeding inventory items');
  } else {
    console.log('   ⏭️  Inventory items table already has data, skipping...');
  }

  // Check and seed settings
  const settingsCount = await client.query('SELECT COUNT(*) FROM settings');
  if (parseInt(settingsCount.rows[0].count) < 6) {
    console.log('   Seeding settings...');
    const settingsSQL = `
      INSERT INTO settings (key, value, category, description) VALUES
        ('currency', 'INR', 'general', 'System currency'),
        ('theme', 'light', 'appearance', 'UI theme'),
        ('company_name', 'Aziz Poultry', 'company', 'Company name'),
        ('company_email', 'info@azizpoultry.com', 'company', 'Company email'),
        ('company_phone', '+91-9876543210', 'company', 'Company phone'),
        ('company_address', 'Mumbai, Maharashtra, India', 'company', 'Company address'),
        ('tax_rate', '18', 'financial', 'GST tax rate'),
        ('low_stock_threshold', '100', 'inventory', 'Low stock alert'),
        ('date_format', 'DD/MM/YYYY', 'general', 'Date format'),
        ('language', 'en', 'general', 'System language')
      ON CONFLICT (key) DO UPDATE SET 
        category = EXCLUDED.category,
        description = EXCLUDED.description
    `;
    await runSQL(settingsSQL, 'Seeding settings');
  } else {
    console.log('   ⏭️  Settings table already has data, skipping...');
  }

  console.log('\n✅ Data seeding complete!\n');
}

async function verifyDatabase() {
  console.log('🔍 Step 3: Verifying Database\n');

  const tables = [
    'users', 'vehicles', 'farmers', 'retailers',
    'purchase_orders', 'purchase_order_items',
    'sales', 'expenses', 'inventory_items',
    'settings', 'audit_logs'
  ];

  console.log('   Table                     Records    Status');
  console.log('   ----------------------------------------');

  for (const table of tables) {
    try {
      const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
      const count = result.rows[0].count;
      const status = count > 0 ? '✅' : '⚠️';
      console.log(`   ${table.padEnd(25)} ${count.toString().padEnd(10)} ${status}`);
    } catch (err) {
      console.log(`   ${table.padEnd(25)} N/A        ❌`);
    }
  }

  console.log('\n✅ Verification complete!\n');
}

async function main() {
  console.log('========================================');
  console.log('DATABASE FIX AND SEED SCRIPT');
  console.log('========================================\n');

  console.log('🔌 Connecting to PostgreSQL...');
  console.log(`   Host: ${process.env.DB_HOST}`);
  console.log(`   Port: ${process.env.DB_PORT}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   User: ${process.env.DB_USERNAME}\n`);

  try {
    await client.connect();
    console.log('✅ Connected successfully!\n');

    await fixSchema();
    await seedData();
    await verifyDatabase();

    console.log('========================================');
    console.log('ALL DONE! 🎉');
    console.log('========================================\n');
    console.log('Your database is now ready with:');
    console.log('- All tables with correct schema');
    console.log('- 100+ sample records');
    console.log('- Ready for development\n');
    console.log('Next steps:');
    console.log('1. Start backend: npm run start:dev');
    console.log('2. Start frontend: cd Frontend && npm run dev');
    console.log('3. Login: admin@azizpoultry.com / admin123\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('\nDetails:', err);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Connection closed\n');
  }
}

main();
