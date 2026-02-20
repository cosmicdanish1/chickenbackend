const { Client } = require('pg');
const fs = require('fs');

// Render database config
const renderConfig = {
  host: 'dpg-d6a8cskr85hc738ep8fg-a.oregon-postgres.render.com',
  port: 5432,
  database: 'poultry_4xcy',
  user: 'poultry_user',
  password: 'tdgOrBo0kxdJNDIphGaP3m1PBmzE0IpZ',
  ssl: {
    rejectUnauthorized: false
  }
};

async function importData() {
  console.log('📥 Importing data to Render database...\n');

  const client = new Client(renderConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to RENDER database\n');

    // Read the SQL file
    const sqlContent = fs.readFileSync('database-export.sql', 'utf8');
    
    // Split by lines and execute
    const statements = sqlContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('--'))
      .join('\n')
      .split(';')
      .filter(stmt => stmt.trim());

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) continue;

      try {
        await client.query(statement);
        successCount++;
        
        if ((i + 1) % 10 === 0) {
          console.log(`   ✅ Executed ${i + 1}/${statements.length} statements`);
        }
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
      }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

importData()
  .then(() => {
    console.log('\n🎉 Database imported successfully to Render!');
    console.log('\n🧪 Test your API:');
    console.log('https://chickenbackend.onrender.com/api/v1/auth/login');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  });
