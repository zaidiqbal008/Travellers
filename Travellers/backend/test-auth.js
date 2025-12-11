const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication...\n');
    
    // Test login with customer account
    console.log('📝 Testing customer login...');
    const loginData = {
      email: 'customer@gmail.com',
      password: '123456789'
    };
    
    console.log('🔗 Login URL:', `${API_BASE}/auth/login`);
    console.log('📋 Login Data:', loginData);
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, loginData);
    console.log('✅ Login successful!');
    console.log('📊 Response:', loginResponse.data);
    
    // Test getting current user
    console.log('\n👤 Testing get current user...');
    
    // Create axios instance with cookies
    const axiosWithCookies = axios.create({
      baseURL: API_BASE,
      withCredentials: true
    });
    
    const userResponse = await axiosWithCookies.get('/auth/me');
    console.log('✅ Get user successful!');
    console.log('📊 User data:', userResponse.data);
    
  } catch (error) {
    console.error('❌ Auth Test Failed:', error.message);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
    }
  }
}

testAuth(); 