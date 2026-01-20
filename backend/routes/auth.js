const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Double check this path!

// Independent Registration Route
router.post('/register', async (req, res) => {
  try {
    // 1. Extract name, email, password, AND phone from the request body
    const { name, email, password, phone, role } = req.body;

    // 2. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 3. Create and Save
    // The phone field is now included to populate the User Dashboard
    const newUser = new User({ 
      name, 
      email, 
      password, 
      phone, 
      role 
    });
    
    await newUser.save(); // Bcrypt hashing still happens automatically in User.js

    res.status(201).json({
      success: true, 
      message: "Secure registration successful!" });
  } catch (err) {
    console.error("Detailed Registration Error:", err); 
    
    // Check for MongoDB unique constraint errors (e.g., duplicate email)
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already in use" });
    }
    
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
});

const jwt = require('jsonwebtoken'); // Import JWT for session management
const bcrypt = require('bcryptjs'); // Import bcrypt to compare passwords

// POST: http://localhost:5000/api/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 2. Compare the plain-text password with the hashed one in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // 3. Create a JWT Token containing the User ID and Role
    const token = jwt.sign(
      { userId: user._id, role: user.role }, // Payload
      process.env.JWT_SECRET,                 // Secret Key from your .env
      { expiresIn: '2h' }                     // Token validity duration
    );

    // 4. Send the token and user info to the frontend
    res.status(200).json({
      success: true,
      message: "Login successful",
      token, 
      user: { name: user.name, role: user.role }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Middleware to verify JWT token
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token is not valid" });
  }
};

// GET: http://localhost:5000/api/user/profile
router.get('/user/profile', protect, async (req, res) => {
  try {
    // Find the user by ID but don't send the password back to the frontend
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json(user);
  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});


router.get('/admin/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied." });
    
    // Fetch all users except their passwords
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});


module.exports = router;