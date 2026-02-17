const { Client } = require('pg');
require('dotenv').config();

async function checkSchema() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        character_maximum_length, 
        numeric_precision,
        numeric_scale,
        is_nullable, 
        column_default 
      FROM information_schema.columns 
      WHERE table_name='inventory_items' 
      ORDER BY ordinal_position
    `);

    console.log('Current inventory_items schema:');
    console.log('=====================================');
    result.rows.forEach(row => {
      const type = row.data_type === 'numeric' 
        ? `${row.data_type}(${row.numeric_precision},${row.numeric_scale})`
        : row.data_type === 'character varying' && row.character_maximum_length
        ? `${row.data_type}(${row.character_maximum_length})`
        : row.data_type;
      
      console.log(`${row.column_name}: ${type} ${row.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${row.column_default || ''}`);
    });

    await client.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSchema();
