function Button({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "10px",
        background: "#2563eb",
        color: "white",
        border: "none",
        cursor: "pointer"
      }}
    >
      {text}
    </button>
  );
}

export default Button;
