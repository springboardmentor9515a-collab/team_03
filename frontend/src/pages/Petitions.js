import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Petitions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [petitions, setPetitions] = useState([]);
  const [filters, setFilters] = useState({
    location: "All Locations",
    category: "All Categories",
    status: "All",
  });

  // Load user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) navigate("/login");
    else setUser(JSON.parse(storedUser));
  }, [navigate]);

  // Add newly created complaint from navigation state
  useEffect(() => {
    if (location.state?.newPetition) {
      setPetitions((prev) => [location.state.newPetition, ...prev]);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch complaints from backend
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        const token = localStorage.getItem("token");
        const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/complaints/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setPetitions(data.data);
      } catch (err) {
        console.error("Error fetching complaints:", err);
      }
    };
    fetchPetitions();
  }, []);

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "received":
        return "text-green-600";
      case "in_review":
        return "text-yellow-600";
      case "resolved":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "infrastructure": return "bg-blue-100 text-blue-600";
      case "sanitation": return "bg-yellow-100 text-yellow-600";
      case "utilities": return "bg-purple-100 text-purple-600";
      case "safety": return "bg-red-100 text-red-600";
      case "environment": return "bg-green-100 text-green-600";
      case "water": return "bg-cyan-100 text-cyan-600";
      case "electricity": return "bg-orange-100 text-orange-600";
      case "roads": return "bg-indigo-100 text-indigo-600";
      case "waste_management": return "bg-pink-100 text-pink-600";
      case "other":
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const filteredPetitions = petitions.filter((p) => {
    return (
      (filters.location === "All Locations" || (p.location && p.location.name === filters.location)) &&
      (filters.category === "All Categories" || p.category === filters.category) &&
      (filters.status === "All" || p.status === filters.status)
    );
  });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col justify-between">
        <div>
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-blue-600">Civix</h1>
            {user && (
              <div className="mt-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400">{user.location}</p>
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => navigate("/dashboard")} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 font-medium text-blue-600">Dashboard</button>
            <button className="w-full text-left px-4 py-2 rounded bg-blue-600 text-white font-medium">Petitions</button>
            <button onClick={() => navigate("/polls")} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 font-medium">Polls</button>
            <button onClick={() => navigate("/reports")} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 font-medium">Reports</button>
            <button onClick={() => navigate("/settings")} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 font-medium">Settings</button>
          </nav>
        </div>

        <div className="p-4 border-t">
          <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-600 py-2 rounded-md hover:bg-red-200 font-medium">Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Petitions</h2>
            <p className="text-gray-600">Browse, sign, and track petitions in your community.</p>
          </div>

          <button onClick={() => navigate("/ComplaintCreate")} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">
            + Create Petition
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select name="location" onChange={handleFilterChange} className="border rounded-md px-3 py-2">
            <option>All Locations</option>
          </select>

          <select name="category" onChange={handleFilterChange} className="border rounded-md px-3 py-2">
            <option>All Categories</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="sanitation">Sanitation</option>
            <option value="utilities">Utilities</option>
            <option value="safety">Safety</option>
            <option value="environment">Environment</option>
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
            <option value="roads">Roads</option>
            <option value="waste_management">Waste Management</option>
            <option value="other">Other</option>
          </select>

          <select name="status" onChange={handleFilterChange} className="border rounded-md px-3 py-2">
            <option>All</option>
            <option>received</option>
            <option>in_review</option>
            <option>resolved</option>
          </select>
        </div>

        {/* Petition Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPetitions.length > 0 ? (
            filteredPetitions.map((petition) => (
              <div key={petition._id} className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition">
                <span className={`text-sm font-semibold px-2 py-1 rounded ${getCategoryColor(petition.category)}`}>
                  {petition.category}
                </span>

                {/* Show Thumbnail if Image Available */}
                {petition.imageUrl && (
                  <img
                    src={petition.imageUrl}
                    alt="Petition"
                    className="w-full h-40 object-cover rounded-lg mt-3"
                  />
                )}

                <h3 className="mt-3 text-lg font-bold">{petition.title}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">{petition.description}</p>

                <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                  <span>{new Date(petition.createdAt).toLocaleDateString()}</span>
                  <span className={getStatusColor(petition.status)}>{petition.status}</span>
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => navigate(`/petitions/${petition._id}`, { state: { petition } })}
                    className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full mt-12">No petitions available.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Petitions;
