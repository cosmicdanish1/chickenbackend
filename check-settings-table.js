const { Client } = require('pg');
require('dotenv').config();

async function checkSettings() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    
    // Check primary key
    const pkResult = await client.query(`
      SELECT constraint_name, column_name 
      FROM information_schema.key_column_usage 
      WHERE table_name='settings' 
      AND constraint_name LIKE '%pkey%'
    `);
    console.log('Primary key:', pkResult.rows);

    // Check data
    const dataResult = await client.query('SELECT * FROM settings LIMIT 5');
    console.log('\nSample data:');
    console.log(JSON.stringify(dataResult.rows, null, 2));

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSettings();
