function InputField({ label, type, value, onChange }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label>{label}</label><br />
      <input
        type={type}
        value={value}
        onChange={onChange}
        style={{ width: "100%", padding: "8px" }}
      />
    </div>
  );
}

export default InputField;
