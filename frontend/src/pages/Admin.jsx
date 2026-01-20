import { useEffect, useState } from "react";
import "../styles/admin.css";

function Admin() {
  const [view, setView] = useState("donations"); // "donations" | "registrations"
  const [donations, setDonations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("All");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const donRes = await fetch("http://localhost:5000/api/donations/admin/donations", { headers });
      const donData = await donRes.json();
      
      const userRes = await fetch("http://localhost:5000/api/auth/admin/users", { headers });
      const userData = await userRes.json();

      setDonations(Array.isArray(donData) ? donData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const dataToExport = view === "donations" ? donations : users;
    if (dataToExport.length === 0) return;

    const csvRows = [
      Object.keys(dataToExport[0]).join(","),
      ...dataToExport.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${view}_export.csv`;
    a.click();
  };

  const filteredByCampaign = selectedCampaign === "All"
    ? donations
    : donations.filter((d) => d.campaign === selectedCampaign);

  const finalDonations = statusFilter === "ALL"
    ? filteredByCampaign
    : filteredByCampaign.filter((d) => d.status === statusFilter);

  // Stats
  const totalAmount = donations.filter(d => d.status === "SUCCESS").reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const successCount = filteredByCampaign.filter(d => d.status === "SUCCESS").length;
  const pendingCount = filteredByCampaign.filter(d => d.status === "PENDING").length;
  const failedCount = filteredByCampaign.filter(d => d.status === "FAILED").length;

  if (loading) return <div className="loading-screen"><div className="loading-box">Loading admin dashboard...</div></div>;

  return (
    <div className="admin">
      <div className="admin-header">
        <h2>Admin Control Panel</h2>
        <button className="logout-btn" onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}>Logout</button>
      </div>

      <div className="view-selector">
        <button className={view === "donations" ? "active-view" : ""} onClick={() => setView("donations")}>Donation Management</button>
        <button className={view === "registrations" ? "active-view" : ""} onClick={() => setView("registrations")}>Registration Management</button>
      </div>

      {view === "donations" ? (
        <>
          <div className="tabs">
            {["All", "Disaster Relief", "Medical Aid Program", "Child Education Support", "Women Empowerment Program", "Food Distribution Drive", "Orphan Care Program", "Old Age Home Support", "Tree Plantation Drive", "Environmental Protection", "NGO Welfare & Operations"].map((c) => (
              <button key={c} className={selectedCampaign === c ? "active" : ""} onClick={() => { setSelectedCampaign(c); setStatusFilter("ALL"); }}>{c}</button>
            ))}
          </div>

          <div className="summary-row">
            <div className="card">Total Successful <br />₹ {totalAmount}</div>
            <div className="card success" onClick={() => setStatusFilter("SUCCESS")}>Successful <br />{successCount}</div>
            <div className="card pending" onClick={() => setStatusFilter("PENDING")}>Pending <br />{pendingCount}</div>
            <div className="card failed" onClick={() => setStatusFilter("FAILED")}>Failed <br />{failedCount}</div>
          </div>

          <div className="action-row">
            <button className="export-btn" onClick={handleExport}>Export to CSV</button>
            <button className="reset-btn" onClick={() => setStatusFilter("ALL")}>Show All Status</button>
          </div>

          <div className="table-box">
            <table>
              <thead>
                <tr><th>User</th><th>Email</th><th>Campaign</th><th>Amount</th><th>Transaction</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {finalDonations.map((d, i) => (
                  <tr key={i}>
                    <td>{d.user}</td><td>{d.email}</td><td>{d.campaign}</td>
                    <td>₹ {d.amount}</td><td>{d.transaction}</td><td>{d.date}</td>
                    <td className={`status ${d.status?.toLowerCase()}`}>{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="summary-row">
            <div className="card">Total Registrations <br />{users.length}</div>
            <button className="export-btn" onClick={handleExport}>Export to CSV</button>
          </div>

          <div className="table-box">
            <h3>Registered Users</h3>
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined Date</th></tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i}>
                    <td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td><td>{u.role}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Admin;