const { Client } = require('pg');

const DATABASE_URL = "postgresql://poultry_user:tdgOrBo0kxdJNDIphGaP3m1PBmzE0IpZ@dpg-d6a8cskr85hc738ep8fg-a.oregon-postgres.render.com:5432/poultry_4xcy";

async function activateUsers() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const result = await client.query(`
      UPDATE users 
      SET status = 'active' 
      WHERE email IN ('admin@azizpoultry.com', 'john@azizpoultry.com', 'mike@azizpoultry.com')
      RETURNING email, status, role
    `);

    console.log('✅ Activated users:');
    result.rows.forEach(user => {
      console.log(`   ${user.email} (${user.role}): ${user.status}`);
    });

    console.log('\n🎉 All users are now active!');
    console.log('✅ Try logging in now!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

activateUsers();
