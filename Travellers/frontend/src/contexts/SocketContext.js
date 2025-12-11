import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    // Create socket connection
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 5000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.log('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    newSocket.on('reconnect_error', (error) => {
      console.log('Socket reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.log('Socket reconnection failed');
    });

    // Handle user status changes
    newSocket.on('user_status_changed', (data) => {
      console.log('User status changed:', data);
      setActiveUsers(prevUsers => {
        const existingUserIndex = prevUsers.findIndex(user => user.userId === data.userId);
        
        if (existingUserIndex !== -1) {
          // Update existing user
          const updatedUsers = [...prevUsers];
          updatedUsers[existingUserIndex] = {
            ...updatedUsers[existingUserIndex],
            status: data.status,
            lastActivity: new Date()
          };
          return updatedUsers;
        } else if (data.status === 'active') {
          // Add new active user
          return [...prevUsers, {
            userId: data.userId,
            username: data.username,
            userType: data.userType,
            status: data.status,
            lastActivity: new Date()
          }];
        }
        
        return prevUsers;
      });
    });

    // Handle active users list
    newSocket.on('active_users_list', (users) => {
      console.log('Active users list received:', users);
      setActiveUsers(users);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Function to emit user login
  const emitUserLogin = (userData) => {
    if (socket && isConnected) {
      socket.emit('user_login', {
        userId: userData.id,
        userType: userData.userType,
        username: userData.username
      });
    }
  };

  // Function to emit user logout
  const emitUserLogout = (userId) => {
    if (socket && isConnected) {
      socket.emit('user_logout', { userId });
    }
  };

  // Function to get active users (for admin)
  const getActiveUsers = () => {
    if (socket && isConnected) {
      socket.emit('get_active_users');
    }
  };

  // Function to send activity ping
  const sendActivityPing = (userId) => {
    if (socket && isConnected) {
      socket.emit('activity_ping', { userId });
    }
  };

  const value = {
    socket,
    isConnected,
    activeUsers,
    emitUserLogin,
    emitUserLogout,
    getActiveUsers,
    sendActivityPing
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 