import React, { useEffect, useState } from "react";
import { getProfile, logoutUser } from "../utils/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  useEffect(() => {
    async function fetchProfile() {
      const res = await getProfile();
      if (res.success) setUser(res.user);
      else navigate("/login");
    }
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  // Navigate to complaint creation page
  const goToComplaintCreate = () => {
    navigate("/complaints/new");
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: "32px", maxWidth: "700px", margin: "auto" }}>
      <h2>Welcome, {user.name}</h2>
      <p>
        <strong>Role:</strong> {user.role}
      </p>
      <p>
        <strong>Location:</strong> {user.location}
      </p>
      <p>
        <strong>Latitude:</strong> {user.coordinates?.latitude}
      </p>
      <p>
        <strong>Longitude:</strong> {user.coordinates?.longitude}
      </p>

      <button
        onClick={goToComplaintCreate}
        style={{
          padding: "10px 22px",
          background: "#2563eb",
          border: "none",
          color: "#fff",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        Create New Complaint
      </button>

      <div style={{ marginTop: "20px" }}>
        <h3>Complaints & Petitions in Your Area</h3>
        <div
          style={{
            padding: "15px",
            border: "2px solid #bbb",
            borderRadius: "8px",
            background: "#f0f4ff",
            marginTop: "10px",
            color: "#333",
            fontStyle: "italic",
          }}
        >
          (Coming soon) This section will show complaints and petitions in your area.
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
