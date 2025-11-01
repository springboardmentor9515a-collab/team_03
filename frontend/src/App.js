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
import PetitionsDetails from "./pages/PetitionsDetails";
import VolunteerDashboard from "./pages/VolunteerDashbord";
import AssignedTasksVolunteer from "./pages/AssignedTasksVolunteer";
import PollCreate from "./pages/PollCreation"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/ComplaintCreate" element={<ComplaintCreate />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/petitions" element={<Petitions />} />
        <Route path="/petitions/:id" element={<PetitionsDetails />} />
        <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
        <Route path="/volunteer/assigned-tasks" element={<AssignedTasksVolunteer />} />
        <Route path="/polls/new" element={<PollCreate />} />    
      </Routes>
    </BrowserRouter>
  );
}

export default App;
