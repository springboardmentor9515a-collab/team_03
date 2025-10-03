
import React, { useState } from "react";
import { loginUser } from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await loginUser(form);
    

    if (res.success) {
      localStorage.setItem('token', res.token);
  navigate("/dashboard");
}
    else setMsg(res.message || "Invalid credentials");
  };

  return (
    <div className="auth-container">

      <div className="auth-left" style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px", color: "#fff", textAlign: "center"}}>
      <p style={{ fontSize: "4rem", marginBottom: "15px" }}>CIVIX</p>
       <p style={{ fontSize: "2rem", marginBottom: "30px" }}>  Your voice. Your rights. Your platform. </p>
      <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>  Empowering Citizens Through Technology </p>
      </div>

      <div className="auth-right">
        <div className="auth-card">

          <h2>Sign In</h2>
          <form onSubmit={handleSubmit}>
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <button type="submit">Login</button>
          </form>

          <p className="auth-links">
            Don’t have an account? <Link to="/register">Sign Up</Link>
          </p>
          
          <p> <Link to="/forgot-password">Forgot Password?</Link> </p>

          
          <p style={{ color: "red" }}>{msg}</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
