const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const UserSession = require('./models/UserSession');

// Load environment variables
dotenv.config();

// Debug: Log the current working directory and .env file path
console.log('Current working directory:', process.cwd());
console.log('.env file path:', path.resolve(process.cwd(), '.env'));
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

// Store active users for real-time status
const activeUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user login
  socket.on('user_login', async (data) => {
    try {
      const { userId, userType, username } = data;
      
      // Store user as active
      activeUsers.set(userId, {
        socketId: socket.id,
        userType,
        username,
        lastActivity: new Date()
      });

      // Update session in database
      await UserSession.findOneAndUpdate(
        { user: userId, isActive: true },
        { 
          isActive: true,
          lastActivity: new Date()
        },
        { upsert: true }
      );

      // Broadcast to all clients that user is now active
      socket.broadcast.emit('user_status_changed', {
        userId,
        status: 'active',
        userType,
        username
      });

      console.log(`User ${username} (${userId}) is now active`);
    } catch (error) {
      console.error('Error handling user login:', error);
    }
  });

  // Handle user logout
  socket.on('user_logout', async (data) => {
    try {
      const { userId } = data;
      
      // Remove user from active users
      const userData = activeUsers.get(userId);
      if (userData) {
        activeUsers.delete(userId);
        
        // Update session in database
        await UserSession.findOneAndUpdate(
          { user: userId, isActive: true },
          { isActive: false }
        );

        // Broadcast to all clients that user is now inactive
        socket.broadcast.emit('user_status_changed', {
          userId,
          status: 'inactive',
          userType: userData.userType,
          username: userData.username
        });

        console.log(`User ${userData.username} (${userId}) is now inactive`);
      }
    } catch (error) {
      console.error('Error handling user logout:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);
    
    // Find and remove user from active users
    for (const [userId, userData] of activeUsers.entries()) {
      if (userData.socketId === socket.id) {
        activeUsers.delete(userId);
        
        // Update session in database
        await UserSession.findOneAndUpdate(
          { user: userId, isActive: true },
          { isActive: false }
        );

        // Broadcast to all clients that user is now inactive
        socket.broadcast.emit('user_status_changed', {
          userId,
          status: 'inactive',
          userType: userData.userType,
          username: userData.username
        });

        console.log(`User ${userData.username} (${userId}) disconnected and is now inactive`);
        break;
      }
    }
  });

  // Handle activity ping (keep user active)
  socket.on('activity_ping', async (data) => {
    try {
      const { userId } = data;
      const userData = activeUsers.get(userId);
      
      if (userData) {
        userData.lastActivity = new Date();
        activeUsers.set(userId, userData);
        
        // Update session in database
        await UserSession.findOneAndUpdate(
          { user: userId, isActive: true },
          { lastActivity: new Date() }
        );
      }
    } catch (error) {
      console.error('Error handling activity ping:', error);
    }
  });

  // Send active users list to admin
  socket.on('get_active_users', () => {
    const activeUsersList = Array.from(activeUsers.entries()).map(([userId, userData]) => ({
      userId,
      username: userData.username,
      userType: userData.userType,
      status: 'active',
      lastActivity: userData.lastActivity
    }));
    
    socket.emit('active_users_list', activeUsersList);
  });
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/users', require('./routes/users'));
app.use('/api/userprofile', require('./routes/userProfile'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

// API endpoint to get active users (for admin panel)
app.get('/api/admin/active-users', async (req, res) => {
  try {
    const activeUsersList = Array.from(activeUsers.entries()).map(([userId, userData]) => ({
      userId,
      username: userData.username,
      userType: userData.userType,
      status: 'active',
      lastActivity: userData.lastActivity
    }));
    
    res.json({ activeUsers: activeUsersList });
  } catch (error) {
    console.error('Error getting active users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export io for use in other files
module.exports = { io, activeUsers }; 