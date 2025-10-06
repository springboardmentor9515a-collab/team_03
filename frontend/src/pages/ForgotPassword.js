import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setMsg("If an account with this email exists, a reset link has been sent to your email.");
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-left" style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px", color: "#fff", textAlign: "center"}}>
        <p style={{ fontSize: "4rem", marginBottom: "15px" }}>CIVIX</p>
        <p style={{ fontSize: "2rem", marginBottom: "30px" }}>Reset Your Password</p>
        <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Don't worry, it happens to the best of us</p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Forgot Password</h2>
          <p style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
          
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {msg && <p className="auth-error" style={{ color: "green" }}>{msg}</p>}
          {error && <p className="auth-error">{error}</p>}

          <p className="auth-links">
            Remember your password? <Link to="/login">Back to Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
