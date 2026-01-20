import { useEffect, useState } from "react";
import "../styles/dashboard.css";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [moneyDonations, setMoneyDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      // 1. Get user profile
      const profileRes = await fetch("http://localhost:5000/api/auth/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!profileRes.ok) throw new Error("Failed to fetch profile");
      const profileData = await profileRes.json();

      // 2. Get donations
      const donationRes = await fetch("http://localhost:5000/api/donations/my", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!donationRes.ok) throw new Error("Failed to fetch donations");
      const rawDonationData = await donationRes.json();

      // 3. CORRECT FIX: Map data AFTER it is fetched to handle expired PENDING cases
      const formattedData = rawDonationData.map(d => {
        const donationDate = new Date(d.createdAt); // Ensure your backend sends createdAt
        const now = new Date();

        // If status is PENDING and it's older than 30 minutes, show as FAILED locally
        const isExpired = d.status === "PENDING" && (now - donationDate) > (30 * 60 * 1000);

        return {
          ...d,
          status: isExpired ? "FAILED" : d.status,
        };
      });

      // 4. Update State
      setProfile(profileData);
      setMoneyDonations(formattedData.filter(d => d.type === "MONEY"));

    } catch (err) {
      console.error("Failed to load dashboard data", err);
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="loading-screen">
        <div className="loading-box">Loading dashboard...</div>
      </div>
    );
  }

  const totalAmount = moneyDonations
    .filter(d => d.status === "SUCCESS")
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="dashboard">
      <h2 style={{ color: "#dc2626", fontSize: "28px" }}>User Dashboard</h2>

      <button
        className="logout-btn"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        Logout
      </button>

      <div className="top-section">
        <div className="profile-card">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
        </div>

        <div className="slogan-box">
          <h2>Your contribution creates real impact</h2>
          <p>Every rupee helps someone in need.</p>
          <p style={{ marginTop: "15px", fontWeight: "bold", color: "#111827", fontSize: "18px" }}>
            Support a cause. Make a difference today.
          </p>
          <a href="/donate">
            <button className="donate-btn">Donate Now</button>
          </a>
        </div>

        <div className="total-card">
          <h3>Total Amount Donated</h3>
          <h2>₹ {totalAmount}</h2>
        </div>
      </div>

      <h3 style={{ marginTop: "40px" }}>Money Donation History</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Campaign</th>
              <th>Amount (₹)</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {moneyDonations.length === 0 ? (
              <tr><td colSpan="5">No donations yet</td></tr>
            ) : (
              moneyDonations.map((d, i) => (
                <tr key={i}>
                  <td>{d.transaction_id}</td>
                  <td>{d.campaign}</td>
                  <td>{d.amount}</td>
                  <td>{d.date}</td>
                  <td className={`status ${d.status.toLowerCase()}`}>
                    {d.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;