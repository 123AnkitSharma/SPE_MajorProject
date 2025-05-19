import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Container, Typography, Box, Paper, Grid, TextField, Button,
  List, ListItem, ListItemText, ListItemAvatar, Avatar,
  Divider, IconButton, CircularProgress, Badge
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
export default function Messages() {
  const { doctorId } = useParams(); // Get doctor ID from URL if present
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const messagesEndRef = useRef(null);
  // Fetch all conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/messages/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);
  // Fetch available doctors if no conversations exist
  useEffect(() => {
    if (conversations.length === 0) {
      const fetchDoctors = async () => {
        try {
          setLoadingDoctors(true);
          const token = localStorage.getItem('token');
          const res = await axios.get('http://localhost:5000/api/users/doctors', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAvailableDoctors(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingDoctors(false);
        }
      };
      fetchDoctors();
    }
  }, [conversations]);
  // If doctorId is provided in URL, select that doctor
  useEffect(() => {
    if (doctorId && conversations.length > 0) {
      const doctorConv = conversations.find(
        conv => conv.partner._id === doctorId
      );
      if (doctorConv) {
        setSelectedUser(doctorConv.partner);
      } else {
        // Doctor not in conversations yet, fetch doctor info
        const fetchDoctorInfo = async () => {
          try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/users/${doctorId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedUser(res.data);
          } catch (err) {
            console.error(err);
          }
        };
        fetchDoctorInfo();
      }
    }
  }, [doctorId, conversations]);
  // Fetch messages when selectedUser changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/messages/conversation/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
        // Mark messages as read
        await axios.put(`http://localhost:5000/api/messages/read/${selectedUser._id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Update unread count in conversations
        setConversations(conversations.map(conv => {
          if (conv.partner._id === selectedUser._id) {
            return { ...conv, unreadCount: 0 };
          }
          return conv;
        }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [selectedUser]);
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/messages', {
        recipient: selectedUser._id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Add to messages list
      setMessages([...messages, res.data]);
      // Update conversations list
      const updatedConversations = conversations.map(conv => {
        if (conv.partner._id === selectedUser._id) {
          return {
            ...conv,
            lastMessage: res.data
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      <Paper sx={{ height: '75vh', display: 'flex' }}>
        {/* Conversations List */}
        <Box sx={{ 
          width: '30%', 
          borderRight: '1px solid #e0e0e0',
          overflowY: 'auto' 
        }}>
          <List>
            {conversations.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  No conversations yet
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Available doctors:
                </Typography>
                {loadingDoctors ? (
                  <CircularProgress size={20} sx={{ mt: 2 }} />
                ) : (
                  <>
                    {availableDoctors.length > 0 ? (
                      availableDoctors.map((doctor) => (
                        <ListItem 
                          key={doctor._id}
                          button
                          onClick={() => setSelectedUser(doctor)}
                        >
                          <ListItemAvatar>
                            <Avatar>{doctor.name.charAt(0)}</Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={`Dr. ${doctor.name}`}
                            secondary={doctor.profile?.specialization || "General Medicine"}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No doctors available. Book an appointment first.
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            ) : (
              [...new Map(conversations.map(conv => [conv.partner._id, conv])).values()].map((conv) => (
                <ListItem 
                  key={conv.partner._id}
                  button
                  selected={selectedUser && selectedUser._id === conv.partner._id}
                  onClick={() => setSelectedUser(conv.partner)}
                  divider
                >
                  <ListItemAvatar>
                    <Badge color="error" badgeContent={conv.unreadCount} overlap="circular">
                      <Avatar>{conv.partner.name.charAt(0)}</Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${conv.partner.role === 'doctor' ? 'Dr. ' : ''}${conv.partner.name}`}
                    secondary={conv.lastMessage?.content?.substring(0, 30) + (conv.lastMessage?.content?.length > 30 ? '...' : '')}
                    primaryTypographyProps={{ fontWeight: conv.unreadCount > 0 ? 'bold' : 'normal' }}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Box>
        {/* Messages Area */}
        <Box sx={{ 
          width: '70%', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          {selectedUser ? (
            <>
              {/* Message header */}
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center'
              }}>
                <IconButton onClick={() => setSelectedUser(null)} sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6">
                  {selectedUser.role === 'doctor' ? 'Dr. ' : ''}{selectedUser.name}
                </Typography>
              </Box>
              {/* Messages list */}
              <Box sx={{ 
                flexGrow: 1, 
                p: 2, 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <Box
                      key={message._id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender._id === user.id ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          maxWidth: '80%',
                          bgcolor: message.sender._id === user.id ? '#e3f2fd' : '#f5f5f5',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="body1">
                          {message.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Paper>
                    </Box>
                  ))
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography color="text.secondary">
                      No messages yet. Say hello!
                    </Typography>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>
              {/* Send message form */}
              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  p: 2,
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex'
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  variant="contained"
                  endIcon={<SendIcon />}
                  disabled={sending || !newMessage.trim()}
                  sx={{ ml: 1 }}
                >
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="text.secondary">
                Select a conversation to start messaging
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}