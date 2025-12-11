import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  /*
  headers: {
    'Content-Type': 'application/json',
  },
  */
  withCredentials: true // Enable cookies for session management
});

// Request interceptor to add auth token from cookies
api.interceptors.request.use(
  (config) => {
    // Token will be automatically sent via cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - but not redirecting to avoid loops
      console.log('401 error detected, but not redirecting to avoid loops');
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => {
    console.log('🔄 API: Sending reset password request');
    console.log('URL:', `/auth/reset-password/${token}`);
    console.log('Password:', password);
    console.log('Password length:', password.length);
    return api.post(`/auth/reset-password/${token}`, { password });
  },
};

// MyBookings API calls
export const myBookingsAPI = {
  createBooking: (bookingData) => api.post('/mybookings', bookingData),
  getBookings: () => api.get('/mybookings'),
  getUserBookings: () => api.get('/mybookings'),
  getDriverBookings: () => api.get('/mybookings/driver'),
  getBooking: (id) => api.get(`/mybookings/${id}`),
  updateBooking: (id, bookingData) => api.put(`/mybookings/${id}`, bookingData),
  deleteBooking: (id) => api.delete(`/mybookings/${id}`),
  generateReceipt: (id) => api.post(`/mybookings/${id}/generate-receipt`),
  downloadReceipt: (id) => api.get(`/mybookings/${id}/download-receipt`, { responseType: 'blob' }),
  updatePayment: (id, paymentData) => api.post(`/mybookings/${id}/update-payment`, paymentData),
};

// Bookings API calls
export const bookingsAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getBookings: () => api.get('/bookings'),
  getBooking: (id) => api.get(`/bookings/${id}`),
  updateBooking: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
  // Test endpoints for development
  createTestBooking: (bookingData) => api.post('/bookings/test', bookingData),
  getTestBookings: () => api.get('/bookings/test'),
};

// Trips API calls
export const tripsAPI = {
  createTrip: (tripData) => api.post('/trips', tripData),
  getTrips: () => api.get('/trips'),
  getTrip: (id) => api.get(`/trips/${id}`),
  updateTrip: (id, tripData) => api.put(`/trips/${id}`, tripData),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
  // Test endpoints for development
  createTestTrip: (tripData) => api.post('/trips/test', tripData),
  getTestTrips: () => api.get('/trips/test'),
};

// Contacts API calls
export const contactsAPI = {
  submitContact: (contactData) => api.post('/contacts', contactData),
  submitContactWithUser: (contactData) => api.post('/contacts/user', contactData),
  getContacts: () => api.get('/contacts'),
  updateContact: (id, contactData) => api.put(`/contacts/${id}`, contactData),
};

// Feedback API calls
export const feedbackAPI = {
  submitFeedback: (feedbackData) => api.post('/feedback', feedbackData),
  submitFeedbackWithUser: (feedbackData) => api.post('/feedback/user', feedbackData),
  getFeedback: () => api.get('/feedback'),
  deleteFeedback: (id) => api.delete(`/feedback/${id}`),
};

// Sessions API calls
export const sessionsAPI = {
  createSession: () => api.post('/sessions'),
  getSession: () => api.get('/sessions'),
  logout: () => api.delete('/sessions'),
  getAllSessions: () => api.get('/sessions/all'),
};

// Reviews API calls
export const reviewsAPI = {
  createReview: (reviewData) => api.post('/reviews', reviewData),
  getReviews: () => api.get('/reviews'),
  getReview: (id) => api.get(`/reviews/${id}`),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// UserProfile API calls
export const userProfileAPI = {
  getProfile: () => api.get('/userprofile'),
  updateProfile: (profileData) => api.put('/userprofile', profileData),
  logActivity: (activityData) => api.post('/userprofile/activity', activityData),
  getDriverProfile: (driverId) => api.get(`/userprofile/driver/${driverId}`),
  updateDriverRating: (driverId, rating) => api.put('/userprofile/driver/rating', { driverId, rating }),
  uploadProfilePic: (formData) => api.post('/userprofile/profile-pic', formData),
  removeProfilePic: () => api.delete('/userprofile/profile-pic'),
};



// Users API calls
export const usersAPI = {
  getUsersByType: (type) => api.get(`/users?type=${type}`),
};

// Admin API calls
export const adminAPI = {
  getAllBookings: () => api.get('/bookings/all'),
  getAllTrips: () => api.get('/trips/all'),
  assignBookingToDriver: (bookingId, driverId) => api.put(`/admin/bookings/${bookingId}/assign`, { driverId }),
  assignTripToDriver: (tripId, driverId) => api.put(`/admin/trips/${tripId}/assign`, { driverId }),
  updateBookingStatus: (bookingId, status) => api.put(`/admin/bookings/${bookingId}/status`, { status }),
  updateTripStatus: (tripId, status) => api.put(`/admin/trips/${tripId}/status`, { status }),
  getDriverBookings: (driverId) => api.get(`/admin/drivers/${driverId}/bookings`),
};

// Driver API calls
export const driverAPI = {
  updateBookingStatus: (bookingId, status) => api.put(`/admin/bookings/${bookingId}/driver-status`, { status }),
};

// Car API calls for driver
export const carAPI = {
  getCars: () => api.get('/userprofile/cars'),
  addCar: (formData) => api.post('/userprofile/cars', formData),
  updateCar: (carId, formData) => api.put(`/userprofile/cars/${carId}`, formData),
  deleteCar: (carId) => api.delete(`/userprofile/cars/${carId}`),
};

// Payments API calls
export const paymentsAPI = {
  createCarSession: (data) => api.post('/payments/create-car-session', data),
  createTourSession: (data) => api.post('/payments/create-tour-session', data),
  getPaymentStatus: (bookingId, type) => api.get(`/payments/payment-status/${bookingId}?type=${type}`),
  processRefund: (bookingId, data) => api.post(`/payments/refund/${bookingId}`, data),
  verifyPayment: (sessionId) => api.post(`/payments/verify-payment/${sessionId}`),
  getUserTransactions: () => api.get('/payments/user-transactions'),
  getAllTransactions: (params) => api.get('/payments/transactions', { params }),
  getTransaction: (transactionId) => api.get(`/payments/transaction/${transactionId}`),
  getStatistics: () => api.get('/payments/statistics'),
};

// Chat API calls
export const chatAPI = {
  sendMessage: (messageData) => api.post('/chat/send', messageData),
  getHistory: (params) => api.get('/chat/history', { params }),
  getFAQResponse: (question) => api.post('/chat/faq', { question }),
};

export default api; 