const { Client } = require('pg');
require('dotenv').config();

async function addExpenseOwnerColumn() {
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
      WHERE table_name = 'expenses' 
      AND column_name = 'expense_owner';
    `;
    
    const columnExists = await client.query(checkQuery);
    
    if (columnExists.rows.length === 0) {
      const alterQuery = `ALTER TABLE expenses ADD COLUMN expense_owner VARCHAR(150);`;
      await client.query(alterQuery);
      console.log('✓ Added column: expense_owner');
    } else {
      console.log('- Column already exists: expense_owner');
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

addExpenseOwnerColumn();
