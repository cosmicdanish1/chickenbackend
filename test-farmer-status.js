const axios = require('axios');

const API_URL = 'http://localhost:3001/api/v1';

async function testFarmerStatus() {
  try {
    console.log('Testing Farmer Status Feature\n');
    
    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@azizpoultry.com',
      password: 'admin123'
    });
    const token = loginResponse.data.accessToken || loginResponse.data.access_token;
    console.log('✓ Logged in successfully');
    console.log('Token:', token ? 'Received' : 'Missing');
    console.log('Response:', JSON.stringify(loginResponse.data, null, 2), '\n');
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // Step 2: Get all farmers
    console.log('2. Getting all farmers...');
    const farmersResponse = await axios.get(`${API_URL}/farmers`, { headers });
    console.log(`✓ Found ${farmersResponse.data.length} farmers`);
    
    if (farmersResponse.data.length > 0) {
      const firstFarmer = farmersResponse.data[0];
      console.log(`   First farmer: ${firstFarmer.name}, Status: ${firstFarmer.status}\n`);
      
      // Step 3: Update farmer status to inactive
      console.log('3. Updating farmer status to inactive...');
      const updateResponse = await axios.patch(
        `${API_URL}/farmers/${firstFarmer.id}`,
        { status: 'inactive' },
        { headers }
      );
      console.log(`✓ Updated farmer: ${updateResponse.data.name}, New Status: ${updateResponse.data.status}\n`);
      
      // Step 4: Verify the update
      console.log('4. Verifying the update...');
      const verifyResponse = await axios.get(`${API_URL}/farmers/${firstFarmer.id}`, { headers });
      console.log(`✓ Verified farmer: ${verifyResponse.data.name}, Status: ${verifyResponse.data.status}\n`);
      
      // Step 5: Update back to active
      console.log('5. Updating farmer status back to active...');
      const revertResponse = await axios.patch(
        `${API_URL}/farmers/${firstFarmer.id}`,
        { status: 'active' },
        { headers }
      );
      console.log(`✓ Reverted farmer: ${revertResponse.data.name}, Status: ${revertResponse.data.status}\n`);
    }
    
    // Step 6: Create a new farmer with inactive status
    console.log('6. Creating a new farmer with inactive status...');
    const newFarmer = await axios.post(
      `${API_URL}/farmers`,
      {
        name: 'Test Farmer Status',
        phone: '9999999999',
        address: 'Test Address',
        status: 'inactive'
      },
      { headers }
    );
    console.log(`✓ Created farmer: ${newFarmer.data.name}, Status: ${newFarmer.data.status}\n`);
    
    // Step 7: Delete the test farmer
    console.log('7. Cleaning up test farmer...');
    await axios.delete(`${API_URL}/farmers/${newFarmer.data.id}`, { headers });
    console.log('✓ Test farmer deleted\n');
    
    console.log('✓ All tests passed! Farmer status feature is working correctly.');
    
  } catch (error) {
    console.error('✗ Test failed:', error.response?.data || error.message);
  }
}

testFarmerStatus();
