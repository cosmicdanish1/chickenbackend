const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function checkAndSeed() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'poultry',
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    // Check if admin user exists
    const userCheck = await client.query(`
      SELECT COUNT(*) as count FROM users WHERE email = 'admin@azizpoultry.com'
    `);
    
    const userCount = parseInt(userCheck.rows[0].count);
    console.log(`Found ${userCount} admin users`);
    
    if (userCount === 0) {
      console.log('No admin user found. Loading seed data...');
      
      // Read and execute seed.sql
      const seedScript = fs.readFileSync(path.join(__dirname, '..', 'seed.sql'), 'utf8');
      await client.query(seedScript);
      
      console.log('✅ Seed data loaded successfully!');
      
      // Verify admin user was created
      const verifyUser = await client.query(`
        SELECT name, email, role FROM users WHERE email = 'admin@azizpoultry.com'
      `);
      
      if (verifyUser.rows.length > 0) {
        console.log('✅ Admin user created:', verifyUser.rows[0]);
      }
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Show some stats
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM vehicles) as vehicles,
        (SELECT COUNT(*) FROM farmers) as farmers,
        (SELECT COUNT(*) FROM retailers) as retailers,
        (SELECT COUNT(*) FROM expenses) as expenses
    `);
    
    console.log('\nDatabase Statistics:');
    console.log(`  Users: ${stats.rows[0].users}`);
    console.log(`  Vehicles: ${stats.rows[0].vehicles}`);
    console.log(`  Farmers: ${stats.rows[0].farmers}`);
    console.log(`  Retailers: ${stats.rows[0].retailers}`);
    console.log(`  Expenses: ${stats.rows[0].expenses}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAndSeed();