// GET: /api/user/profile
// GET: /api/user/profile (Protected)
router.get('/user/profile', protect, async (req, res) => {
  try {
    // req.user.userId is provided by the 'protect' middleware
    const user = await User.findById(req.user.userId).select('-password'); 
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone || "Not provided" // Ensures the Dashboard profile card is populated
    });
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});