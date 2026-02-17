const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runFix() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'poultry',
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Reading fix script...');
    const sqlScript = fs.readFileSync(path.join(__dirname, 'fix-typeorm-metadata.sql'), 'utf8');
    
    console.log('Executing fix script...');
    await client.query(sqlScript);
    
    console.log('✅ Database fix completed successfully!');
    
    // Verify the typeorm_metadata table exists
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'typeorm_metadata'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ typeorm_metadata table created successfully');
    } else {
      console.log('❌ typeorm_metadata table was not created');
    }
    
  } catch (error) {
    console.error('❌ Error running fix:', error.message);
  } finally {
    await client.end();
  }
}

runFix();