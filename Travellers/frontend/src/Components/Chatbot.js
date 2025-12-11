import React, { useState } from 'react';
import Chat from './Chat';
import { Box, IconButton, Paper, Typography, Button, Fade } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';

const TRAVELLERS_FAQS = [
  'How do I book a ride?',
  'What payment methods are accepted?',
  'How can I contact support?',
  'How do I view my booking history?',
  'How do I update my profile?',
  'How do I cancel a booking?',
  'What are the available car types?',
  'How do I become a driver?',
  'How do I reset my password?',
  'What is the refund policy?',
  'What tour packages do you offer?',
  'How do I book a tour?',
  'What is included in tour packages?',
  'Can I modify my booking after payment?',
  'How do I download my booking receipt?',
  'What if my driver doesn\'t show up?',
  'Do you provide airport transfers?',
  'What safety measures do you have?',
  'Can I book for someone else?',
  'What are your operating hours?',
  'Do you provide child seats?',
  'What if I need to change my pickup location?',
  'What are the car prices?',
  'How much do tours cost?',
  'What is the cancellation fee?',
  'Do you have luxury cars?',
  'Can I book multiple cars?',
  'What documents do I need to book?',
  'Do you provide round-trip service?',
  'What if I need to extend my booking?',
  'Do you have SUVs for large groups?',
  'What payment security do you have?',
  'Can I get a receipt for business expenses?',
  'Do you provide corporate services?'
];

const Chatbot = ({ currentUser, role }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [faqClicked, setFaqClicked] = useState(false);

  const handleFaqClick = (faq) => {
    setInput(faq);
    setFaqClicked(true);
  };

  return (
    <>
      <Fade in={!open}>
        <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1200 }}>
          <IconButton
            color="primary"
            size="large"
            sx={{ bgcolor: '#fff', boxShadow: 3 }}
            onClick={() => setOpen(true)}
          >
            <ChatBubbleOutlineIcon fontSize="large" />
          </IconButton>
        </Box>
      </Fade>
      <Fade in={open}>
        <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1300, width: 350, maxWidth: '95vw' }}>
          <Paper elevation={8} sx={{ borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 500 }}>
            <Box sx={{ bgcolor: 'primary.main', color: '#fff', p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Travellers Assistant
              </Typography>
              <IconButton size="small" sx={{ color: '#fff' }} onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ p: 2, flex: 1, overflowY: 'auto', bgcolor: '#f7f9fc' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Quick Questions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, maxHeight: 120, overflowY: 'auto' }}>
                {TRAVELLERS_FAQS.map((faq, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    size="small"
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: 'none', 
                      fontSize: 12,
                      maxWidth: '100%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    onClick={() => handleFaqClick(faq)}
                  >
                    {faq}
                  </Button>
                ))}
              </Box>
              <Box sx={{ height: 260, overflowY: 'auto', borderRadius: 2, bgcolor: '#fff', p: 1, boxShadow: 1 }}>
                <Chat
                  currentUser={currentUser}
                  otherUser={{ _id: 'travellers-bot', username: 'Travellers Bot' }}
                  conversationType="bot"
                  role={role}
                  fancy
                  initialInput={faqClicked ? input : ''}
                />
              </Box>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </>
  );
};

export default Chatbot; 