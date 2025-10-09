import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "../App.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("ResetPassword component mounted, token:", token);
    if (!token) {
      setError("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    if (!token) {
      setError("Invalid reset token. Please request a new password reset.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: form.newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Password changed successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.error || "Reset failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-left" style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px", color: "#fff", textAlign: "center"}}>
          <p style={{ fontSize: "4rem", marginBottom: "15px" }}>CIVIX</p>
          <p style={{ fontSize: "2rem", marginBottom: "30px" }}>Invalid Reset Link</p>
          <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>This reset link is not valid</p>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <h2>Invalid Reset Link</h2>
            <p style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
              This password reset link is invalid or has expired.
            </p>
            <p className="auth-error">{error}</p>
            <p className="auth-links">
              <Link to="/forgot-password">Request a new reset link</Link>
            </p>
            <p className="auth-links">
              <Link to="/login">Back to Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  console.log("Rendering ResetPassword component with token:", token);

  return (
    <div className="auth-container">
      <div className="auth-left" style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px", color: "#fff", textAlign: "center"}}>
        <p style={{ fontSize: "4rem", marginBottom: "15px" }}>CIVIX</p>
        <p style={{ fontSize: "2rem", marginBottom: "30px" }}>Set New Password</p>
        <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>Choose a strong password for your account</p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Reset Password</h2>
          <p style={{ textAlign: "center", marginBottom: "20px", color: "#666" }}>
            Enter your new password below.
          </p>
          
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              minLength="6"
            />
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Change Password"}
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

export default ResetPassword;
