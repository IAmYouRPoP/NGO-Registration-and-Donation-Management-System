const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { protect } = require('../middleware/authMiddleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); //

// POST: http://localhost:5000/api/donations/create
router.post('/donations/create', protect, async (req, res) => {
  try {
    const { campaign, amount } = req.body;

    // 1. Independent Registration: Save record as 'PENDING'
    const newDonation = new Donation({
      userId: req.user.userId,
      campaign,
      amount,
      status: 'PENDING'
    });
    await newDonation.save();

    // 2. Create Stripe Checkout Session (Sandbox)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: { name: `Donation: ${campaign}` },
          unit_amount: amount * 100, // Stripe expects amounts in paise/cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      // Pass donationId in the success URL to update the DB later
      success_url: `http://localhost:5000/api/donations/success?donationId=${newDonation._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5000/api/donations/cancel?donationId=${newDonation._id}`,
    });

    // 3. Return the real sandbox URL to the frontend
    res.status(201).json({ payment_url: session.url });

  } catch (err) {
    console.error("Stripe Session Error:", err);
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

router.get('/donations/success', async (req, res) => {
  try {
    const { donationId, session_id } = req.query;

    // Verify the session actually succeeded with Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      await Donation.findByIdAndUpdate(donationId, {
        status: 'SUCCESS',
        paymentId: session.payment_intent // Stripe's transaction ID
      });

      // Final landing on React frontend
      res.redirect(`http://localhost:3000/donation-success?id=${donationId}`);
    } else {
      res.redirect(`http://localhost:3000/donation-failed`);
    }
  } catch (err) {
    res.status(500).send("Verification Error");
  }
});
// GET: http://localhost:5000/api/donations/cancel
router.get('/donations/cancel', async (req, res) => {
  try {
    const { donationId } = req.query;

    // 1. Update the status to 'FAILED'
    // This provides a clean audit trail for the Admin Dashboard
    await Donation.findByIdAndUpdate(donationId, { 
      status: 'FAILED' 
    });

    // 2. Redirect the user back to a specific failure page in React
    res.redirect(`http://localhost:3000/donation-failed`);
    
  } catch (err) {
    console.error("Cancel Route Error:", err);
    res.status(500).send("Error updating donation status.");
  }
});

// GET: /api/admin/donations
router.get('/admin/donations', protect, async (req, res) => {
  try {
    // 1. Role-Based Access Control: Admins only
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied." });
    }

    // 2. Fetch all donations and "join" user details
    const donations = await Donation.find()
      .populate('userId', 'name email phone') 
      .sort({ createdAt: -1 });

    // 3. Format data for the final Admin Dashboard
    const formattedData = donations.map(d => ({
      user: d.userId ? d.userId.name : "Unknown",
      email: d.userId ? d.userId.email : "N/A",
      phone: d.userId ? d.userId.phone : "N/A",
      campaign: d.campaign,
      amount: d.amount,
      // Map the Stripe Payment Intent ID to the 'transaction' key
      transaction: d.paymentId || "N/A", 
      date: new Date(d.createdAt).toLocaleDateString(),
      status: d.status // Will show "SUCCESS", "PENDING", or "FAILED"
    }));

    res.status(200).json(formattedData);
  } catch (err) {
    console.error("Admin API Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET: /api/donations/my
// GET: /api/donations/my (Protected)
// GET: /api/donations/my (Protected)
router.get('/donations/my', protect, async (req, res) => {
  try {
    // 1. Fetch donations specifically for the logged-in user
    // We sort by 'createdAt' descending so newest donations appear first
    const donations = await Donation.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    // 2. Format the data for the User Dashboard frontend
    const formattedHistory = donations.map(d => ({
      // Use the Stripe paymentId or fallback to 'N/A' for pending/failed
      transaction_id: d.paymentId || "N/A", 
      campaign: d.campaign,
      amount: d.amount,
      // Format date for a cleaner table display
      date: new Date(d.createdAt).toLocaleDateString('en-IN'), 
      status: d.status, // "SUCCESS", "PENDING", or "FAILED"
      type: d.type || "MONEY" // Required for the dashboard's .filter() logic
    }));

    res.status(200).json(formattedHistory);
  } catch (err) {
    console.error("Dashboard History Error:", err);
    res.status(500).json({ error: "Failed to load donation history" });
  }
});

module.exports = router;