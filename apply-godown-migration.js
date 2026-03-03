const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.render' });

const connectionString = 'postgresql://poultry_user:tdgOrBo0kxdJNDIphGaP3m1PBmzE0IpZ@dpg-d6a8cskr85hc738ep8fg-a.oregon-postgres.render.com:5432/poultry_4xcy';

async function applyMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const sql = fs.readFileSync(path.join(__dirname, 'database', 'add-godown-tables.sql'), 'utf8');
    
    await client.query(sql);
    console.log('✅ Godown tables migration applied successfully');

    // Check tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'godown%'
      ORDER BY table_name
    `);
    
    console.log('\n📊 Godown tables:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
