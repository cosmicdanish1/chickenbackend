const { Client } = require('pg');
require('dotenv').config();

async function addUserPhoneNotesColumns() {
  const connectionConfig = process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      };

  const client = new Client(connectionConfig);

  try {
    await client.connect();
    console.log('Connected to database');

    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('phone', 'notes');
    `;
    
    const existingColumns = await client.query(checkQuery);
    const existingColumnNames = existingColumns.rows.map(row => row.column_name);
    
    console.log('Existing columns:', existingColumnNames);

    const columnsToAdd = [
      { name: 'phone', type: 'VARCHAR(20)' },
      { name: 'notes', type: 'TEXT' },
    ];

    for (const column of columnsToAdd) {
      if (!existingColumnNames.includes(column.name)) {
        const alterQuery = `ALTER TABLE users ADD COLUMN ${column.name} ${column.type};`;
        await client.query(alterQuery);
        console.log(`✓ Added column: ${column.name}`);
      } else {
        console.log(`- Column already exists: ${column.name}`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

addUserPhoneNotesColumns();
