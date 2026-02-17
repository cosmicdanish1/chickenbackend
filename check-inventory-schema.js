const { Client } = require('pg');
require('dotenv').config();

async function checkInventorySchema() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'inventory_items'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table inventory_items does not exist');
      return;
    }

    console.log('✅ Table inventory_items exists\n');

    // Get all columns
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'inventory_items'
      ORDER BY ordinal_position;
    `);

    console.log('Current columns in inventory_items:');
    console.log('=====================================');
    columnsResult.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Check for data
    const countResult = await client.query('SELECT COUNT(*) as count FROM inventory_items');
    console.log(`\n📊 Total rows: ${countResult.rows[0].count}`);

    // Sample data
    if (parseInt(countResult.rows[0].count) > 0) {
      const sampleResult = await client.query('SELECT * FROM inventory_items LIMIT 3');
      console.log('\n📋 Sample data:');
      console.log(JSON.stringify(sampleResult.rows, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

checkInventorySchema()
  .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error.message);
    process.exit(1);
  });
