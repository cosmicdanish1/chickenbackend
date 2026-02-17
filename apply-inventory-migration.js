const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigration() {
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

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '011_align_inventory_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Applying migration: 011_align_inventory_schema.sql');
    console.log('=====================================\n');

    // Execute migration
    await client.query(migrationSQL);

    console.log('✅ Migration applied successfully\n');

    // Verify the changes
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'inventory_items'
      ORDER BY ordinal_position;
    `);

    console.log('Updated columns in inventory_items:');
    console.log('=====================================');
    columnsResult.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

applyMigration()
  .then(() => {
    console.log('\n✅ Migration completed successfully');
    console.log('\n🚀 You can now start the backend with: npm run start:dev');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  });
