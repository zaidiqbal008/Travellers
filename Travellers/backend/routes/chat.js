const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const auth = require('../middleware/auth');

// FAQ responses for the chatbot
const FAQ_RESPONSES = {
  'How do I book a ride?': 'To book a ride, go to the "Book Your Ride" section and fill out the form with your details including pickup/drop locations, date, time, and vehicle preference. You can choose from various car types like Corolla Altis, Camry, Fortuner, Mercedes E-Class, and more. Payment is processed securely through Stripe.',
  
  'What payment methods are accepted?': 'We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure Stripe payment gateway. All payments are processed securely and you\'ll receive a digital receipt immediately after payment.',
  
  'How can I contact support?': 'You can contact our support team through the Contact Us page, or use this chatbot for immediate assistance. For urgent matters, you can also reach us via phone or email. Our customer service team is available 24/7.',
  
  'How do I view my booking history?': 'You can view your booking history in your customer profile dashboard. All your past and current bookings are listed there with detailed information including booking status, payment confirmation, and downloadable receipts.',
  
  'How do I update my profile?': 'To update your profile, go to your customer dashboard and click on "Profile Settings". You can update your personal information, contact details, and profile picture. Changes are saved automatically.',
  
  'How do I cancel a booking?': 'To cancel a booking, go to your booking history in your profile dashboard. Click on the specific booking and look for the cancel option. Please note that cancellation policies may apply depending on the timing of your cancellation.',
  
  'What are the available car types?': 'We offer a wide range of vehicles: Economy (Corolla Altis, Honda BR-V), Luxury (Camry, Mark-X), Premium (Mercedes E-Class, Audi A6), SUV (Fortuner, Peugeot 3008), and Classic (Mercedes W210). Each vehicle has different pricing and passenger capacity.',
  
  'How do I become a driver?': 'To become a driver, you need to register as a driver account and provide necessary documentation including your driver\'s license, vehicle registration, and insurance. Our team will review your application and contact you for verification.',
  
  'How do I reset my password?': 'To reset your password, go to the login page and click "Forgot Password". Enter your email address and you\'ll receive a password reset link. Click the link in your email to set a new password.',
  
  'What is the refund policy?': 'Our refund policy depends on the timing of cancellation. Full refunds are available for cancellations made 24 hours before the scheduled ride. Partial refunds may be available for cancellations made within 24 hours. Contact our support team for specific cases.',
  
  'What tour packages do you offer?': 'We offer exciting tour packages to various destinations: Naran Kaghan Tour, Abbottabad Tour, Azad Kashmir Tour, Harnoi Waterfall Tour, Ayubia Pipeline Tour, and Nathia Gali Tour. Each tour has different pricing based on vehicle type and group size.',
  
  'How do I book a tour?': 'To book a tour, visit our Tours section and select your preferred destination. Choose your vehicle type and group size. Fill out the booking form with your details and proceed to payment. You\'ll receive a confirmation and detailed itinerary.',
  
  'What is included in tour packages?': 'Our tour packages include transportation, professional driver, fuel costs, and basic insurance. Some packages may include additional services like guide fees or entrance tickets. Check the specific tour details for complete information.',
  
  'Can I modify my booking after payment?': 'Yes, you can modify your booking details like pickup time or location by contacting our support team. However, changes may be subject to availability and additional charges may apply depending on the modification.',
  
  'How do I download my booking receipt?': 'After successful payment, you can download your receipt from the payment success dialog or from your booking history. All receipts are available as PDF files and can be downloaded anytime from your profile dashboard.',
  
  'What if my driver doesn\'t show up?': 'If your driver doesn\'t show up within 15 minutes of the scheduled time, please contact our support team immediately. We\'ll arrange an alternative vehicle or provide a full refund as per our service guarantee.',
  
  'Do you provide airport transfers?': 'Yes, we provide airport transfer services. You can book airport pickups and drop-offs through our ride booking system. Please provide your flight details and we\'ll ensure timely service.',
  
  'What safety measures do you have?': 'All our drivers are verified and background-checked. Vehicles are regularly inspected and insured. We have 24/7 customer support and real-time tracking for your safety and peace of mind.',
  
  'Can I book for someone else?': 'Yes, you can book rides for others. Simply provide their name and contact details in the booking form. The person traveling will receive confirmation details and can contact the driver directly.',
  
  'What are your operating hours?': 'Our booking system is available 24/7. Ride services are available throughout the day and night, though availability may vary by location and time. Tour packages have specific departure times which are clearly mentioned.',
  
  'Do you provide child seats?': 'Yes, we can provide child seats upon request. Please mention this requirement in your booking message or contact our support team in advance to ensure availability.',
  
  'What if I need to change my pickup location?': 'You can change your pickup location by contacting our support team or driver directly. Changes made well in advance are usually accommodated without additional charges, but last-minute changes may incur fees.',
  
  'What are the car prices?': 'Our car prices vary by vehicle type: Corolla Altis (Rs. 20/km), Camry (Rs. 35/km), Fortuner (Rs. 35/km), Mercedes E-Class (Rs. 50/km), Audi A6 (Rs. 65/km), Mercedes W210 (Rs. 35/km), Peugeot 3008 (Rs. 50/km), Mark-X (Rs. 100/km), and Honda BR-V (Rs. 35/km).',
  
  'How much do tours cost?': 'Tour costs vary by destination and vehicle type. For example: Naran Kaghan Tour (Alto: Rs. 3000/person, Corolla/Swift: Rs. 1800/person), Abbottabad Tour (Hulix: Rs. 2500/person, BJ40/Jeep: Rs. 1800/person). Check our Tours section for complete pricing.',
  
  'What is the cancellation fee?': 'Cancellation fees depend on timing: Free cancellation up to 24 hours before the ride, 25% fee for cancellations 12-24 hours before, 50% fee for cancellations 2-12 hours before, and no refund for cancellations within 2 hours.',
  
  'Do you have luxury cars?': 'Yes, we offer luxury vehicles including Mercedes E-Class, Audi A6, and Mark-X. These premium vehicles come with enhanced comfort and professional drivers. Pricing starts from Rs. 50/km for luxury vehicles.',
  
  'Can I book multiple cars?': 'Yes, you can book multiple cars for group travel. Simply make separate bookings for each vehicle or contact our support team for group booking arrangements and potential discounts.',
  
  'What documents do I need to book?': 'For booking, you need to provide your name, phone number, and pickup/drop locations. No additional documents are required for the booking process. Payment is processed securely through our payment gateway.',
  
  'Do you provide round-trip service?': 'Yes, we provide round-trip services. You can book both pickup and return journeys in a single booking or make separate bookings. Round-trip bookings may qualify for discounted rates.',
  
  'What if I need to extend my booking?': 'You can extend your booking by contacting our support team or driver directly. Additional charges will apply based on the extension time and vehicle type. It\'s best to inform us in advance when possible.',
  
  'Do you have SUVs for large groups?': 'Yes, we have SUVs like Fortuner and Peugeot 3008 that can accommodate larger groups. These vehicles can carry 4-6 passengers with luggage. Contact us for specific group requirements.',
  
  'What payment security do you have?': 'We use Stripe payment gateway which is PCI DSS compliant and provides bank-level security. All payment information is encrypted and we never store your credit card details on our servers.',
  
  'Can I get a receipt for business expenses?': 'Yes, all bookings generate digital receipts that can be used for business expense purposes. Receipts include booking details, payment confirmation, and can be downloaded as PDF files.',
  
  'Do you provide corporate services?': 'Yes, we provide corporate transportation services including regular employee transport, client pickup, and business travel. Contact our support team for corporate account setup and special pricing.'
};

// Send a chat message
// POST /api/chat/send
router.post('/send', auth, async (req, res) => {
  try {
    const { receiverId, message, conversationType, role } = req.body;
    const senderId = req.user.id;
    const participants = [senderId, receiverId];

    const chatMessage = new ChatMessage({
      participants,
      sender: senderId,
      receiver: receiverId,
      role, // sender's role
      message,
      conversationType
    });
    await chatMessage.save();
    res.status(201).json({ success: true, chatMessage });
  } catch (error) {
    console.error('Send chat error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get FAQ response for chatbot
// POST /api/chat/faq
router.post('/faq', auth, async (req, res) => {
  try {
    const { question } = req.body;
    
    // Find the best matching FAQ question
    let bestMatch = null;
    let bestScore = 0;
    
    for (const faqQuestion of Object.keys(FAQ_RESPONSES)) {
      const score = calculateSimilarity(question.toLowerCase(), faqQuestion.toLowerCase());
      if (score > bestScore && score > 0.3) { // Threshold for matching
        bestScore = score;
        bestMatch = faqQuestion;
      }
    }
    
    if (bestMatch) {
      res.json({ 
        success: true, 
        answer: FAQ_RESPONSES[bestMatch],
        question: bestMatch
      });
    } else {
      res.json({ 
        success: true, 
        answer: "I'm sorry, I couldn't find a specific answer to your question. Please try rephrasing your question or contact our support team for assistance. You can also check our FAQ section for common questions.",
        question: null
      });
    }
  } catch (error) {
    console.error('FAQ response error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper function to calculate similarity between strings
function calculateSimilarity(str1, str2) {
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  
  let matches = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        matches++;
        break;
      }
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
}

// Get chat history
// GET /api/chat/history?type=admin-customer&userId=... OR type=admin-driver&driverId=...
router.get('/history', auth, async (req, res) => {
  try {
    const { type, userId, driverId } = req.query;
    let filter = { conversationType: type };
    if (type === 'admin-customer' && userId) {
      filter.participants = { $all: [req.user.id, userId] };
    } else if (type === 'admin-driver' && driverId) {
      filter.participants = { $all: [req.user.id, driverId] };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid query params' });
    }
    const messages = await ChatMessage.find(filter).sort({ timestamp: 1 });
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 