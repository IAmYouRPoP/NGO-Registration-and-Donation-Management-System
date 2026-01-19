import { useEffect, useState } from "react";
import "../styles/admin.css";

function Admin() {
  const [donations, setDonations] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("All");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/admin/donations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setDonations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load admin donations", err);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  // Filters
  const filteredByCampaign =
    selectedCampaign === "All"
      ? donations
      : donations.filter((d) => d.campaign === selectedCampaign);

  const finalDonations =
    statusFilter === "ALL"
      ? filteredByCampaign
      : filteredByCampaign.filter((d) => d.status === statusFilter);

  // Stats
  const totalAmount = filteredByCampaign.reduce(
    (sum, d) => sum + (Number(d.amount) || 0),
    0
  );

  const totalDonors = new Set(
    filteredByCampaign.map((d) => d.email)
  ).size;

  const successCount = filteredByCampaign.filter(
    (d) => d.status === "SUCCESS"
  ).length;

  const pendingCount = filteredByCampaign.filter(
    (d) => d.status === "PENDING"
  ).length;

  const failedCount = filteredByCampaign.filter(
    (d) => d.status === "FAILED"
  ).length;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-box">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin">
      <h2>Admin Dashboard</h2>

      <button
        className="logout-btn"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        Logout
      </button>

      {/* Campaign Tabs */}
      <div className="tabs">
        {[
          "All",
          "Disaster Relief",
          "Medical Aid Program",
          "Child Education Support",
          "Women Empowerment",
          "Food Distribution",
          "Orphan Care",
          "Old Age Support",
          "Tree Plantation",
          "Environment",
          "NGO Welfare",
        ].map((c) => (
          <button
            key={c}
            className={selectedCampaign === c ? "active" : ""}
            onClick={() => {
              setSelectedCampaign(c);
              setStatusFilter("ALL");
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="summary">
        <div className="card">
          Total Amount <br />₹ {totalAmount}
        </div>

        <div className="card">
          Total Donors <br />
          {totalDonors}
        </div>

        <div
          className="card success"
          onClick={() => setStatusFilter("SUCCESS")}
        >
          Successful <br />
          {successCount}
        </div>

        <div
          className="card pending"
          onClick={() => setStatusFilter("PENDING")}
        >
          Pending <br />
          {pendingCount}
        </div>

        <div
          className="card failed"
          onClick={() => setStatusFilter("FAILED")}
        >
          Failed <br />
          {failedCount}
        </div>
      </div>

      <button className="reset-btn" onClick={() => setStatusFilter("ALL")}>
        Show All Status
      </button>

      {/* Empty State */}
      {finalDonations.length === 0 && (
        <p style={{ color: "#6b7280", marginTop: "20px" }}>
          No donations found for this filter.
        </p>
      )}

      {/* Table */}
      {finalDonations.length > 0 && (
        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Campaign</th>
                <th>Amount</th>
                <th>Transaction</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {finalDonations.map((d, i) => (
                <tr key={i}>
                  <td>{d.user || d.name || "N/A"}</td>
                  <td>{d.email || "N/A"}</td>
                  <td>{d.phone || d.contact || "N/A"}</td>
                  <td>{d.campaign || "N/A"}</td>
                  <td>₹ {d.amount || 0}</td>
                  <td>{d.transaction || d.transaction_id || "N/A"}</td>
                  <td>{d.date || "N/A"}</td>
                  <td className={`status ${d.status?.toLowerCase()}`}>
                    {d.status || "UNKNOWN"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Admin;
