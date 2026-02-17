const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function testLogin() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'poultry',
  });

  try {
    await client.connect();
    
    // Get the admin user
    const result = await client.query(`
      SELECT name, email, password_hash, role, status 
      FROM users 
      WHERE email = 'admin@azizpoultry.com'
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const user = result.rows[0];
    console.log('User found:', {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    
    // Test password
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    
    console.log(`Password test for '${testPassword}':`, isValid ? '✅ Valid' : '❌ Invalid');
    
    if (!isValid) {
      console.log('Stored hash:', user.password_hash);
      
      // Generate a new hash for comparison
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash would be:', newHash);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testLogin();