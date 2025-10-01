

import React, { useEffect, useState } from "react";
import { getProfile, logoutUser } from "../utils/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  if (!user){
     return <p>Loading...</p>;
  }

  return (

    <div style={{ padding: "32px", maxWidth: "700px", margin: "auto" }}>

      <h2>Welcome, {user.name}</h2>
      <p><strong>Role:</strong> {user.role}</p>
      <p><strong>Location:</strong> {user.location}</p>
<p><strong>Latitude:</strong> {user.coordinates?.latitude}</p>
<p><strong>Longitude:</strong> {user.coordinates?.longitude}</p>

      <div style={{ marginTop: 32, marginBottom: 24 }}>
        {user.role === "citizen" ? (
          <>
            <h3>Your Petitions</h3>
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
              (Coming soon) This section will display your petitions here.
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      
      <button
        onClick={handleLogout}
        style={{
          padding: "10px 22px",
          background: "#4f46e5",
          border: "none",
          color: "#fff",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
