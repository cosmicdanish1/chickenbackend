const axios = require('axios');

const API_URL = 'https://chickenbackend.onrender.com/api/v1';

async function testAPI() {
  console.log('🧪 Testing Render API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('   ✅ Health:', healthResponse.data);

    // Test 2: Login
    console.log('\n2️⃣ Testing Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@azizpoultry.com',
      password: 'admin123'
    });
    console.log('   ✅ Login successful!');
    console.log('   Token:', loginResponse.data.accessToken.substring(0, 50) + '...');
    console.log('   User:', loginResponse.data.user);

    const token = loginResponse.data.accessToken;

    // Test 3: Get Profile
    console.log('\n3️⃣ Testing Profile...');
    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Profile:', profileResponse.data);

    // Test 4: Get Farmers
    console.log('\n4️⃣ Testing Farmers...');
    const farmersResponse = await axios.get(`${API_URL}/farmers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Found ${farmersResponse.data.length} farmers`);

    // Test 5: Get Retailers
    console.log('\n5️⃣ Testing Retailers...');
    const retailersResponse = await axios.get(`${API_URL}/retailers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Found ${retailersResponse.data.length} retailers`);

    // Test 6: Get Vehicles
    console.log('\n6️⃣ Testing Vehicles...');
    const vehiclesResponse = await axios.get(`${API_URL}/vehicles`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`   ✅ Found ${vehiclesResponse.data.length} vehicles`);

    console.log('\n🎉 All tests passed! Your API is working perfectly!');
    console.log('\n📝 Share this URL with your team:');
    console.log(`   ${API_URL}`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

testAPI();
