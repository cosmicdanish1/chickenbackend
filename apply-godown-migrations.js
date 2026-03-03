const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Render database connection
const connectionString = 'postgresql://poultry_user:tdgOrBo0kxdJNDIphGaP3m1PBmzE0IpZ@dpg-d6a8cskr85hc738ep8fg-a.oregon-postgres.render.com:5432/poultry_4xcy';

async function applyGodownMigrations() {
  const client = new Client({ 
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Render database');

    // Migration files in order
    const migrations = [
      '012_create_godown_inward_entries_table.sql',
      '013_create_godown_mortality_table.sql',
      '014_create_godown_expenses_table.sql',
      '015_create_godown_sales_table.sql'
    ];

    for (const migrationFile of migrations) {
      console.log(`\n📄 Applying migration: ${migrationFile}`);
      
      const migrationPath = path.join(__dirname, 'migrations', migrationFile);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        await client.query(sql);
        console.log(`✅ Successfully applied: ${migrationFile}`);
      } catch (error) {
        if (error.code === '42P07') {
          console.log(`⚠️  Table/Index already exists, skipping: ${migrationFile}`);
        } else {
          throw error;
        }
      }
    }

    // Verify tables were created
    console.log('\n🔍 Verifying godown tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name LIKE 'godown%'
      ORDER BY table_name;
    `);

    console.log('\n✅ Godown tables created:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Get column counts
    console.log('\n📊 Table structures:');
    for (const row of result.rows) {
      const colResult = await client.query(`
        SELECT COUNT(*) as column_count
        FROM information_schema.columns
        WHERE table_name = $1;
      `, [row.table_name]);
      console.log(`   ${row.table_name}: ${colResult.rows[0].column_count} columns`);
    }

    console.log('\n✅ All godown migrations applied successfully!');

  } catch (error) {
    console.error('❌ Error applying migrations:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

applyGodownMigrations();
