import { useEffect } from "react";

function PaymentSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txn_id = params.get("txn_id");

    if (txn_id) {
      fetch(`http://localhost:5000/api/donations/verify?txn_id=${txn_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    }

    // Always redirect to dashboard
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Payment Successful</h2>
      <p>Redirecting to your dashboard...</p>
    </div>
  );
}

export default PaymentSuccess;
