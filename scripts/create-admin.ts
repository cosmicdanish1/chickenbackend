import * as bcrypt from 'bcrypt';

async function createAdminHash() {
  const password = 'admin123'; // Default admin password
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  
  console.log('Admin password hash:');
  console.log(hash);
  console.log('\nSQL to insert admin user:');
  console.log(`INSERT INTO users (name, email, password_hash, role) VALUES ('Admin User', 'admin@azizpoultry.com', '${hash}', 'admin');`);
}

createAdminHash().catch(console.error);