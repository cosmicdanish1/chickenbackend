// Quick database check script
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function checkDatabase() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Port: ${process.env.DB_PORT}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USERNAME}`);
    console.log('');

    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Check tables
    console.log('📊 Checking tables...\n');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log(`Found ${tablesResult.rows.length} tables:\n`);
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    console.log('');

    // Count records in each table
    console.log('📈 Counting records in each table...\n');
    
    const tables = [
      'users', 'vehicles', 'farmers', 'retailers', 
      'purchase_orders', 'purchase_order_items', 
      'sales', 'expenses', 'inventory_items', 
      'settings', 'audit_logs'
    ];

    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0].count;
        const status = count > 0 ? '✅' : '⚠️';
        console.log(`   ${status} ${table.padEnd(25)} ${count} records`);
      } catch (err) {
        console.log(`   ❌ ${table.padEnd(25)} Table not found`);
      }
    }
    console.log('');

    // Check sample data from users
    console.log('👤 Sample users:\n');
    const usersResult = await client.query(`
      SELECT id, name, email, role, status 
      FROM users 
      LIMIT 5
    `);
    
    if (usersResult.rows.length > 0) {
      usersResult.rows.forEach(user => {
        console.log(`   ${user.id}. ${user.name} (${user.email}) - ${user.role} - ${user.status}`);
      });
    } else {
      console.log('   No users found');
    }
    console.log('');

    // Check sample data from vehicles
    console.log('🚗 Sample vehicles:\n');
    const vehiclesResult = await client.query(`
      SELECT id, vehicle_number, vehicle_type, driver_name, status 
      FROM vehicles 
      LIMIT 5
    `);
    
    if (vehiclesResult.rows.length > 0) {
      vehiclesResult.rows.forEach(vehicle => {
        console.log(`   ${vehicle.id}. ${vehicle.vehicle_number} - ${vehicle.vehicle_type} (${vehicle.driver_name}) - ${vehicle.status}`);
      });
    } else {
      console.log('   No vehicles found');
    }
    console.log('');

    // Check sample data from farmers
    console.log('🌾 Sample farmers:\n');
    const farmersResult = await client.query(`
      SELECT id, name, phone, email 
      FROM farmers 
      LIMIT 5
    `);
    
    if (farmersResult.rows.length > 0) {
      farmersResult.rows.forEach(farmer => {
        console.log(`   ${farmer.id}. ${farmer.name} - ${farmer.phone || 'N/A'}`);
      });
    } else {
      console.log('   No farmers found');
    }
    console.log('');

    // Check sample data from retailers
    console.log('🏪 Sample retailers:\n');
    const retailersResult = await client.query(`
      SELECT id, name, owner_name, phone 
      FROM retailers 
      LIMIT 5
    `);
    
    if (retailersResult.rows.length > 0) {
      retailersResult.rows.forEach(retailer => {
        console.log(`   ${retailer.id}. ${retailer.name} (${retailer.owner_name || 'N/A'}) - ${retailer.phone || 'N/A'}`);
      });
    } else {
      console.log('   No retailers found');
    }
    console.log('');

    // Check sample data from sales
    console.log('💰 Sample sales:\n');
    const salesResult = await client.query(`
      SELECT id, invoice_number, customer_name, sale_date, total_amount, payment_status 
      FROM sales 
      LIMIT 5
    `);
    
    if (salesResult.rows.length > 0) {
      salesResult.rows.forEach(sale => {
        console.log(`   ${sale.id}. ${sale.invoice_number} - ${sale.customer_name} - ₹${sale.total_amount} (${sale.payment_status})`);
      });
    } else {
      console.log('   No sales found');
    }
    console.log('');

    // Check settings
    console.log('⚙️ System settings:\n');
    const settingsResult = await client.query(`
      SELECT key, value, category 
      FROM settings 
      ORDER BY category, key
    `);
    
    if (settingsResult.rows.length > 0) {
      settingsResult.rows.forEach(setting => {
        console.log(`   ${setting.key.padEnd(20)} = ${setting.value.padEnd(30)} [${setting.category || 'general'}]`);
      });
    } else {
      console.log('   No settings found');
    }
    console.log('');

    console.log('✅ Database check complete!\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('\nDetails:', err);
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
}

checkDatabase();
