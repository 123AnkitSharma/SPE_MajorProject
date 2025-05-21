const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
// Routes
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointment');
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const medicalRecordRoutes = require('./routes/medicalRecord'); // Add this line
const reportRoutes = require('./routes/reports'); // Add this line
const adminRoutes = require('./routes/admin'); // Add this line
const availabilityRoutes = require('./routes/availability'); // Add this line
const app = express();
// Middlewares
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/medical-history', medicalRecordRoutes); // Add this line
app.use('/api/reports', reportRoutes); // Add this line
app.use('/api/admin', adminRoutes); // Add this line
app.use('/api/availability', availabilityRoutes); // Add this line
// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error(err));
// Test Route
app.get('/', (req, res) => {
  res.send("Telemedicine API Running");
});
// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));