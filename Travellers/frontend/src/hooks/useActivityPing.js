import { useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';

export const useActivityPing = (userId) => {
  const { sendActivityPing } = useSocket();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Send activity ping every 30 seconds to keep user active
    intervalRef.current = setInterval(() => {
      sendActivityPing(userId);
    }, 30000);

    // Send initial ping
    sendActivityPing(userId);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, sendActivityPing]);

  return null;
}; 