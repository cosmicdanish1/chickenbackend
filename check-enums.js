const { Client } = require('pg');
require('dotenv').config();

async function checkEnums() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Check expense category enum
    const categoryResult = await client.query(`
      SELECT unnest(enum_range(NULL::expense_category_type))::text as category
    `);
    console.log('Valid expense categories:', categoryResult.rows.map(r => r.category));
    
    // Check payment method enum
    const paymentResult = await client.query(`
      SELECT unnest(enum_range(NULL::payment_method_type))::text as method
    `);
    console.log('Valid payment methods:', paymentResult.rows.map(r => r.method));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkEnums();
