const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();


const User = require('./models/User');

// Routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointment');
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const medicalRecordRoutes = require('./routes/medicalRecord');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const availabilityRoutes = require('./routes/availability');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/medical-history', medicalRecordRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/availability', availabilityRoutes);

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");
    
    // Check if any admin exists, if not, create a default admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    if (adminCount === 0) {
      console.log("No admin found. Creating default admin account...");
      try {
        await User.create({
          name: 'Admin',
          email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com',
          password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123', // Plain text - will be hashed by pre-save hook
          role: 'admin',
          status: 'active'
        });
        
        console.log("Default admin account created successfully");
      } catch (err) {
        console.error("Failed to create default admin:", err.message);
      }
    }
  })
  .catch(err => console.error(err));

// Test Route
app.get('/', (req, res) => {
  res.send("Telemedicine API Running");
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));