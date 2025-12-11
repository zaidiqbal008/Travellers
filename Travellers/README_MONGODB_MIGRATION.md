# MongoDB Migration - localStorage to MongoDB

This document outlines the migration from localStorage to MongoDB for data persistence in the Travellers application.

## Overview

The application has been updated to store all data in MongoDB instead of using localStorage. This provides better data persistence, security, and scalability.

## Changes Made

### Backend Changes

#### New Models Created

1. **Booking.js** - Stores ride booking data
   - User reference
   - Car details
   - Pickup/drop locations
   - Date, time, passengers
   - Total amount and status

2. **Contact.js** - Stores contact form submissions
   - User reference (optional)
   - Name, email, subject, message
   - Status tracking

3. **Feedback.js** - Stores feedback and newsletter subscriptions
   - User reference (optional)
   - Email, feedback text, rating
   - Timestamp

4. **UserSession.js** - Manages user sessions
   - User reference
   - Token and user type
   - Session status and activity tracking

#### New Routes Created

1. **/api/bookings** - CRUD operations for ride bookings
2. **/api/contacts** - Contact form submissions
3. **/api/feedback** - Feedback and newsletter subscriptions
4. **/api/sessions** - User session management

### Frontend Changes

#### New API Utility

Created `src/utils/api.js` with centralized API calls:
- Authentication API
- Bookings API
- Trips API
- Contacts API
- Feedback API
- Sessions API
- Reviews API

#### Updated Components

1. **Login.js** - Now creates MongoDB sessions on login
2. **RideBookingForm.js** - Stores booking data in MongoDB
3. **TourBookingForm.js** - Stores tour bookings in MongoDB
4. **CustomerContact.js** - Stores contact form data in MongoDB
5. **Customer.js** - Stores feedback in MongoDB
6. **Header Components** - Use MongoDB session management for logout

## Data Migration

### What was stored in localStorage:

1. **User Authentication**
   - `token` - JWT token
   - `currentUser` - User data
   - `userToken`, `userData`, `customerInfo`, `driverInfo`, `adminToken`

2. **Booking Data**
   - `bookingData` - Ride booking form data
   - `tourBookingData` - Tour booking form data
   - `selectedCar` - Selected car for booking

3. **Contact Data**
   - `contactFormData` - Contact form submissions

4. **Feedback Data**
   - `feedbackEmails` - Newsletter subscriptions

5. **Tour Selection**
   - `selectedTour` - Selected tour for booking

### What is now stored in MongoDB:

1. **User Sessions** - Active user sessions with tokens
2. **Bookings** - Complete ride booking records
3. **Trips** - Tour booking records
4. **Contacts** - Contact form submissions
5. **Feedback** - Newsletter subscriptions and feedback

## Benefits

1. **Data Persistence** - Data survives browser clearing and device changes
2. **Security** - Sensitive data not stored in browser
3. **Scalability** - Can handle multiple users and devices
4. **Analytics** - Can track usage patterns and user behavior
5. **Backup** - Data can be backed up and restored
6. **Multi-device** - Users can access data from different devices

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/me` - Get current user

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get specific booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Trips
- `POST /api/trips` - Create trip booking
- `GET /api/trips` - Get user trips
- `GET /api/trips/:id` - Get specific trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Contacts
- `POST /api/contacts` - Submit contact form (public)
- `POST /api/contacts/user` - Submit contact form (authenticated)
- `GET /api/contacts` - Get all contacts (admin only)
- `PUT /api/contacts/:id` - Update contact status (admin only)

### Feedback
- `POST /api/feedback` - Submit feedback (public)
- `POST /api/feedback/user` - Submit feedback (authenticated)
- `GET /api/feedback` - Get all feedback (admin only)
- `DELETE /api/feedback/:id` - Delete feedback (admin only)

### Sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions` - Get current session
- `DELETE /api/sessions` - Logout (deactivate session)
- `GET /api/sessions/all` - Get all active sessions (admin only)

## Setup Instructions

1. Ensure MongoDB is running and connected
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. Start the backend server: `npm start` (in backend directory)
5. Start the frontend: `npm start` (in frontend directory)

## Notes

- localStorage is still used for JWT tokens and current user data for backward compatibility
- Session management now tracks active sessions in MongoDB
- All form submissions are now stored in the database
- Admin can view and manage all data through the admin panel
- Error handling has been improved with proper notifications 