const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function fixAdminPassword() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'poultry',
  });

  try {
    await client.connect();
    
    console.log('Generating new password hash...');
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log('Updating admin user password...');
    await client.query(`
      UPDATE users 
      SET password_hash = $1 
      WHERE email = 'admin@azizpoultry.com'
    `, [hash]);
    
    console.log('✅ Admin password updated successfully!');
    
    // Verify the update
    const result = await client.query(`
      SELECT name, email FROM users WHERE email = 'admin@azizpoultry.com'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Admin user verified:', result.rows[0]);
      console.log('📧 Email: admin@azizpoultry.com');
      console.log('🔑 Password: admin123');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixAdminPassword();