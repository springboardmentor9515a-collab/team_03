import React from "react";
import "leaflet/dist/leaflet.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"; // citizen dashboard
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ComplaintCreate from "./pages/ComplaintCreate";
import Petitions from "./pages/Petitions";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* citizen */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/ComplaintCreate" element={<ComplaintCreate />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/petitions" element={<Petitions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
