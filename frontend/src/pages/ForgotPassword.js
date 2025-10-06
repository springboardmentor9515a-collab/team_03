import React, { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    // TODO: API call to send reset instructions
    setMsg(`If an account with ${email} exists, reset instructions were sent.`);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    // TODO: API call to verify OTP
    setMsg(`OTP ${otp} submitted for verification.`);
  };

  return (
    <div style={{ backgroundColor: "#d0e7ff", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "30px", width: "350px", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
        
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Forgot Password</h2>
        
        <form onSubmit={handleEmailSubmit}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#5c6bbeff", color: "#fff", border: "none", borderRadius: "4px" }}>
            Send Reset Instructions
          </button>
        </form>

        <form onSubmit={handleOtpSubmit} style={{ marginTop: "20px" }}>
          <label htmlFor="otp" style={{ display: "block", marginBottom: "5px" }}>
            Enter OTP
          </label>
          <input
            id="otp"
            type="text"
            placeholder="Type OTP here"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "4px", border: "1px solid #ccc" }}
          />
          <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#5c6bbeff", color: "#fff", border: "none", borderRadius: "4px" }}>
            Submit OTP
          </button>
        </form>

        {msg && <p style={{ color: "green", marginTop: "15px", textAlign: "center" }}>{msg}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;