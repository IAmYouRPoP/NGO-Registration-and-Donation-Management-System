const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaign: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, default: "MONEY" }, // Added to match frontend filter
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  paymentId: { type: String }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', DonationSchema);