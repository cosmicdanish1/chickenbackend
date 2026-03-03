const { Client } = require('pg');

const connectionString = 'postgresql://poultry_user:tdgOrBo0kxdJNDIphGaP3m1PBmzE0IpZ@dpg-d6a8cskr85hc738ep8fg-a.oregon-postgres.render.com:5432/poultry_4xcy';

async function checkTypes() {
  const client = new Client({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Render database\n');

    const result = await client.query(`
      SELECT 
        t.typname as type_name,
        string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      LEFT JOIN pg_enum e ON t.oid = e.enumtypid  
      LEFT JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typtype = 'e'
      GROUP BY t.typname
      ORDER BY t.typname;
    `);

    console.log('📊 Custom ENUM types in database:\n');
    result.rows.forEach(row => {
      console.log(`${row.type_name}:`);
      console.log(`  ${row.enum_values}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTypes();
