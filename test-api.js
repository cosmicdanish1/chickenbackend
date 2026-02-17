// Automated API Testing Script
// Tests Authentication, User Management, and Master Data
const axios = require('axios');
require('dotenv').config();

const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001/api/v1';
let adminToken = '';
let managerToken = '';
let staffToken = '';

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} - ${name}`);
  if (message) console.log(`   ${message}`);
  
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication & Authorization\n');
  
  // Test 1.1: Admin Login
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@azizpoultry.com',
      password: 'admin123'
    });
    
    if (response.data.accessToken && response.data.user.role === 'admin') {
      adminToken = response.data.accessToken;
      logTest('TC1.1: Admin Login', true, `Token: ${adminToken.substring(0, 20)}...`);
    } else {
      logTest('TC1.1: Admin Login', false, 'No token or wrong role');
    }
  } catch (error) {
    logTest('TC1.1: Admin Login', false, error.message);
  }
  
  // Test 1.2: Manager Login
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'john@azizpoultry.com',
      password: 'admin123'
    });
    
    if (response.data.accessToken && response.data.user.role === 'manager') {
      managerToken = response.data.accessToken;
      logTest('TC1.2: Manager Login', true);
    } else {
      logTest('TC1.2: Manager Login', false, 'No token or wrong role');
    }
  } catch (error) {
    logTest('TC1.2: Manager Login', false, error.message);
  }
  
  // Test 1.3: Staff Login
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'mike@azizpoultry.com',
      password: 'admin123'
    });
    
    if (response.data.accessToken && response.data.user.role === 'staff') {
      staffToken = response.data.accessToken;
      logTest('TC1.3: Staff Login', true);
    } else {
      logTest('TC1.3: Staff Login', false, 'No token or wrong role');
    }
  } catch (error) {
    logTest('TC1.3: Staff Login', false, error.message);
  }
  
  // Test 1.4: Invalid Credentials
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@azizpoultry.com',
      password: 'wrongpassword'
    });
    logTest('TC1.4: Invalid Credentials', false, 'Should have failed but succeeded');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logTest('TC1.4: Invalid Credentials', true, 'Correctly rejected');
    } else {
      logTest('TC1.4: Invalid Credentials', false, error.message);
    }
  }
  
  // Test 1.5: Get Profile (Authenticated)
  try {
    const response = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.email === 'admin@azizpoultry.com') {
      logTest('TC1.5: Get Profile (Authenticated)', true);
    } else {
      logTest('TC1.5: Get Profile (Authenticated)', false, 'Wrong user data');
    }
  } catch (error) {
    logTest('TC1.5: Get Profile (Authenticated)', false, error.message);
  }
  
  // Test 1.6: Access Without Token
  try {
    await axios.get(`${API_BASE}/auth/profile`);
    logTest('TC1.6: Access Without Token', false, 'Should have been rejected');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logTest('TC1.6: Access Without Token', true, 'Correctly rejected');
    } else {
      logTest('TC1.6: Access Without Token', false, error.message);
    }
  }
}

async function testUserManagement() {
  console.log('\n👥 Testing User Management\n');
  
  // Test 2.1: Get All Users (Admin)
  try {
    const response = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (Array.isArray(response.data) && response.data.length >= 10) {
      logTest('TC2.1: Get All Users (Admin)', true, `Found ${response.data.length} users`);
    } else {
      logTest('TC2.1: Get All Users (Admin)', false, 'Not enough users or wrong format');
    }
  } catch (error) {
    logTest('TC2.1: Get All Users (Admin)', false, error.message);
  }
  
  // Test 2.2: Get All Users (Non-Admin)
  try {
    await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    logTest('TC2.2: Get All Users (Non-Admin)', false, 'Staff should not access users');
  } catch (error) {
    if (error.response && error.response.status === 403) {
      logTest('TC2.2: Get All Users (Non-Admin)', true, 'Correctly forbidden');
    } else {
      logTest('TC2.2: Get All Users (Non-Admin)', false, error.message);
    }
  }
  
  // Test 2.3: Create User (Admin)
  let newUserId;
  try {
    const response = await axios.post(`${API_BASE}/users`, {
      name: 'Test User',
      email: `testuser${Date.now()}@azizpoultry.com`,
      password: 'test123',
      role: 'staff',
      status: 'active'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.id && response.data.email) {
      newUserId = response.data.id;
      logTest('TC2.3: Create User (Admin)', true, `Created user ID: ${newUserId}`);
    } else {
      logTest('TC2.3: Create User (Admin)', false, 'No user ID returned');
    }
  } catch (error) {
    logTest('TC2.3: Create User (Admin)', false, error.message);
  }
  
  // Test 2.4: Update User
  if (newUserId) {
    try {
      const response = await axios.patch(`${API_BASE}/users/${newUserId}`, {
        name: 'Updated Test User'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.name === 'Updated Test User') {
        logTest('TC2.4: Update User', true);
      } else {
        logTest('TC2.4: Update User', false, 'Name not updated');
      }
    } catch (error) {
      logTest('TC2.4: Update User', false, error.message);
    }
  }
  
  // Test 2.5: Deactivate User
  if (newUserId) {
    try {
      const response = await axios.patch(`${API_BASE}/users/${newUserId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.status === 'inactive') {
        logTest('TC2.5: Deactivate User', true);
      } else {
        logTest('TC2.5: Deactivate User', false, 'Status not changed');
      }
    } catch (error) {
      logTest('TC2.5: Deactivate User', false, error.message);
    }
  }
  
  // Test 2.6: Get User Statistics
  try {
    const response = await axios.get(`${API_BASE}/users/statistics/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.totalUsers && response.data.activeUsers !== undefined) {
      logTest('TC2.6: Get User Statistics', true, `Total: ${response.data.totalUsers}, Active: ${response.data.activeUsers}`);
    } else {
      logTest('TC2.6: Get User Statistics', false, 'Missing statistics data');
    }
  } catch (error) {
    logTest('TC2.6: Get User Statistics', false, error.message);
  }
}

async function testFarmers() {
  console.log('\n🌾 Testing Farmers Management\n');
  
  // Test 3.1.1: Get All Farmers
  try {
    const response = await axios.get(`${API_BASE}/farmers`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (Array.isArray(response.data) && response.data.length >= 10) {
      logTest('TC3.1.1: Get All Farmers', true, `Found ${response.data.length} farmers`);
    } else {
      logTest('TC3.1.1: Get All Farmers', false, 'Not enough farmers');
    }
  } catch (error) {
    logTest('TC3.1.1: Get All Farmers', false, error.message);
  }
  
  // Test 3.1.2: Create Farmer
  let newFarmerId;
  try {
    const response = await axios.post(`${API_BASE}/farmers`, {
      name: `Test Farmer ${Date.now()}`,
      phone: '9999999999',
      email: `testfarmer${Date.now()}@example.com`,
      address: 'Test Village',
      notes: 'Test farmer'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.id) {
      newFarmerId = response.data.id;
      logTest('TC3.1.2: Create Farmer', true, `Created farmer ID: ${newFarmerId}`);
    } else {
      logTest('TC3.1.2: Create Farmer', false, 'No farmer ID returned');
    }
  } catch (error) {
    logTest('TC3.1.2: Create Farmer', false, error.message);
  }
  
  // Test 3.1.3: Update Farmer
  if (newFarmerId) {
    try {
      const response = await axios.patch(`${API_BASE}/farmers/${newFarmerId}`, {
        phone: '8888888888'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.phone === '8888888888') {
        logTest('TC3.1.3: Update Farmer', true);
      } else {
        logTest('TC3.1.3: Update Farmer', false, 'Phone not updated');
      }
    } catch (error) {
      logTest('TC3.1.3: Update Farmer', false, error.message);
    }
  }
  
  // Test 3.1.4: Delete Farmer
  if (newFarmerId) {
    try {
      await axios.delete(`${API_BASE}/farmers/${newFarmerId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('TC3.1.4: Delete Farmer', true);
    } catch (error) {
      logTest('TC3.1.4: Delete Farmer', false, error.message);
    }
  }
}

async function testRetailers() {
  console.log('\n🏪 Testing Retailers Management\n');
  
  // Test 3.2.1: Get All Retailers
  try {
    const response = await axios.get(`${API_BASE}/retailers`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (Array.isArray(response.data) && response.data.length >= 10) {
      logTest('TC3.2.1: Get All Retailers', true, `Found ${response.data.length} retailers`);
    } else {
      logTest('TC3.2.1: Get All Retailers', false, 'Not enough retailers');
    }
  } catch (error) {
    logTest('TC3.2.1: Get All Retailers', false, error.message);
  }
  
  // Test 3.2.2: Create Retailer
  let newRetailerId;
  try {
    const response = await axios.post(`${API_BASE}/retailers`, {
      name: `Test Shop ${Date.now()}`,
      ownerName: 'Test Owner',
      phone: '9999999999',
      email: `testshop${Date.now()}@example.com`,
      address: 'Test Address'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.id) {
      newRetailerId = response.data.id;
      logTest('TC3.2.2: Create Retailer', true, `Created retailer ID: ${newRetailerId}`);
    } else {
      logTest('TC3.2.2: Create Retailer', false, 'No retailer ID returned');
    }
  } catch (error) {
    logTest('TC3.2.2: Create Retailer', false, error.message);
  }
  
  // Test 3.2.3: Update Retailer
  if (newRetailerId) {
    try {
      const response = await axios.patch(`${API_BASE}/retailers/${newRetailerId}`, {
        phone: '8888888888'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.phone === '8888888888') {
        logTest('TC3.2.3: Update Retailer', true);
      } else {
        logTest('TC3.2.3: Update Retailer', false, 'Phone not updated');
      }
    } catch (error) {
      logTest('TC3.2.3: Update Retailer', false, error.message);
    }
  }
  
  // Test 3.2.4: Delete Retailer
  if (newRetailerId) {
    try {
      await axios.delete(`${API_BASE}/retailers/${newRetailerId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('TC3.2.4: Delete Retailer', true);
    } catch (error) {
      logTest('TC3.2.4: Delete Retailer', false, error.message);
    }
  }
}

async function testVehicles() {
  console.log('\n🚗 Testing Vehicles Management\n');
  
  // Test 3.3.1: Get All Vehicles
  try {
    const response = await axios.get(`${API_BASE}/vehicles`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (Array.isArray(response.data) && response.data.length >= 10) {
      logTest('TC3.3.1: Get All Vehicles', true, `Found ${response.data.length} vehicles`);
    } else {
      logTest('TC3.3.1: Get All Vehicles', false, 'Not enough vehicles');
    }
  } catch (error) {
    logTest('TC3.3.1: Get All Vehicles', false, error.message);
  }
  
  // Test 3.3.2: Create Vehicle
  let newVehicleId;
  try {
    const response = await axios.post(`${API_BASE}/vehicles`, {
      vehicleNumber: `MH-12-TEST-${Date.now().toString().slice(-4)}`,
      vehicleType: 'Van',
      driverName: 'Test Driver',
      phone: '9999999999',
      status: 'active'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (response.data.id) {
      newVehicleId = response.data.id;
      logTest('TC3.3.2: Create Vehicle', true, `Created vehicle ID: ${newVehicleId}`);
    } else {
      logTest('TC3.3.2: Create Vehicle', false, 'No vehicle ID returned');
    }
  } catch (error) {
    logTest('TC3.3.2: Create Vehicle', false, error.message);
  }
  
  // Test 3.3.3: Update Vehicle
  if (newVehicleId) {
    try {
      const response = await axios.patch(`${API_BASE}/vehicles/${newVehicleId}`, {
        driverName: 'Updated Driver'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (response.data.driverName === 'Updated Driver') {
        logTest('TC3.3.3: Update Vehicle', true);
      } else {
        logTest('TC3.3.3: Update Vehicle', false, 'Driver name not updated');
      }
    } catch (error) {
      logTest('TC3.3.3: Update Vehicle', false, error.message);
    }
  }
  
  // Test 3.3.4: Delete Vehicle
  if (newVehicleId) {
    try {
      await axios.delete(`${API_BASE}/vehicles/${newVehicleId}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      logTest('TC3.3.4: Delete Vehicle', true);
    } catch (error) {
      logTest('TC3.3.4: Delete Vehicle', false, error.message);
    }
  }
}

function printSummary() {
  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================\n');
  
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%\n`);
  
  if (results.failed > 0) {
    console.log('Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  ❌ ${t.name}`);
      if (t.message) console.log(`     ${t.message}`);
    });
    console.log('');
  }
  
  console.log('========================================\n');
}

async function main() {
  console.log('========================================');
  console.log('AUTOMATED API TESTING');
  console.log('========================================');
  console.log(`API Base URL: ${API_BASE}`);
  console.log('Make sure backend is running!\n');
  
  try {
    await testAuthentication();
    await testUserManagement();
    await testFarmers();
    await testRetailers();
    await testVehicles();
    
    printSummary();
    
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    process.exit(1);
  }
}

main();
