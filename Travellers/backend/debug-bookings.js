const mongoose = require('mongoose');
const axios = require('axios');

async function debugBookings() {
  console.log('🔍 Debugging Bookings Issue...\n');

  try {
    // Step 1: Check database directly
    console.log('1. Checking database directly...');
    await mongoose.connect('mongodb://localhost:27017/travellers');
    
    const bookings = await mongoose.connection.db.collection('ride booking').find({}).toArray();
    console.log(`✅ Found ${bookings.length} bookings in database:`);
    bookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.carName} - ${booking.customerName} - ${booking.bookingNumber}`);
    });

    // Step 2: Check if there are any users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`\n2. Found ${users.length} users in database:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} (${user.userType}) - ID: ${user._id}`);
    });

    // Step 3: Test the API endpoint
    console.log('\n3. Testing API endpoint...');
    try {
      const response = await axios.get('http://localhost:5001/api/bookings/user', {
        headers: {
          'Cookie': 'token=test-token' // You might need to adjust this
        }
      });
      console.log('✅ API Response:', response.data);
    } catch (apiError) {
      console.log('❌ API Error:', apiError.response?.status, apiError.response?.data);
    }

    // Step 4: Check if backend server is running
    console.log('\n4. Checking if backend server is running...');
    try {
      const healthResponse = await axios.get('http://localhost:5001/api/auth/test');
      console.log('✅ Backend server is running');
    } catch (healthError) {
      console.log('❌ Backend server not running or not accessible');
    }

    console.log('\n💡 Possible Issues:');
    console.log('   1. Backend server not running on port 5001');
    console.log('   2. Authentication issue - user not logged in');
    console.log('   3. API endpoint not working correctly');
    console.log('   4. Database connection issue');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

debugBookings(); 