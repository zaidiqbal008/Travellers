import React, { createContext, useContext, useState, useEffect } from 'react';
import { bookingsAPI, tripsAPI } from '../utils/api';

const BookingsContext = createContext();

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};

export const BookingsProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('Fetching all bookings and trips...');
      
      // Fetch both test bookings and trips (no auth required)
      const [bookingsResponse, tripsResponse] = await Promise.all([
        bookingsAPI.getTestBookings(),
        tripsAPI.getTestTrips(),
      ]);
      
      console.log('Bookings response:', bookingsResponse.data);
      console.log('Trips response:', tripsResponse.data);
      
      // Combine bookings and trips into one array
      const allBookings = [
        ...bookingsResponse.data.map(booking => ({ ...booking, type: 'ride' })),
        ...tripsResponse.data.map(trip => ({ ...trip, type: 'tour' }))
      ];
      
      console.log('Combined bookings:', allBookings);
      setBookings(allBookings);
      
      if (allBookings.length === 0) {
        console.log('No bookings found');
      }
    } catch (error) {
      console.error('❌ Error fetching bookings from MongoDB:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate booking statistics
  const bookingStats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
    totalSpent: bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const value = {
    bookings,
    loading,
    error,
    bookingStats,
    fetchBookings
  };

  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  );
}; 