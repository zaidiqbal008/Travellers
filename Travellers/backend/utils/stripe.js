const Stripe = require('stripe');

// Get Stripe secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe only if key is provided
let stripe = null;

if (stripeSecretKey) {
  stripe = Stripe(stripeSecretKey);
} else {
  console.warn('WARNING: STRIPE_SECRET_KEY environment variable is not set. Stripe functionality will be disabled.');
  // Create a stub object that throws helpful errors when Stripe methods are called
  const stripeError = () => {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable in your .env file.');
  };
  
  stripe = {
    checkout: {
      sessions: {
        create: stripeError,
        retrieve: stripeError
      }
    }
  };
}

module.exports = stripe; 