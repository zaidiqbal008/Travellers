const mongoose = require('mongoose');
const User = require('./models/User');
const { cleanupDemoUsers } = require('./utils/demoUserManager');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/travellers', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function cleanupDuplicateDemoUsers() {
  try {
    console.log('🧹 Cleaning up duplicate demo users...\n');

    // Find all demo users
    const demoUsers = await User.find({ email: /^demo/ });
    console.log(`Found ${demoUsers.length} demo users in database`);

    if (demoUsers.length === 0) {
      console.log('✅ No demo users found to clean up');
      return;
    }

    // Group by email to find duplicates
    const emailGroups = {};
    demoUsers.forEach(user => {
      if (!emailGroups[user.email]) {
        emailGroups[user.email] = [];
      }
      emailGroups[user.email].push(user);
    });

    let totalDeleted = 0;

    // Process each email group
    for (const [email, users] of Object.entries(emailGroups)) {
      if (users.length > 1) {
        console.log(`\n📧 Found ${users.length} users with email: ${email}`);
        
        // Sort by creation date (newest first)
        users.sort((a, b) => b.createdAt - a.createdAt);
        
        // Keep the most recent one, delete the rest
        const usersToDelete = users.slice(1);
        
        console.log(`   Keeping: ${users[0]._id} (created: ${users[0].createdAt})`);
        
        for (const user of usersToDelete) {
          console.log(`   Deleting: ${user._id} (created: ${user.createdAt})`);
          await User.findByIdAndDelete(user._id);
          totalDeleted++;
        }
      }
    }

    console.log(`\n✅ Cleanup completed!`);
    console.log(`   - Total users processed: ${demoUsers.length}`);
    console.log(`   - Total users deleted: ${totalDeleted}`);
    console.log(`   - Remaining demo users: ${demoUsers.length - totalDeleted}`);

    // Show remaining demo users
    const remainingUsers = await User.find({ email: /^demo/ });
    if (remainingUsers.length > 0) {
      console.log('\n📋 Remaining demo users:');
      remainingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - ${user.username} - ${user._id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the cleanup
cleanupDuplicateDemoUsers(); 