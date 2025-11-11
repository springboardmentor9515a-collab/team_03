import React from "react";
import "leaflet/dist/leaflet.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
//first milestone pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"; // citizen dashboard
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
//2nd milestone pages
import AdminDashboard from "./pages/AdminDashboard";
import ComplaintCreate from "./pages/ComplaintCreate";
import Petitions from "./pages/Petitions";
import PetitionsDetails from "./pages/PetitionsDetails";
import VolunteerDashboard from "./pages/VolunteerDashbord";
import AssignedTasksVolunteer from "./pages/AssignedTasksVolunteer";
//3rd milestone pages
import PollVote from "./pages/PollVote";
import PollsList from "./pages/PollsList";
import PollCreation from "./pages/PollCreation";
import SentimentDashboard from "./pages/SentimentDashboard";
//4th milestone pages
import ReportsDashboard from "./pages/ReportDashboard";


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
        <Route path="/complaints/:id/sentiment" element={<SentimentDashboard />} />
        <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
        <Route path="/volunteer/assigned-tasks" element={<AssignedTasksVolunteer />} />
        <Route path="/polls/new" element={<PollCreation />} />
        <Route path="/polls/:id/sentiment" element={<SentimentDashboard />} />
        <Route path="/polls/:id" element={<PollVote />} />
        <Route path="/polls" element={<PollsList />} />
        <Route path="/polls/new" element={<PollCreation />} />  
        <Route path="/reports/dashboard" element={<ReportsDashboard />} />  
      

      </Routes>
    </BrowserRouter>
  );
}

export default App;
