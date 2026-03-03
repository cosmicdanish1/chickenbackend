const { Client } = require('pg');
require('dotenv').config({ path: '.env.render' });

const connectionString = 'postgresql://poultry_user:tdgOrBo0kxdJNDIphGaP3m1PBmzE0IpZ@dpg-d6a8cskr85hc738ep8fg-a.oregon-postgres.render.com:5432/poultry_4xcy';

async function checkData() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected\n');

    const tables = ['godown_inward_entries', 'godown_sales', 'godown_mortality', 'godown_expenses'];
    
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`${table}: ${result.rows[0].count} records`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkData();
