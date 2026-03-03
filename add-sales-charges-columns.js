const { Client } = require('pg');
require('dotenv').config();

async function addSalesChargesColumns() {
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
      WHERE table_name = 'sales' 
      AND column_name IN ('transport_charges', 'loading_charges', 'commission', 'other_charges', 
                          'weight_shortage', 'mortality_deduction', 'other_deduction', 
                          'gross_amount', 'net_amount');
    `;
    
    const existingColumns = await client.query(checkQuery);
    const existingColumnNames = existingColumns.rows.map(row => row.column_name);
    
    console.log('Existing columns:', existingColumnNames);

    const columnsToAdd = [
      { name: 'transport_charges', type: 'NUMERIC(10, 2) DEFAULT 0' },
      { name: 'loading_charges', type: 'NUMERIC(10, 2) DEFAULT 0' },
      { name: 'commission', type: 'NUMERIC(10, 2) DEFAULT 0' },
      { name: 'other_charges', type: 'NUMERIC(10, 2) DEFAULT 0' },
      { name: 'weight_shortage', type: 'NUMERIC(10, 2) DEFAULT 0' },
      { name: 'mortality_deduction', type: 'NUMERIC(10, 2) DEFAULT 0' },
      { name: 'other_deduction', type: 'NUMERIC(10, 2) DEFAULT 0' },
      { name: 'gross_amount', type: 'NUMERIC(14, 2) DEFAULT 0' },
      { name: 'net_amount', type: 'NUMERIC(14, 2) DEFAULT 0' },
    ];

    for (const column of columnsToAdd) {
      if (!existingColumnNames.includes(column.name)) {
        const alterQuery = `ALTER TABLE sales ADD COLUMN ${column.name} ${column.type};`;
        await client.query(alterQuery);
        console.log(`✓ Added column: ${column.name}`);
      } else {
        console.log(`- Column already exists: ${column.name}`);
      }
    }

    const updateQuery = `
      UPDATE sales 
      SET 
        gross_amount = total_amount + transport_charges + loading_charges + commission + other_charges,
        net_amount = total_amount + transport_charges + loading_charges + commission + other_charges 
                     - weight_shortage - mortality_deduction - other_deduction
      WHERE gross_amount = 0 OR net_amount = 0;
    `;
    
    const result = await client.query(updateQuery);
    console.log(`✓ Updated ${result.rowCount} existing records with calculated amounts`);

    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

addSalesChargesColumns();
