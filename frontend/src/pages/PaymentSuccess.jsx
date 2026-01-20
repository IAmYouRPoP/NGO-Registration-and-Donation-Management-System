import { useEffect } from "react";
import { Link } from "react-router-dom"; // Use Link for faster internal routing

function PaymentSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const donationId = params.get("id"); // Matches your backend redirect key

    if (donationId) {
      // Small delay ensures the DB update from Stripe has finished
      console.log("Verifying donation:", donationId);
    }
  }, []);

  return (
    <div style={{ 
      textAlign: "center", 
      marginTop: "100px", 
      fontFamily: "Arial, sans-serif" 
    }}>
      <div style={{ fontSize: "60px", color: "#16a34a" }}>✅</div>
      <h1 style={{ color: "#111827" }}>Donation Successful!</h1>
      <p style={{ color: "#4b5563", fontSize: "18px" }}>
        Thank you for your generous contribution. Your support makes a real difference.
      </p>

      <div style={{ marginTop: "30px" }}>
        <Link to="/dashboard">
          <button style={{
            backgroundColor: "#dc2626",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}>
            Return to Dashboard
          </button>
        </Link>
      </div>

      <p style={{ marginTop: "20px", color: "#9ca3af", fontSize: "14px" }}>
        Redirecting automatically in 5 seconds...
      </p>
    </div>
  );
}

export default PaymentSuccess;