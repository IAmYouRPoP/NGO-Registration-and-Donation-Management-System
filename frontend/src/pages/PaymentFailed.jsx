function PaymentFailed() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Payment Failed</h2>
      <p>Please try again.</p>
      <a href="/donate">Go Back to Donate</a>
    </div>
  );
}

export default PaymentFailed;
