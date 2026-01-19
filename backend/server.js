
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
app.use('/api', authRoutes); // This makes your URL: http://localhost:5000/api/register

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is live on http://localhost:${PORT}`);
});

const donationRoutes = require('./routes/donation');
app.use('/api', donationRoutes); // URLs will be http://localhost:5000/api/donate