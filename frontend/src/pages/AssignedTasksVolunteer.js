import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  getAssignedComplaints,
  logoutUser,
  updateComplaintStatus, // 👈 added
} from "../utils/api";

function VolunteerAssignedTasks() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  const statuses = ["All", "received", "in_review", "resolved"];

  // ✅ Fetch volunteer profile & assigned complaints
  useEffect(() => {
    async function fetchData() {
      try {
        const profile = await getProfile();
        if (!profile.success) {
          navigate("/login");
          return;
        }

        setUser(profile.user);

        const res = await getAssignedComplaints();
        if (res.ok && res.data?.data) {
          setTasks(res.data.data);
          setFilteredTasks(res.data.data);
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

  // ✅ Filter tasks by status
  useEffect(() => {
    if (selectedStatus === "All") setFilteredTasks(tasks);
    else setFilteredTasks(tasks.filter((t) => t.status === selectedStatus));
  }, [selectedStatus, tasks]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "received":
        return "text-green-600";
      case "in_review":
        return "text-yellow-600";
      case "resolved":
        return "text-gray-600";
      default:
        return "text-gray-400";
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case "infrastructure":
        return "bg-blue-100 text-blue-600";
      case "sanitation":
        return "bg-yellow-100 text-yellow-600";
      case "utilities":
        return "bg-purple-100 text-purple-600";
      case "safety":
        return "bg-red-100 text-red-600";
      case "environment":
        return "bg-green-100 text-green-600";
      case "water":
        return "bg-cyan-100 text-cyan-600";
      case "roads":
        return "bg-indigo-100 text-indigo-600";
      case "electricity":
        return "bg-orange-100 text-orange-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ✅ Update complaint status
  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const res = await updateComplaintStatus(taskId, newStatus);
      if (res.success) {
        // Update locally so UI is reactive
        setTasks((prev) =>
          prev.map((t) =>
            t._id === taskId ? { ...t, status: newStatus } : t
          )
        );
      } else {
        alert("Failed to update complaint status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
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
            <h1 className="text-2xl font-bold text-sky-600">CIVIX</h1>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center text-lg font-semibold">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => navigate("/volunteer/dashboard")}
              className="w-full text-left px-4 py-2 rounded hover:bg-sky-50 font-medium text-sky-600"
            >
              Dashboard
            </button>
            <button className="w-full text-left px-4 py-2 rounded bg-sky-600 text-white font-medium">
              Assigned Tasks
            </button>
            <button
              onClick={() => navigate("/polls")}
              className="w-full text-left px-4 py-2 rounded hover:bg-blue-50 font-medium"
            >
              Polls
            </button>
            <button
              onClick={() => navigate("/volunteer/reports")}
              className="w-full text-left px-4 py-2 rounded hover:bg-sky-50 font-medium"
            >
              Reports
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
            <h2 className="text-2xl font-bold">Assigned Complaints</h2>
            <p className="text-gray-600">
              View, update, and track the complaints assigned to you.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Complaint Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition"
              >
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded ${getCategoryColor(
                    task.category
                  )}`}
                >
                  {task.category}
                </span>

                <h3 className="mt-3 text-lg font-bold">{task.title}</h3>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                  {task.description}
                </p>

                <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                  <span>
                    {typeof task.location === "object"
                      ? task.location.coordinates
                        ? `Lat: ${task.location.coordinates[1]}, Lng: ${task.location.coordinates[0]}`
                        : "Unknown location"
                      : task.location || "Unknown location"}
                  </span>

                  <span className={getStatusColor(task.status)}>
                    {task.status}
                  </span>
                </div>

                {/* ✅ Status update + View Details buttons */}
                <div className="flex justify-between items-center mt-4">
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusUpdate(task._id, e.target.value)
                    }
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value="received">Received</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>

                  <button
                    onClick={() => {
                      if (task._id) {
                        navigate(`/petitions/${task._id}`, {
                          state: { petition: task },
                        });
                      } else {
                        alert("Invalid task ID");
                      }
                    }}
                    className="border border-sky-600 text-sky-600 px-4 py-1.5 rounded-lg hover:bg-sky-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full mt-12">
              No assigned complaints yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default VolunteerAssignedTasks;
