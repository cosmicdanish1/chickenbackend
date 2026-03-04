const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupLocalDatabase() {
  console.log('🔧 Local PostgreSQL Database Setup\n');
  console.log('This script will help you set up a local replica of your Render database.\n');

  // Get local database credentials
  const dbHost = await question('PostgreSQL Host (default: localhost): ') || 'localhost';
  const dbPort = await question('PostgreSQL Port (default: 5432): ') || '5432';
  const dbUser = await question('PostgreSQL User (default: postgres): ') || 'postgres';
  const dbPassword = await question('PostgreSQL Password: ');
  const dbName = await question('Database Name (default: aziz_poultry_local): ') || 'aziz_poultry_local';

  rl.close();

  console.log('\n📝 Creating local database configuration...\n');

  // Create .env.local file
  const envLocal = `# Local PostgreSQL Database Configuration
DATABASE_URL=postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}
DATABASE_HOST=${dbHost}
DATABASE_PORT=${dbPort}
DATABASE_USER=${dbUser}
DATABASE_PASSWORD=${dbPassword}
DATABASE_NAME=${dbName}

# JWT Configuration (copy from .env)
JWT_SECRET=your-secret-key-here

# Application Configuration
PORT=3000
NODE_ENV=development
`;

  fs.writeFileSync('.env.local', envLocal);
  console.log('✅ Created .env.local file');

  // Connect to PostgreSQL (without database name to create it)
  const adminClient = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: 'postgres' // Connect to default database
  });

  try {
    await adminClient.connect();
    console.log('✅ Connected to PostgreSQL server');

    // Check if database exists
    const dbCheckResult = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbCheckResult.rows.length > 0) {
      console.log(`⚠️  Database '${dbName}' already exists`);
      console.log('   Dropping and recreating...');
      
      // Terminate existing connections
      await adminClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = $1
        AND pid <> pg_backend_pid();
      `, [dbName]);

      await adminClient.query(`DROP DATABASE ${dbName}`);
    }

    // Create database
    await adminClient.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Created database: ${dbName}`);

    await adminClient.end();

    // Connect to the new database
    const dbClient = new Client({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName
    });

    await dbClient.connect();
    console.log(`✅ Connected to database: ${dbName}\n`);

    // Check for backup files
    const backupDir = path.join(__dirname, 'database-backups');
    if (fs.existsSync(backupDir)) {
      const backupFiles = fs.readdirSync(backupDir)
        .filter(f => f.endsWith('.sql'))
        .sort()
        .reverse();

      if (backupFiles.length > 0) {
        console.log('📦 Found backup files:');
        backupFiles.forEach((file, index) => {
          console.log(`   ${index + 1}. ${file}`);
        });

        const latestBackup = path.join(backupDir, backupFiles[0]);
        console.log(`\n📥 Restoring from latest backup: ${backupFiles[0]}\n`);

        const sqlContent = fs.readFileSync(latestBackup, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sqlContent
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        let successCount = 0;
        let errorCount = 0;

        for (const statement of statements) {
          try {
            await dbClient.query(statement);
            successCount++;
          } catch (error) {
            errorCount++;
            if (!error.message.includes('already exists')) {
              console.error(`⚠️  Error executing statement: ${error.message}`);
            }
          }
        }

        console.log(`\n✅ Restore completed!`);
        console.log(`   Success: ${successCount} statements`);
        if (errorCount > 0) {
          console.log(`   Warnings: ${errorCount} statements (mostly duplicates)`);
        }

        // Verify tables
        const tablesResult = await dbClient.query(`
          SELECT tablename, 
                 (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = tablename) as column_count
          FROM pg_tables 
          WHERE schemaname = 'public' 
          ORDER BY tablename;
        `);

        console.log(`\n📊 Database Tables (${tablesResult.rows.length} total):`);
        for (const row of tablesResult.rows) {
          const countResult = await dbClient.query(`SELECT COUNT(*) FROM ${row.tablename}`);
          console.log(`   - ${row.tablename}: ${countResult.rows[0].count} rows, ${row.column_count} columns`);
        }
      } else {
        console.log('⚠️  No backup files found. Run backup-database.js first.');
      }
    } else {
      console.log('⚠️  No backup directory found. Run backup-database.js first.');
    }

    await dbClient.end();

    console.log('\n✅ Local database setup complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update your .env file to use .env.local for local development');
    console.log('   2. Run: npm run start:dev');
    console.log('   3. Your app will now use the local database\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  }
}

setupLocalDatabase().catch(console.error);
