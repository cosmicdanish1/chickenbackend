const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigration() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'poultry_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '010_add_status_to_farmers.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration: 010_add_status_to_farmers.sql');
    
    // Execute migration
    await client.query(migrationSQL);
    
    console.log('✓ Migration applied successfully');
    
    // Verify the column was added
    const result = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'farmers' AND column_name = 'status'
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ Status column verified:', result.rows[0]);
    }
    
    // Check existing farmers
    const farmersCount = await client.query('SELECT COUNT(*) FROM farmers');
    console.log(`✓ Total farmers in database: ${farmersCount.rows[0].count}`);
    
  } catch (error) {
    console.error('Error applying migration:', error);
    throw error;
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

applyMigration()
  .then(() => {
    console.log('\n✓ Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  });
