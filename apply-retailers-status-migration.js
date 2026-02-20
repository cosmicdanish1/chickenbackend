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
    const migrationPath = path.join(__dirname, 'migrations', '011_add_status_to_retailers.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying migration: 011_add_status_to_retailers.sql');
    
    // Execute migration
    await client.query(migrationSQL);
    
    console.log('✓ Migration applied successfully');
    
    // Verify the column was added
    const result = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'retailers' AND column_name = 'status'
    `);
    
    if (result.rows.length > 0) {
      console.log('✓ Status column verified:', result.rows[0]);
    }
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✓ Status column already exists');
    } else {
      console.error('Error applying migration:', error);
      throw error;
    }
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
