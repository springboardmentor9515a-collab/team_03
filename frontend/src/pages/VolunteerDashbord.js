import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  getAssignedComplaints,
  logoutUser,
  updateComplaintStatus, // 👈 added
} from "../utils/api";

function VolunteerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ status: "All" });
  const [loading, setLoading] = useState(true);

  const statuses = ["All", "received", "in_review", "resolved"];

  useEffect(() => {
    async function fetchData() {
      try {
        const profileRes = await getProfile();
        if (profileRes.success) {
          setUser(profileRes.user);
          const complaintRes = await getAssignedComplaints();
          if (complaintRes.ok && complaintRes.data?.data) {
            setComplaints(complaintRes.data.data);
          }
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  const handleSignOut = async () => {
    await logoutUser();
    navigate("/login");
  };

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

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

  // 👇 update status handler
  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      const res = await updateComplaintStatus(complaintId, newStatus);
      if (res.success) {
        // update local state
        setComplaints((prev) =>
          prev.map((c) =>
            c._id === complaintId ? { ...c, status: newStatus } : c
          )
        );
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const filteredComplaints =
    filters.status === "All"
      ? complaints
      : complaints.filter((c) => c.status === filters.status);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );

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
                  <p className="text-xs text-gray-400">
                    {user.location || "Not set"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button className="w-full text-left px-4 py-2 rounded bg-blue-600 text-white font-medium">
              Dashboard
            </button>
            <button
              onClick={() => navigate("/volunteer/assigned-tasks")}
              className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 font-medium"
            >
              Assigned Tasks
            </button>
            <button
              onClick={() => navigate("/polls")}
              className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 font-medium"
            >
              Polls
            </button>
            <button
              onClick={() => navigate("/reports")}
              className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 font-medium"
            >
              Reports
            </button>
          </nav>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-600 py-2 rounded-md hover:bg-red-200 font-medium"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Volunteer Dashboard</h2>
            <p className="text-gray-600">
              Manage and track complaints assigned to you.
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Total Assigned</p>
            <h3 className="text-2xl font-bold mt-1">{complaints.length}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">In Review</p>
            <h3 className="text-2xl font-bold mt-1">
              {complaints.filter((c) => c.status === "in_review").length}
            </h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow">
            <p className="text-gray-500 text-sm">Resolved</p>
            <h3 className="text-2xl font-bold mt-1">
              {complaints.filter((c) => c.status === "resolved").length}
            </h3>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            name="status"
            onChange={handleFilterChange}
            className="border rounded-md px-3 py-2"
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Complaint Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.length > 0 ? (
            filteredComplaints.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition"
              >
                <span className="text-sm font-semibold px-2 py-1 rounded bg-blue-50 text-blue-600">
                  {c.category}
                </span>

                <h3 className="mt-3 text-lg font-bold">{c.title}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                  {c.description}
                </p>

                <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  <span className={getStatusColor(c.status)}>{c.status}</span>
                </div>

                {/* Location UI */}
                <div className="flex items-center gap-2 text-sm mt-2">
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                    🌍 Location:
                    {typeof c.location === "object" ? (
                      c.location.coordinates ? (
                        <span className="ml-1">
                          Lat: {c.location.coordinates[1].toFixed(4)}, Lng:{" "}
                          {c.location.coordinates[0].toFixed(4)}
                        </span>
                      ) : (
                        <span className="ml-1 text-gray-500">Unknown</span>
                      )
                    ) : (
                      <span className="ml-1">{c.location || "Unknown"}</span>
                    )}
                  </span>

                  {typeof c.location === "object" && c.location.coordinates && (
                    <a
                      href={`https://www.google.com/maps?q=${c.location.coordinates[1]},${c.location.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View on Map
                    </a>
                  )}
                </div>

                {/* Status Update & View Details */}
                <div className="flex justify-between items-center mt-4">
                  <select
                    value={c.status}
                    onChange={(e) =>
                      handleStatusUpdate(c._id, e.target.value)
                    }
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="received">Received</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <button
                    onClick={() =>
                      navigate(`/petitions/${c._id}`, { state: { petition: c } })
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
              No assigned complaints found.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default VolunteerDashboard;
