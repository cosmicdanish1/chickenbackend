const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'poultry',
  });

  try {
    console.log('Testing database connection...');
    console.log(`Host: ${client.host}:${client.port}`);
    console.log(`Database: ${client.database}`);
    console.log(`User: ${client.user}`);
    
    await client.connect();
    console.log('✅ Database connection successful!');
    
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    // Test if poultry database exists and has tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`Found ${tables.rows.length} tables in the database:`);
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible solutions:');
      console.error('  1. Make sure PostgreSQL is running');
      console.error('  2. Check if the port 5432 is correct');
      console.error('  3. Verify the host address');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database does not exist. Please create it:');
      console.error('  psql -U postgres -c "CREATE DATABASE poultry;"');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Please check:');
      console.error('  1. Username and password in .env file');
      console.error('  2. PostgreSQL user permissions');
    }
  } finally {
    await client.end();
  }
}

testConnection();