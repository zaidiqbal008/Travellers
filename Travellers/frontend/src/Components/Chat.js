import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { authAPI, chatAPI } from '../utils/api';

const API_BASE_URL = 'http://localhost:5000/api/chat';

// FAQ responses for quick access
const QUICK_FAQS = [
  'How do I book a ride?',
  'What payment methods are accepted?',
  'How can I contact support?',
  'What are the available car types?',
  'How do I cancel a booking?',
  'What is the refund policy?',
  'What tour packages do you offer?',
  'What are the car prices?',
  'Do you have luxury cars?',
  'What safety measures do you have?'
];

const Chat = ({ currentUser, otherUser, conversationType, role, fancy, initialInput }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [adminUser, setAdminUser] = useState(null);
  const [showFAQs, setShowFAQs] = useState(false);

  // Check if user is authenticated
  const isAuthenticated = currentUser && currentUser._id;

  // Debug logging
  console.log('Chat Debug:', {
    conversationType,
    isAuthenticated,
    currentUser: currentUser ? 'exists' : 'null',
    messagesLength: messages.length
  });

  // Handle initial input from FAQ buttons
  useEffect(() => {
    if (initialInput && conversationType === 'bot' && isAuthenticated) {
      handleFAQQuestion(initialInput);
    }
  }, [initialInput, conversationType, isAuthenticated]);

  // Fetch chat history
  useEffect(() => {
    if (!otherUser || conversationType === 'bot') return;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const params =
          conversationType === 'admin-customer'
            ? { type: 'admin-customer', userId: otherUser._id }
            : { type: 'admin-driver', driverId: otherUser._id };
        const res = await axios.get(`${API_BASE_URL}/history`, { params, withCredentials: true });
        setMessages(res.data.messages);
      } catch (err) {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [otherUser, conversationType]);

  // Fetch admin user from backend
  useEffect(() => {
    const fetchAdmin = async () => {
      const res = await fetch('/api/users?type=admin');
      const data = await res.json();
      setAdminUser(data.users && data.users.length > 0 ? data.users[0] : null);
    };
    fetchAdmin();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle FAQ question
  const handleFAQQuestion = async (question) => {
    if (!question.trim() || !isAuthenticated) return;
    
    // Ensure currentUser exists, create fallback if null
    const user = currentUser || { _id: 'guest-user', username: 'Guest' };
    
    // Add user message
    const userMessage = {
      _id: Date.now(),
      sender: user._id,
      message: question,
      timestamp: new Date(),
      isUser: true
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Get FAQ response
      const response = await chatAPI.getFAQResponse(question);
      
      if (response.data.success) {
        // Add bot response
        const botMessage = {
          _id: Date.now() + 1,
          sender: 'travellers-bot',
          message: response.data.answer,
          timestamp: new Date(),
          isBot: true
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Handle unsuccessful response
        const errorMessage = {
          _id: Date.now() + 1,
          sender: 'travellers-bot',
          message: "I'm sorry, I couldn't find a specific answer to your question. Please try rephrasing your question or contact our support team for assistance.",
          timestamp: new Date(),
          isBot: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('FAQ response error:', error);
      // Add error message
      const errorMessage = {
        _id: Date.now() + 1,
        sender: 'travellers-bot',
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team. You can also check our FAQ section for common questions.",
        timestamp: new Date(),
        isBot: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    console.log('currentUser:', currentUser);
    console.log('otherUser:', otherUser);
    console.log('Sending message:', input);
    
    if (!input.trim()) return;

    if (conversationType === 'bot') {
      // Handle FAQ chatbot
      await handleFAQQuestion(input);
      return;
    }

    if (!otherUser) return;
    
    try {
      const res = await axios.post(
        `${API_BASE_URL}/send`,
        {
          receiverId: otherUser._id,
          message: input,
          conversationType,
          role
        },
        { withCredentials: true }
      );
      setMessages((prev) => [...prev, res.data.chatMessage]);
      setInput('');
    } catch (err) {
      // handle error
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '99.5%', maxWidth: '100%', background: '#fff', borderRadius: fancy ? 12 : 8, boxShadow: fancy ? '0 2px 16px 0 rgba(67,97,238,0.08)' : undefined, border: fancy ? '2px solid #e3e3e3' : '1px solid #ccc' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: fancy ? 18 : 12, background: fancy ? '#f7f9fc' : undefined }}>
        {loading ? (
          <div style={{ color: '#888', fontSize: 14, padding: '10px 0' }}>
            Loading chat history...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ color: '#888', fontSize: 14, padding: '10px 0' }}>
            {conversationType === 'bot' ? 
              'Hello! I\'m your Travellers assistant. How can I help you today?' : 
              'No messages yet.'
            }
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === (currentUser?._id || 'guest-user');
            return (
              <div
                key={msg._id}
                style={{
                  marginBottom: fancy ? 18 : 10,
                  textAlign: isMe ? 'right' : 'left',
                  display: 'flex',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 8
                }}
              >
                {fancy && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e3e3e3', margin: isMe ? '0 0 0 8px' : '0 8px 0 0' }} />
                )}
                <div
                  style={{
                    display: 'inline-block',
                    background: fancy
                      ? isMe
                        ? 'linear-gradient(135deg, #4361ee 0%, #4cc9f0 100%)'
                        : '#fff'
                      : isMe
                        ? '#e3f2fd'
                        : '#f1f1f1',
                    color: fancy && isMe ? '#fff' : '#222',
                    borderRadius: fancy ? (isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px') : 8,
                    padding: fancy ? '10px 18px' : '6px 12px',
                    maxWidth: 280,
                    boxShadow: fancy ? '0 2px 8px 0 rgba(67,97,238,0.08)' : undefined,
                    border: fancy && !isMe ? '1px solid #e3e3e3' : undefined
                  }}
                >
                  <div style={{ fontSize: 14, wordBreak: 'break-word' }}>{msg.message}</div>
                  <div style={{ fontSize: 10, color: fancy && isMe ? '#d0f1ff' : '#888', marginTop: 4, textAlign: 'right' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* FAQ Quick Access for admin-customer chat */}
      {conversationType === 'admin-customer' && (isAuthenticated || currentUser) && (
        <div style={{ padding: '10px 0', borderTop: '1px solid #eee', marginTop: '10px', background: '#f8f9fa' }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: '8px', fontWeight: 500 }}>
            Quick Questions:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {QUICK_FAQS.slice(0, 6).map((faq, idx) => (
              <button
                key={idx}
                onClick={() => handleFAQQuestion(faq)}
                style={{
                  background: '#e3f2fd',
                  border: '1px solid #2196f3',
                  borderRadius: '12px',
                  padding: '6px 10px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#1976d2',
                  margin: '2px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    background: '#bbdefb',
                    transform: 'translateY(-1px)'
                  }
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#bbdefb';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#e3f2fd';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {faq}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={sendMessage} style={{ display: 'flex', borderTop: fancy ? 'none' : '1px solid #eee', padding: fancy ? 12 : 8, background: fancy ? '#f7f9fc' : undefined }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={conversationType === 'bot' ? "Ask me anything..." : "Type a message..."}
          style={{ flex: 1, border: 'none', outline: 'none', padding: 12, fontSize: 15, borderRadius: 8, background: fancy ? '#fff' : undefined, boxShadow: fancy ? '0 1px 4px 0 #e3e3e3' : undefined }}
        />
        <button type="submit" style={{ marginLeft: 8, padding: fancy ? '12px 22px' : '8px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 15, boxShadow: fancy ? '0 2px 8px 0 rgba(67,97,238,0.08)' : undefined }}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat; 