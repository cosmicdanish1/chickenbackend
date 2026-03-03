const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Get database URL from command line argument
const DATABASE_URL = process.argv[2];

if (!DATABASE_URL) {
  console.error('❌ Error: Please provide database URL as argument');
  console.log('\nUsage:');
  console.log('node fix-render-passwords.js "postgresql://user:pass@host:port/database"');
  console.log('\nGet your database URL from:');
  console.log('1. Go to https://dashboard.render.com/');
  console.log('2. Click on your PostgreSQL database');
  console.log('3. Copy the "External Database URL"');
  process.exit(1);
}

async function fixPasswords() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Render database...\n');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Generate password hash for 'admin123'
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('🔐 Generated password hash for: admin123\n');

    // Check if users exist
    const checkUsers = await client.query(`
      SELECT id, name, email, role, status 
      FROM users 
      ORDER BY id
    `);

    console.log('📊 Current users in database:');
    console.log('─────────────────────────────────────────────────────');
    checkUsers.rows.forEach(user => {
      console.log(`ID: ${user.id} | ${user.name} (${user.email}) - ${user.role} - ${user.status}`);
    });
    console.log('─────────────────────────────────────────────────────\n');

    // Update passwords for all users
    const updateResult = await client.query(`
      UPDATE users 
      SET password_hash = $1
      WHERE email IN ('admin@azizpoultry.com', 'john@azizpoultry.com', 'mike@azizpoultry.com')
      RETURNING id, name, email, role
    `, [hash]);

    console.log('✅ Updated passwords for:');
    updateResult.rows.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log('\n🎉 Password fix completed successfully!\n');
    console.log('🔑 Test Credentials:');
    console.log('   Email: admin@azizpoultry.com | Password: admin123');
    console.log('   Email: john@azizpoultry.com  | Password: admin123');
    console.log('   Email: mike@azizpoultry.com  | Password: admin123');
    console.log('\n✅ You can now login to your frontend!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Tip: Check your database URL is correct');
    } else if (error.code === '42P01') {
      console.log('\n💡 Tip: Users table does not exist. Run migrations first.');
    }
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

fixPasswords();
