const { Client } = require('pg');

const DATABASE_URL = "postgresql://poultry_user:tdgOrBo0kxdJNDIphGaP3m1PBmzE0IpZ@dpg-d6a8cskr85hc738ep8fg-a.oregon-postgres.render.com:5432/poultry_4xcy";

async function fixAdminRole() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Update admin user role
    const result = await client.query(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email = 'admin@azizpoultry.com'
      RETURNING id, name, email, role, status
    `);

    console.log('✅ Updated admin user:');
    result.rows.forEach(user => {
      console.log(`   ${user.name} (${user.email})`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
    });

    console.log('\n🎉 Admin role fixed!');
    console.log('✅ You can now access the Users page!');
    console.log('\n💡 You may need to logout and login again for the role change to take effect.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixAdminRole();
