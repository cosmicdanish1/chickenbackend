const { Client } = require('pg');
const bcrypt = require('bcrypt');

// PASTE YOUR COMPLETE DATABASE URL HERE (from Render dashboard)
const DATABASE_URL = "postgresql://poultry_user:tdgOrBo0kxdJNDIphGaP3m1PBmzE0IpZ@dpg-d6a8cskr85hc738ep8fg-a.oregon-postgres.render.com:5432/poultry_4xcy";

async function fixPasswords() {
  console.log('🔧 Fixing user passwords in Render database...\n');
  
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Generate password hash for 'admin123'
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('🔐 Generated password hash\n');

    // Check current users
    const checkUsers = await client.query('SELECT id, name, email, role FROM users ORDER BY id');
    console.log('📊 Current users:');
    checkUsers.rows.forEach(user => {
      console.log(`   ${user.id}. ${user.name} (${user.email}) - ${user.role}`);
    });
    console.log('');

    // Update passwords
    const result = await client.query(`
      UPDATE users 
      SET password_hash = $1
      WHERE email IN ('admin@azizpoultry.com', 'john@azizpoultry.com', 'mike@azizpoultry.com')
      RETURNING id, name, email, role
    `, [hash]);

    console.log('✅ Updated passwords for:');
    result.rows.forEach(user => {
      console.log(`   ✓ ${user.name} (${user.email})`);
    });

    console.log('\n🎉 SUCCESS! Passwords fixed!\n');
    console.log('🔑 Login Credentials:');
    console.log('   Email: admin@azizpoultry.com');
    console.log('   Password: admin123\n');
    console.log('✅ Try logging in now at: https://chickenfrontend.onrender.com');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Your database URL is incomplete!');
      console.log('   Go to Render dashboard → PostgreSQL → Copy "External Database URL"');
      console.log('   It should end with .render.com');
    } else if (error.message.includes('no pg_hba.conf entry')) {
      console.log('\n💡 SSL connection issue - already handled in code');
    } else if (error.code === '42P01') {
      console.log('\n💡 Users table does not exist - run migrations first');
    }
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

fixPasswords();
