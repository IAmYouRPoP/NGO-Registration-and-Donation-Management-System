
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); 

// Debugging: This will print the string to your terminal to confirm it's loading
console.log("Checking MONGO_URI:", process.env.MONGO_URI); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ NGO Database Connected Successfully"))
  .catch(err => console.error("❌ Database Connection Error:", err));

app.get('/', (req, res) => {
  res.send("NSS NGO Backend is Running!");
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); // This makes your URL: http://localhost:5000/api/register

const donationRoutes = require('./routes/donation');
app.use('/api/donations', donationRoutes); // URLs will be http://localhost:5000/api/donate

const Donation = require('./models/Donation');

// Function to mark abandoned donations as FAILED
const cleanupAbandonedDonations = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const result = await Donation.updateMany(
      { 
        status: 'PENDING', 
        createdAt: { $lt: thirtyMinutesAgo } 
      },
      { $set: { status: 'FAILED' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Cleaned up ${result.modifiedCount} abandoned donations.`);
    }
  } catch (err) {
    console.error("Cleanup Error:", err);
  }
};

// Run this check every 10 minutes
setInterval(cleanupAbandonedDonations, 10 * 60 * 1000);

// Catch-all for undefined routes 
app.use((req, res) => {
  console.log(`⚠️ 404 Attempted on: ${req.originalUrl}`); // This will show in your terminal
  res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is live on http://localhost:${PORT}`);
});

