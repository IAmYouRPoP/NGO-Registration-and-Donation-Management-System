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

      // Get user profile
      const profileRes = await fetch("http://localhost:5000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!profileRes.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profileData = await profileRes.json();

      // Get donations
      const donationRes = await fetch("http://localhost:5000/api/donations/my", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!donationRes.ok) {
        throw new Error("Failed to fetch donations");
      }

      const donationData = await donationRes.json();

      // Keep only MONEY donations
      const moneyOnly = donationData.filter(d => d.type === "MONEY");

      setProfile(profileData);
      setMoneyDonations(moneyOnly);

    } catch (err) {
      console.error("Failed to load dashboard data", err);
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  // Safe loading screen
  if (loading || !profile) {
    return (
      <div className="loading-screen">
        <div className="loading-box">
          Loading dashboard...
        </div>
      </div>
    );
  }

  // Total SUCCESS donations only
  const totalAmount = moneyDonations
    .filter(d => d.status === "SUCCESS")
    .reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="dashboard">

      <h2 style={{ color: "#dc2626", fontSize: "28px" }}>
        User Dashboard
      </h2>

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

        {/* Profile */}
        <div className="profile-card">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone:</strong> {profile.phone}</p>
        </div>

        {/* Slogan */}
        <div className="slogan-box">
          <h2>Your contribution creates real impact</h2>
          <p>Every rupee helps someone in need.</p>

          <p style={{ 
            marginTop: "15px", 
            fontWeight: "bold", 
            color: "#111827", 
            fontSize: "18px" 
          }}>
            Support a cause. Make a difference today.
          </p>

          <p style={{ color: "#4b5563" }}>
            Your small contribution can change lives.
          </p>

          <a href="/donate">
            <button className="donate-btn">Donate Now</button>
          </a>
        </div>

        {/* Total */}
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
              <tr>
                <td colSpan="5">No donations yet</td>
              </tr>
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
