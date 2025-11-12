import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, getMyComplaints, logoutUser } from "../utils/api";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [filters, setFilters] = useState({
    category: "All Categories",
    status: "All",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const profile = await getProfile();
        if (!profile.success) {
          navigate("/login");
          return;
        }

        setUser(profile.user);
        const compRes = await getMyComplaints();
        if (compRes.ok && compRes.data?.data) {
          setComplaints(compRes.data.data);
          setFilteredComplaints(compRes.data.data);
        }
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  useEffect(() => {
    let filtered = complaints;
    if (filters.category !== "All Categories") {
      filtered = filtered.filter((c) => c.category === filters.category);
    }
    if (filters.status !== "All") {
      filtered = filtered.filter((c) => c.status === filters.status);
    }
    setFilteredComplaints(filtered);
  }, [filters, complaints]);

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const goToCreatePetition = () => navigate("/complaintCreate");

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
      default: return "bg-gray-100 text-gray-600";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        User not found
      </div>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col justify-between">
        <div>
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-blue-600">Civix</h1>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button className="w-full text-left px-4 py-2 rounded bg-blue-600 text-white font-medium">
              Dashboard
            </button>
            <button onClick={() => navigate("/petitions")} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 font-medium text-blue-600">
              Petitions
            </button>
            <button onClick={() => navigate("/polls")} className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 font-medium">
              Polls
            </button>
          </nav>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-600 py-2 rounded-md hover:bg-red-200 font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold"> Citizen Dashboard</h2>
            <p className="text-gray-600">View your complaints and activity overview.</p>
          </div>

          <button
            onClick={goToCreatePetition}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            + Create Complaint
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            name="category"
            onChange={handleFilterChange}
            className="border rounded-md px-3 py-2"
          >
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
          </select>

          <select
            name="status"
            onChange={handleFilterChange}
            className="border rounded-md px-3 py-2"
          >
            <option>All</option>
            <option>received</option>
            <option>in_review</option>
            <option>resolved</option>
          </select>
        </div>

        {/* Complaint Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition"
              >
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded ${getCategoryColor(
                    complaint.category
                  )}`}
                >
                  {complaint.category}
                </span>

                <h3 className="mt-3 text-lg font-bold">{complaint.title}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                  {complaint.description}
                </p>

                <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                  <span>
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                  <span className={getStatusColor(complaint.status)}>
                    {complaint.status}
                  </span>
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() =>
                      navigate(`/petitions/${complaint._id}`, {
                        state: { petition: complaint },
                      })
                    }
                    className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full mt-12">
              No complaints found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
