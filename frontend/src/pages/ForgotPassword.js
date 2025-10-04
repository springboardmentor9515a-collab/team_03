import React, { useState } from "react";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Reset link sent to your email.");
        setStep(2);
      } else {
        setMsg(data.error || "Failed to send reset email.");
      }
    } catch {
      setMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Password reset successfully.");
        setStep(3);
      } else {
        setMsg(data.error || "Password reset failed.");
      }
    } catch {
      setMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: "#d0e7ff", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ backgroundColor: "#fff", padding: 30, borderRadius: 8, width: 350, boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        <h2 style={{ marginBottom: 20, textAlign: "center" }}>Forgot Password</h2>
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <label>Email</label>
            <input type="email" placeholder="Enter your email" value={email} required onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 15, borderRadius: 4, border: "1px solid #ccc" }} />
            <button type="submit" style={{ width: "100%", padding: 10, backgroundColor: "#5c6bbeff", color: "#fff", border: "none", borderRadius: 4 }} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Instructions"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleResetSubmit}>
            <label>Reset Token</label>
            <input type="text" placeholder="Enter reset token" value={token} required onChange={(e) => setToken(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 15, borderRadius: 4, border: "1px solid #ccc" }} />
            <label>New Password</label>
            <input type="password" placeholder="Enter new password" value={newPassword} required onChange={(e) => setNewPassword(e.target.value)} style={{ width: "100%", padding: 10, marginBottom: 15, borderRadius: 4, border: "1px solid #ccc" }} />
            <button type="submit" style={{ width: "100%", padding: 10, backgroundColor: "#5c6bbeff", color: "#fff", border: "none", borderRadius: 4 }} disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
        {step === 3 && (
          <div style={{ textAlign: "center", color: "green" }}>
            Password reset successful! You may now log in with your new password.
          </div>
        )}
        {msg && <p style={{ marginTop: 15, textAlign: "center", color: "green" }}>{msg}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;
