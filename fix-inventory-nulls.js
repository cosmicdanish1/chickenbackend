const { Client } = require('pg');
require('dotenv').config();

async function fixInventoryNulls() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check for null item_name values
    const checkResult = await client.query(
      'SELECT id, item_type FROM inventory_items WHERE item_name IS NULL'
    );

    if (checkResult.rows.length === 0) {
      console.log('✅ No null item_name values found');
      return;
    }

    console.log(`⚠️  Found ${checkResult.rows.length} rows with null item_name`);

    // Update null values with a default based on item_type
    const updateResult = await client.query(`
      UPDATE inventory_items 
      SET item_name = CONCAT(item_type, ' Item')
      WHERE item_name IS NULL
    `);

    console.log(`✅ Updated ${updateResult.rowCount} rows`);

    // Verify the fix
    const verifyResult = await client.query(
      'SELECT COUNT(*) as count FROM inventory_items WHERE item_name IS NULL'
    );

    if (verifyResult.rows[0].count === '0') {
      console.log('✅ All item_name values are now populated');
    } else {
      console.log('⚠️  Still have null values');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

fixInventoryNulls()
  .then(() => {
    console.log('\n✅ Fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error.message);
    process.exit(1);
  });
