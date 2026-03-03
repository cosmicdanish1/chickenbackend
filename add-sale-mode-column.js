const { Client } = require('pg');
require('dotenv').config();

async function addSaleModeColumn() {
  // Use DATABASE_URL if available (production), otherwise use individual variables (development)
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

    // Check if enum type exists
    const checkEnumQuery = `
      SELECT 1 FROM pg_type WHERE typname = 'sale_mode_type';
    `;
    
    const enumExists = await client.query(checkEnumQuery);
    
    if (enumExists.rows.length === 0) {
      // Create enum type
      const createEnumQuery = `
        CREATE TYPE sale_mode_type AS ENUM ('from_vehicle', 'from_godown');
      `;
      await client.query(createEnumQuery);
      console.log('✓ Created enum type: sale_mode_type');
    } else {
      console.log('- Enum type already exists: sale_mode_type');
    }

    // Check if column exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sales' 
      AND column_name = 'sale_mode';
    `;
    
    const columnExists = await client.query(checkColumnQuery);
    
    if (columnExists.rows.length === 0) {
      // Add column
      const alterQuery = `
        ALTER TABLE sales 
        ADD COLUMN sale_mode sale_mode_type DEFAULT 'from_vehicle';
      `;
      await client.query(alterQuery);
      console.log('✓ Added column: sale_mode');
      
      // Update existing records
      const updateQuery = `
        UPDATE sales 
        SET sale_mode = 'from_vehicle' 
        WHERE sale_mode IS NULL;
      `;
      const result = await client.query(updateQuery);
      console.log(`✓ Updated ${result.rowCount} existing records with default sale_mode`);
    } else {
      console.log('- Column already exists: sale_mode');
    }

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

addSaleModeColumn();
