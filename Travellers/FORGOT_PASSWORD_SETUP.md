# Forgot Password Setup Guide

## Overview
The forgot password functionality has been successfully implemented in the Travellers application. This includes:

1. **Frontend Components:**
   - `ForgotPassword.js` - Page for requesting password reset
   - `ResetPassword.js` - Page for setting new password
   - Updated `Login.js` - Added "Forgot Password?" link
   - Updated `App.js` - Added routes for new pages
   - Updated `api.js` - Added API calls for password reset

2. **Backend Features:**
   - Password reset token generation
   - Email sending functionality
   - Token validation and password reset
   - User model with password reset fields

## Environment Variables Required

## Email Setup Instructions

### For Gmail:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password in `EMAIL_PASSWORD`

### For Other Email Providers:
Update the email service configuration in `backend/utils/emailService.js` with your provider's SMTP settings.

## How It Works

1. **Request Password Reset:**
   - User clicks "Forgot Password?" on login page
   - User enters email address
   - System generates a reset token and sends email
   - Token expires in 1 hour

2. **Reset Password:**
   - User clicks link in email
   - User enters new password and confirmation
   - System validates token and updates password
   - User is redirected to login page

## Features

- ✅ Email validation
- ✅ Password strength validation (minimum 6 characters)
- ✅ Password confirmation matching
- ✅ Secure token generation
- ✅ Token expiration (1 hour)
- ✅ User-friendly error messages
- ✅ Loading states and progress indicators
- ✅ Responsive design matching app theme
- ✅ Automatic redirects after successful operations

## Testing

1. Start the backend server: `cd backend && npm start`
2. Start the frontend: `cd frontend && npm start`
3. Navigate to login page
4. Click "Forgot Password?"
5. Enter a valid email address
6. Check email for reset link
7. Click link and set new password

## Security Features

- Tokens are cryptographically secure (32-byte random)
- Tokens expire after 1 hour
- Tokens are single-use (deleted after password reset)
- Email addresses are validated
- Passwords are hashed using bcrypt
- All API endpoints are properly validated

## Troubleshooting

### Email Not Sending:
- Check email credentials in `.env`
- Verify Gmail app password is correct
- Check if 2FA is enabled on Gmail account

### Token Not Working:
- Ensure `FRONTEND_URL` is correct in `.env`
- Check if token has expired (1 hour limit)
- Verify MongoDB connection

### Frontend Issues:
- Ensure all routes are properly added to `App.js`
- Check browser console for errors
- Verify API endpoints are accessible 