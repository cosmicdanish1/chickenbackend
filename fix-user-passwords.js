const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function fixPasswords() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Hash the password 'admin123'
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log('🔐 Generated password hash for: admin123\n');

    // Update all users with the new hash
    const result = await client.query(`
      UPDATE users 
      SET password_hash = $1
      WHERE email IN ('admin@azizpoultry.com', 'john@azizpoultry.com', 'mike@azizpoultry.com')
      RETURNING id, name, email, role
    `, [hash]);

    console.log('✅ Updated passwords for:');
    result.rows.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });

    // Verify all users are active
    const statusCheck = await client.query(`
      SELECT id, name, email, role, status 
      FROM users 
      WHERE email IN ('admin@azizpoultry.com', 'john@azizpoultry.com', 'mike@azizpoultry.com')
    `);

    console.log('\n📊 User Status:');
    statusCheck.rows.forEach(user => {
      const statusIcon = user.status === 'active' ? '✅' : '❌';
      console.log(`   ${statusIcon} ${user.name} (${user.role}) - ${user.status}`);
    });

    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPasswords()
  .then(() => {
    console.log('\n✅ Password fix completed successfully');
    console.log('\n🔑 Test Credentials:');
    console.log('   Email: admin@azizpoultry.com | Password: admin123');
    console.log('   Email: john@azizpoultry.com  | Password: admin123');
    console.log('   Email: mike@azizpoultry.com  | Password: admin123');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error.message);
    process.exit(1);
  });
