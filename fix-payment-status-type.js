const { Client } = require('pg');
require('dotenv').config({ path: '.env.render' });

async function fixPaymentStatusType() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Drop the old type with CASCADE to remove dependencies
    console.log('Dropping old payment_status_type_old...');
    await client.query('DROP TYPE IF EXISTS payment_status_type_old CASCADE');
    
    console.log('✓ Successfully dropped old type');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

fixPaymentStatusType();
