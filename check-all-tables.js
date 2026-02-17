const { Client } = require('pg');
require('dotenv').config();

async function checkAllTables() {
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

    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      console.log(`\n📋 Table: ${tableName}`);
      console.log('='.repeat(50));

      // Get columns
      const columnsResult = await client.query(`
        SELECT 
          column_name, 
          data_type, 
          character_maximum_length, 
          numeric_precision,
          numeric_scale,
          is_nullable, 
          column_default 
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      columnsResult.rows.forEach(row => {
        let type = row.data_type;
        if (row.data_type === 'numeric' && row.numeric_precision) {
          type = `numeric(${row.numeric_precision},${row.numeric_scale})`;
        } else if (row.data_type === 'character varying' && row.character_maximum_length) {
          type = `varchar(${row.character_maximum_length})`;
        }
        
        const nullable = row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL';
        console.log(`  ${row.column_name}: ${type} ${nullable}`);
      });

      // Check for null values in NOT NULL columns
      const notNullCols = columnsResult.rows
        .filter(r => r.is_nullable === 'NO')
        .map(r => r.column_name);

      for (const col of notNullCols) {
        const nullCheck = await client.query(
          `SELECT COUNT(*) as count FROM ${tableName} WHERE ${col} IS NULL`
        );
        if (parseInt(nullCheck.rows[0].count) > 0) {
          console.log(`  ⚠️  WARNING: ${nullCheck.rows[0].count} NULL values in ${col}`);
        }
      }
    }

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAllTables();
