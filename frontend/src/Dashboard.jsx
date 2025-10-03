import React, { useState } from "react";

const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedLocation, setSelectedLocation] = useState("San Diego, CA");

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

  const locations = ["San Diego, CA", "Los Angeles, CA", "New York, NY"];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
            S
          </div>
          <div className="ml-4">
            <h2 className="font-semibold text-gray-800">Sri</h2>
            <p className="text-sm text-gray-500">Unverified Official</p>
            <p className="text-sm text-gray-400">San Diego, CA</p>
            <p className="text-sm text-gray-400">example@gmail.com</p>
          </div>
        </div>

        <nav className="flex-1">
          {[
            "Dashboard",
            "Petitions",
            "Polls",
            "Officials",
            "Reports",
            "Settings",
            "Help & Support",
          ].map((item) => (
            <button
              key={item}
              className="w-full text-left px-4 py-2 rounded hover:bg-blue-100 mb-2 text-gray-700 font-medium"
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Welcome Banner */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, Sri!
          </h1>
        </div>

        {/* Statistic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-gray-500 font-medium mb-2">My Petitions</h3>
            <p className="text-2xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-gray-500 font-medium mb-2">
              Successful Petitions
            </h3>
            <p className="text-2xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white shadow rounded p-6">
            <h3 className="text-gray-500 font-medium mb-2">Polls Created</h3>
            <p className="text-2xl font-bold text-blue-600">0</p>
          </div>
        </div>

        {/* Active Petitions Section */}
        <div className="bg-white shadow rounded p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">
              Active Petitions Near You
            </h2>

            {/* Location Dropdown */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded ${
                  selectedCategory === cat
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Placeholder for petitions */}
          <div className="text-center py-16 border-t border-gray-200">
            <p className="text-gray-500 mb-4">
              No petitions found with the current filters.
            </p>
            <button
              onClick={() => setSelectedCategory("All Categories")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
