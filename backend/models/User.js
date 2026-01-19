const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String }, // Added to match Dashboard profile requirements
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

// REMOVE 'next' from the async function arguments
UserSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // DO NOT call next() here; Mongoose waits for the async function to resolve
  } catch (err) {
    // If there is an error, simply throw it; Mongoose will catch it
    throw err; 
  }
});

module.exports = mongoose.model('User', UserSchema);