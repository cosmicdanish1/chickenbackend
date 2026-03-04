const { Client } = require('pg');
require('dotenv').config();

async function verifyData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    const tables = [
      'farmers',
      'retailers',
      'vehicles',
      'purchase_orders',
      'sales',
      'expenses',
      'inventory_items',
      'godown_inward_entries',
      'godown_sales',
      'godown_mortality',
      'godown_expenses'
    ];

    console.log('📊 Data Verification:\n');
    
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      const count = parseInt(result.rows[0].count);
      console.log(`  ${table.padEnd(25)} ${count} records`);
    }

    console.log('\n✅ All data verified!\n');

    // Show sample data
    console.log('📋 Sample Farmers:');
    const farmers = await client.query('SELECT name, phone, status FROM farmers LIMIT 3');
    farmers.rows.forEach(f => console.log(`  - ${f.name} (${f.phone}) - ${f.status}`));

    console.log('\n📋 Sample Retailers:');
    const retailers = await client.query('SELECT name, owner_name, phone FROM retailers LIMIT 3');
    retailers.rows.forEach(r => console.log(`  - ${r.name} - Owner: ${r.owner_name} (${r.phone})`));

    console.log('\n📋 Sample Purchase Orders:');
    const purchases = await client.query('SELECT order_number, supplier_name, total_amount, status FROM purchase_orders LIMIT 3');
    purchases.rows.forEach(p => console.log(`  - ${p.order_number}: ${p.supplier_name} - ₹${p.total_amount} (${p.status})`));

    console.log('\n📋 Sample Sales:');
    const sales = await client.query('SELECT invoice_number, customer_name, total_amount, payment_status FROM sales LIMIT 3');
    sales.rows.forEach(s => console.log(`  - ${s.invoice_number}: ${s.customer_name} - ₹${s.total_amount} (${s.payment_status})`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyData();
