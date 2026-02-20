const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

// Local database config
const localConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'poultry',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
};

async function exportData() {
  console.log('📦 Exporting database data...\n');

  const client = new Client(localConfig);
  await client.connect();
  console.log('✅ Connected to LOCAL database\n');

  let sqlOutput = '-- Database Export\n';
  sqlOutput += '-- Generated: ' + new Date().toISOString() + '\n\n';

  try {
    // Get all table names
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      ORDER BY tablename
    `);

    console.log(`📋 Found ${tablesResult.rows.length} tables\n`);

    for (const { tablename } of tablesResult.rows) {
      console.log(`📦 Exporting: ${tablename}`);

      // Get data
      const dataResult = await client.query(`SELECT * FROM ${tablename}`);
      
      if (dataResult.rows.length > 0) {
        sqlOutput += `\n-- Table: ${tablename} (${dataResult.rows.length} rows)\n`;
        sqlOutput += `TRUNCATE TABLE ${tablename} CASCADE;\n`;

        for (const row of dataResult.rows) {
          const columns = Object.keys(row);
          const values = Object.values(row).map(val => {
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            return val;
          });

          sqlOutput += `INSERT INTO ${tablename} (${columns.join(', ')}) VALUES (${values.join(', ')});\n`;
        }
        
        console.log(`   ✅ Exported ${dataResult.rows.length} rows`);
      } else {
        console.log(`   ⚠️  No data`);
      }
    }

    // Write to file
    fs.writeFileSync('database-export.sql', sqlOutput);
    console.log('\n✅ Export complete! File saved: database-export.sql');
    console.log('\n📝 Next steps:');
    console.log('1. Copy the content of database-export.sql');
    console.log('2. Connect to Render database using psql');
    console.log('3. Paste and execute the SQL');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

exportData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Export failed:', error.message);
    process.exit(1);
  });
