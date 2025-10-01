import React, { useState, useEffect } from "react";
import { registerUser } from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import "../App.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen",
    location: "",
    latitude: null,  
    longitude: null, 
  });
  const [msg, setMsg] = useState("");

  // Use effect to get user's geolocation on component mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm((prevForm) => ({
            ...prevForm,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await registerUser(form);
    if (res.success) {
      setMsg("Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } else {
      setMsg(res.error || (res.errors && res.errors.map(e => e.msg).join(', ')) || res.message || "Error registering");

    }
  };

  return (
    <div className="auth-container">
      <div
        className="auth-left"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "4rem", marginBottom: "15px" }}>CIVIX</p>
        <p style={{ fontSize: "2rem", marginBottom: "40px" }}>
          Your voice. Your rights. Your platform.
        </p>
        <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
          Empowering Citizens Through Technology
        </p>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Sign Up</h2>

          <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <select name="role" onChange={handleChange} required value={form.role}>
  <option value="citizen">citizen</option>
  <option value="official">official</option>
  <option value="admin">admin</option>
</select>


            <select name="location" onChange={handleChange}  required value={form.location}>
              
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
            </select>

            <button type="submit">Register</button>
          </form>

          
          {form.latitude && form.longitude && (
            <p>
              Your coordinates: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
            </p>
          )}

          <p className="auth-links">
            Already have an account? <Link to="/login">Login</Link>
          </p>
          <p style={{ color: "red" }}>{msg}</p>
        </div>
      </div>
    </div>
  );
}
export default Register;
