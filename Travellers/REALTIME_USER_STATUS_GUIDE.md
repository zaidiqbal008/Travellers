# Real-Time User Status Tracking System

## Overview

This feature implements real-time user status tracking in the admin panel. When users log in, their status shows as "Active" and when they log out or disconnect, it shows as "Inactive". This works in real-time across different browsers and devices.

## Features

### ✅ Real-Time Status Updates
- Users automatically show as "Active" when they log in
- Status changes to "Inactive" when users log out or disconnect
- Real-time updates across all connected admin panels
- Works across different browsers and devices

### ✅ Activity Tracking
- Automatic activity pings every 30 seconds to keep users active
- Session management in MongoDB
- Graceful handling of disconnections

### ✅ Admin Panel Integration
- Real-time status display in the Users management page
- Visual indicators (green for active, gray for inactive)
- Live updates without page refresh

## Technical Implementation

### Backend (Node.js + Socket.IO)

#### 1. Server Setup (`backend/server.js`)
```javascript
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

// Store active users in memory
const activeUsers = new Map();
```

#### 2. Socket.IO Event Handlers
- `user_login`: Marks user as active
- `user_logout`: Marks user as inactive
- `activity_ping`: Keeps user active
- `get_active_users`: Returns list of active users
- `disconnect`: Handles unexpected disconnections

#### 3. Authentication Integration (`backend/routes/auth.js`)
- Emits Socket.IO events on login/logout
- Updates user sessions in MongoDB

### Frontend (React + Socket.IO Client)

#### 1. Socket Context (`frontend/src/contexts/SocketContext.js`)
- Manages Socket.IO connection
- Provides real-time status updates
- Handles user activity tracking

#### 2. Activity Ping Hook (`frontend/src/hooks/useActivityPing.js`)
- Sends periodic activity pings
- Keeps users active while using the app
- Automatic cleanup on component unmount

#### 3. Admin Panel Integration (`frontend/src/Components/Admin/AdminUser.js`)
- Displays real-time user status
- Updates automatically when users connect/disconnect
- Visual status indicators

## Usage

### For Users
1. **Login**: User status automatically becomes "Active"
2. **Using the app**: Status remains "Active" through activity pings
3. **Logout**: Status changes to "Inactive"
4. **Disconnect**: Status changes to "Inactive" after timeout

### For Admins
1. **View Users**: Go to Admin Panel → Users
2. **Real-time Status**: See live status of all users
3. **Visual Indicators**: 
   - 🟢 Green chip = Active user
   - ⚪ Gray chip = Inactive user

## API Endpoints

### Socket.IO Events

#### Client → Server
- `user_login`: `{ userId, userType, username }`
- `user_logout`: `{ userId }`
- `activity_ping`: `{ userId }`
- `get_active_users`: No data

#### Server → Client
- `user_status_changed`: `{ userId, status, userType, username }`
- `active_users_list`: `Array of active users`

### REST API
- `GET /api/admin/active-users`: Get list of active users

## Configuration

### Environment Variables
```env
# Backend
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Frontend
REACT_APP_API_URL=http://localhost:5001
```

### Socket.IO Settings
- **CORS**: Configured for localhost:3000
- **Transports**: WebSocket with polling fallback
- **Credentials**: Enabled for authentication

## Testing

### Manual Testing
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Open admin panel in multiple browsers
4. Login with different users
5. Observe real-time status updates

### Automated Testing
```bash
# Test Socket.IO functionality
node test-socket.js
```

## Troubleshooting

### Common Issues

#### 1. Users not showing as active
- Check Socket.IO connection in browser console
- Verify user authentication
- Check activity ping intervals

#### 2. Status not updating in real-time
- Ensure Socket.IO context is properly wrapped
- Check for CORS issues
- Verify event emission/reception

#### 3. Disconnections not detected
- Check network connectivity
- Verify Socket.IO heartbeat settings
- Check server logs for errors

### Debug Mode
Enable debug logging in Socket.IO:
```javascript
const socket = io('http://localhost:5001', {
  debug: true
});
```

## Security Considerations

### Authentication
- All Socket.IO events require user authentication
- JWT tokens validated on server
- Session management in MongoDB

### Data Protection
- User IDs only, no sensitive data transmitted
- Secure WebSocket connections
- CORS properly configured

### Rate Limiting
- Activity pings limited to 30-second intervals
- Server-side validation of all events
- Protection against spam events

## Performance Optimization

### Memory Management
- Active users stored in Map for O(1) access
- Automatic cleanup on disconnect
- Session cleanup in MongoDB

### Network Efficiency
- Minimal data transmission
- Efficient event handling
- Connection pooling

## Future Enhancements

### Planned Features
- [ ] User activity timestamps
- [ ] Last seen information
- [ ] User location tracking
- [ ] Activity analytics
- [ ] Push notifications for status changes

### Scalability
- [ ] Redis for session storage
- [ ] Load balancing for Socket.IO
- [ ] Cluster mode support
- [ ] Database optimization

## Dependencies

### Backend
```json
{
  "socket.io": "^4.7.0",
  "express": "^4.18.2",
  "mongoose": "^7.5.0"
}
```

### Frontend
```json
{
  "socket.io-client": "^4.7.0",
  "react": "^18.2.0"
}
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Socket.IO connection status
3. Review server logs
4. Test with multiple browsers/devices

---

**Note**: This feature requires both backend and frontend to be running for full functionality. 