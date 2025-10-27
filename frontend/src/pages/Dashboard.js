import React, { useEffect, useState } from "react";
import { getProfile, getMyComplaints, logoutUser } from "../utils/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getProfile();
        if (res.success) {
          setUser(res.user);
          const compRes = await getMyComplaints();
          if (compRes.ok && compRes.data?.data) {
            setComplaints(compRes.data.data);
            setFilteredComplaints(compRes.data.data);
          }
        } else {
          navigate("/login");
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

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const goToCreatePetition = () => navigate("/complaintCreate");

  const categories = [
    "All Categories",
    "infrastructure",
    "sanitation",
    "utilities",
    "safety",
    "environment",
    "water",
    "electricity",
    "roads",
    "waste_management",
    "other",
  ];

  // Filter complaints by category
  useEffect(() => {
    if (selectedCategory === "All Categories") {
      setFilteredComplaints(complaints);
    } else {
      setFilteredComplaints(
        complaints.filter((c) => c.category === selectedCategory)
      );
    }
  }, [selectedCategory, complaints]);

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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1200px] mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-72 bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-semibold">
                {user.name?.charAt(0)}
              </div>
              <div>
                <div className="font-semibold capitalize">{user.name}</div>
                <div className="text-xs text-slate-500">
                  {user.role || "citizen"}
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-600 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">📧</span>
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">📍</span>
                <span>{user.location || "Not set"}</span>
              </div>
            </div>

            <nav className="mt-6 text-sm space-y-2">
              <div className="px-3 py-2 bg-slate-100 rounded-md font-medium">
                Dashboard
              </div>
              <div
                onClick={() => navigate("/petitions")}
                className="px-3 py-2 rounded-md hover:bg-slate-50 cursor-pointer"
              >
                Petitions
              </div>
              <div className="px-3 py-2 rounded-md hover:bg-slate-50 cursor-pointer">
                Polls
              </div>
              <div className="px-3 py-2 rounded-md hover:bg-slate-50 cursor-pointer">
                Reports
              </div>
            </nav>

            <button
              onClick={handleLogout}
              className="w-full mt-6 text-sm px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50"
            >
              Logout
            </button>
          </aside>

          {/* Main content */}
          <main className="flex-1 bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-semibold mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-slate-500">Here's what's happening in your area.</p>

            {/* Stats cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <div className="text-xs text-slate-500">My Petitions</div>
                <div className="text-3xl font-bold mt-2">{complaints.length}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <div className="text-xs text-slate-500">Active Cases</div>
                <div className="text-3xl font-bold mt-2">
                  {complaints.filter((c) => c.status !== "resolved").length}
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <div className="text-xs text-slate-500">Resolved</div>
                <div className="text-3xl font-bold mt-2">
                  {complaints.filter((c) => c.status === "resolved").length}
                </div>
              </div>
            </div>

            {/* Category filter */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">
                Active Petitions Near You
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      selectedCategory === c
                        ? "bg-sky-100 border-sky-300"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Complaints list */}
              {filteredComplaints.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-4">
                  {filteredComplaints.map((item) => (
                    <div
                      key={item._id}
                      className="p-4 bg-slate-50 rounded-md border border-slate-200"
                    >
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-sm text-slate-600 mt-1">
                        {item.description.slice(0, 100)}...
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                        Category: {item.category} | Status: {item.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 bg-slate-50 rounded-lg p-12 text-center text-slate-500">
                  No petitions found.{" "}
                  {user.role === "Official"
                    ? "Officials will see petitions in their area."
                    : "Citizens can create petitions here."}
                  <div className="mt-6">
                    <button
                      onClick={goToCreatePetition}
                      className="px-5 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition"
                    >
                      Create Petition
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
