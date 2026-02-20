const { Client } = require('pg');
require('dotenv').config();

// Local database config
const localConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'poultry',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
};

// Render database config
const renderConfig = {
  host: 'dpg-d6a8cskr85hc738ep8fg-a.oregon-postgres.render.com',
  port: 5432,
  database: 'poultry_4xcy',
  user: 'poultry_user',
  password: 'tdgOrBo0kxdJNDIphGaP3m1PBmzE0IpZ',
};

async function dumpAndRestore() {
  console.log('🔄 Starting database replication...\n');

  // Connect to local database
  const localClient = new Client(localConfig);
  await localClient.connect();
  console.log('✅ Connected to LOCAL database');

  // Connect to Render database
  const renderClient = new Client(renderConfig);
  await renderClient.connect();
  console.log('✅ Connected to RENDER database\n');

  try {
    // Get all table names
    const tablesResult = await localClient.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

    console.log(`📋 Found ${tablesResult.rows.length} tables to replicate\n`);

    for (const { tablename } of tablesResult.rows) {
      console.log(`📦 Replicating table: ${tablename}`);

      // Get table structure
      const createTableResult = await localClient.query(`
        SELECT 
          'CREATE TABLE IF NOT EXISTS ' || tablename || ' (' ||
          string_agg(column_name || ' ' || data_type || 
            CASE 
              WHEN character_maximum_length IS NOT NULL 
              THEN '(' || character_maximum_length || ')'
              ELSE ''
            END, ', ') || ');'
        FROM information_schema.columns
        WHERE table_name = $1
        GROUP BY tablename
      `, [tablename]);

      // Get all data
      const dataResult = await localClient.query(`SELECT * FROM ${tablename}`);
      
      if (dataResult.rows.length > 0) {
        console.log(`   → ${dataResult.rows.length} rows found`);

        // Clear existing data in Render
        await renderClient.query(`TRUNCATE TABLE ${tablename} CASCADE`);
        
        // Insert data
        for (const row of dataResult.rows) {
          const columns = Object.keys(row);
          const values = Object.values(row);
          const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
          
          const insertQuery = `
            INSERT INTO ${tablename} (${columns.join(', ')})
            VALUES (${placeholders})
            ON CONFLICT DO NOTHING
          `;
          
          await renderClient.query(insertQuery, values);
        }
        
        console.log(`   ✅ Copied ${dataResult.rows.length} rows\n`);
      } else {
        console.log(`   ⚠️  No data to copy\n`);
      }
    }

    console.log('🎉 Database replication completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await localClient.end();
    await renderClient.end();
  }
}

dumpAndRestore()
  .then(() => {
    console.log('\n✅ All done! Your Render database is now a copy of your local database.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Replication failed:', error.message);
    process.exit(1);
  });
