import React, { useEffect, useState } from "react";
import { getProfile, logoutUser } from "../utils/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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

  if (!user)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading...
      </div>
    );

  const categories = [
    "All Categories",
    "Environment",
    "Infrastructure",
    "Education",
    "Public Safety",
    "Transportation",
    "Healthcare",
    "Housing",
  ];

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
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-slate-500">
                  {user.role || "Citizen"}
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c2.28 0 4-1.72 4-4s-1.72-4-4-4-4 1.72-4 4 1.72 4 4 4z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"
                  />
                </svg>
                <span>{user.email}</span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a4 4 0 00-4-4h-1"
                  />
                </svg>
                <span>{user.location || "Not set"}</span>
              </div>
            </div>

            <nav className="mt-6">
              <ul className="space-y-2 text-sm">
                <li className="px-3 py-2 rounded-md bg-slate-100 font-medium">
                  Dashboard
                </li>
                <li className="px-3 py-2 rounded-md hover:bg-slate-50">
                  Petitions
                </li>
                <li className="px-3 py-2 rounded-md hover:bg-slate-50">
                  Polls
                </li>
                <li className="px-3 py-2 rounded-md hover:bg-slate-50">
                  Reports
                </li>
              </ul>
            </nav>

            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full text-sm px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-semibold mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-slate-500">
                Here’s what’s happening in your area.
              </p>

              {/* Stats cards */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {["My Petitions", "Active Cases", "Polls"].map((label, i) => (
                  <div
                    key={i}
                    className="p-4 bg-slate-50 rounded-lg text-center"
                  >
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="text-3xl font-bold mt-2">0</div>
                  </div>
                ))}
              </div>

              {/* Categories */}
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

                <div className="mt-6 bg-slate-50 rounded-lg p-12 text-center text-slate-500">
                  No petitions found.
                  {user.role === "Official"
                    ? " Officials will see petitions in their area."
                    : " Citizens can create petitions here."}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
