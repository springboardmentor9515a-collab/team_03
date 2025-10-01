import React, { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Call your backend API to send password reset email
    // For now, just simulate success
    setMsg(`If an account with ${email} exists, reset instructions were sent.`);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button type="submit" style={{ width: "100%", padding: "10px" }}>
          Send Reset Instructions
        </button>
      </form>
      <p style={{ marginTop: "10px", color: "green" }}>{msg}</p>
    </div>
  );
}

export default ForgotPassword;
