import { useState } from "react";
import "../styles/donate.css";

function Donate() {
  const [campaign, setCampaign] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const handleDonate = async () => {
    if (!campaign || !amount) {
      setMessage("Please select a campaign and enter amount.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/donations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ campaign, amount }),
      });

      const data = await res.json();

      if (!data.payment_url) {
        setMessage("Payment initiation failed.");
        return;
      }

      window.location.href = data.payment_url;
    } catch {
      setMessage("Server error.");
    }
  };

  return (
    <div className="donate-page">
      <div className="donate-card">
        <h2 className="donate-title">Make a Donation</h2>

        <label>Select Campaign</label>
        <select value={campaign} onChange={(e) => setCampaign(e.target.value)}>
          <option value="">-- Choose a Campaign --</option>
          <option value="Disaster Relief">Disaster Relief</option>
          <option value="Medical Aid Program">Medical Aid Program</option>
          <option value="Child Education Support">Child Education Support</option>
          <option value="Women Empowerment Program">Women Empowerment</option>
          <option value="Food Distribution Drive">Food Distribution</option>
          <option value="Orphan Care Program">Orphan Care</option>
          <option value="Old Age Home Support">Old Age Support</option>
          <option value="Tree Plantation Drive">Tree Plantation</option>
          <option value="Environmental Protection">Environment</option>
          <option value="NGO Welfare & Operations">NGO Welfare</option>
        </select>

        <label>Enter Amount (₹)</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
        />

        <button onClick={handleDonate}>Donate Now</button>

        {message && <p className="donate-msg">{message}</p>}
      </div>
    </div>
  );
}

export default Donate;
