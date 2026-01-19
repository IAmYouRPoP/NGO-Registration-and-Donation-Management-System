import { useState } from "react";
import "../styles/auth.css";
import { login, register } from "../services/authService";

function Login() {
  const [activeForm, setActiveForm] = useState(null); // "login" | "register"

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const data = await login({ email, password });

      if (!data.success) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      localStorage.setItem("token", data.token);
      window.location.href = data.role === "ADMIN" ? "/admin" : "/dashboard";

    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");

    if (!name || !email || !mobile || !password) {
      setError("Name, email, mobile number and password are required.");
      return;
    }

    if (mobile.length !== 10) {
      setError("Mobile number must be 10 digits.");
      return;
    }

    try {
      setLoading(true);

      const data = await register({ 
        name, 
        email, 
        mobile, 
        password, 
        role: "USER" 
      });

      if (!data.success) {
        setError(data.message || "Email already exists.");
        return;
      }

      setActiveForm("login");
      setError("Account created successfully. Please login.");

    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">

      {/* Top Right Buttons */}
      <div className="top-btns">
        <button onClick={() => setActiveForm("login")}>Sign In</button>
        <button onClick={() => setActiveForm("register")}>Sign Up</button>
      </div>

      {/* Error / Success Message */}
      {error && <div className="auth-message">{error}</div>}

      {/* Login Form */}
      {activeForm === "login" && (
        <div className="auth-form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      )}

      {/* Register Form */}
      {activeForm === "register" && (
        <div className="auth-form">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Mobile Number</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            placeholder="10-digit mobile number"
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleRegister} disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Login;
