const { Client } = require('pg');
require('dotenv').config();

async function checkFarmersStatus() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'poultry_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // Check if status column exists
    const columnCheck = await client.query(`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'farmers' AND column_name = 'status'
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('✓ Status column exists:');
      console.log(columnCheck.rows[0]);
    } else {
      console.log('✗ Status column does NOT exist');
    }
    
    console.log('\n--- Farmers Data ---');
    const farmers = await client.query('SELECT id, name, phone, status FROM farmers LIMIT 10');
    console.log(`Total farmers: ${farmers.rows.length}`);
    farmers.rows.forEach(farmer => {
      console.log(`ID: ${farmer.id}, Name: ${farmer.name}, Status: ${farmer.status || 'NULL'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkFarmersStatus();
