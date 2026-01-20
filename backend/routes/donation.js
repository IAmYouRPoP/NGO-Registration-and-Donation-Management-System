const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { protect } = require('../middleware/authMiddleware');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Background Task: Mark abandoned PENDING donations as FAILED every 10 mins
setInterval(async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    await Donation.updateMany(
      { status: 'PENDING', createdAt: { $lt: thirtyMinutesAgo } },
      { $set: { status: 'FAILED' } }
    );
  } catch (err) {
    console.error("Cleanup Job Error:", err);
  }
}, 10 * 60 * 1000);

// POST: Create Checkout Session
router.post('/create', protect, async (req, res) => {
  try {
    const { campaign, amount } = req.body;
    const newDonation = new Donation({
      userId: req.user.userId,
      campaign,
      amount,
      status: 'PENDING'
    });
    await newDonation.save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: { name: `Donation: ${campaign}` },
          unit_amount: amount * 100, // $ paise/cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:5000/api/donations/success?donationId=${newDonation._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5000/api/donations/cancel?donationId=${newDonation._id}`,
    });

    res.status(201).json({ payment_url: session.url });
  } catch (err) {
    res.status(500).json({ error: "Payment initiation failed" });
  }
});

router.get('/success', async (req, res) => {
  try {
    const { donationId, session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      await Donation.findByIdAndUpdate(donationId, {
        status: 'SUCCESS',
        paymentId: session.payment_intent 
      });
      res.redirect(`http://localhost:3000/donation-success?id=${donationId}`);
    } else {
      res.redirect(`http://localhost:3000/donation-failed`);
    }
  } catch (err) {
    res.status(500).send("Verification Error");
  }
});

router.get('/cancel', async (req, res) => {
  try {
    const { donationId } = req.query;
    await Donation.findByIdAndUpdate(donationId, { status: 'FAILED' });
    res.redirect(`http://localhost:3000/donation-failed`);
  } catch (err) {
    res.status(500).send("Error updating donation status.");
  }
});

router.get('/admin/donations', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Access denied." });
    const donations = await Donation.find().populate('userId', 'name email phone').sort({ createdAt: -1 });
    const formattedData = donations.map(d => ({
      user: d.userId ? d.userId.name : "Unknown",
      email: d.userId ? d.userId.email : "N/A",
      phone: d.userId ? d.userId.phone : "N/A",
      campaign: d.campaign,
      amount: d.amount,
      transaction: d.paymentId || "N/A", 
      date: d.createdAt, // Send full date for frontend expiration check
      status: d.status 
    }));
    res.status(200).json(formattedData);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const donations = await Donation.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    const formattedData = donations.map(d => ({
      transaction_id: d.paymentId || "N/A",
      campaign: d.campaign,
      amount: d.amount,
      date: new Date(d.createdAt).toLocaleDateString('en-IN'), 
      status: d.status,
      type: "MONEY" 
    }));
    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: "Failed to load donation history" });
  }
});

module.exports = router;