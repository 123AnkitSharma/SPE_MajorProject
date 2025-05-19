const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  profile: {
    age: Number,
    gender: String,
    phone: String,
    address: String,
    specialization: { type: String, required: function() { return this.role === 'doctor'; } },
    license: { type: String, required: function() { return this.role === 'doctor'; } },
  },
}, { timestamps: true });
// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
module.exports = mongoose.model('User', userSchema);