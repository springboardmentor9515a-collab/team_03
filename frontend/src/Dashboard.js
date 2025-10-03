import React, { useState } from "react";

export default function CivicDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [location, setLocation] = useState("San Diego, CA");

  const menuItems = [
    "Dashboard",
    "Petitions",
    "Polls",
    "Officials",
    "Reports",
    "Settings",
    "Help & Support",
  ];

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

  function clearFilters() {
    setActiveCategory("All Categories");
    setLocation("San Diego, CA");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top bar for mobile */}
      <header className="md:hidden bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              {/* simple hamburger */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-lg font-semibold">Civix</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm">Sri</div>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
              S
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside
          className={`fixed md:sticky inset-y-0 left-0 z-30 w-72 transform md:translate-x-0 transition-transform bg-white border-r shadow-sm ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="p-5 h-full flex flex-col">
            {/* Profile */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
                S
              </div>
              <div>
                <div className="font-medium">Sri</div>
                <div className="text-xs text-gray-500">Unverified Official</div>
                <div className="text-xs text-gray-400 mt-1">San Diego, CA</div>
                <div className="text-xs text-gray-400">example@gmail.com</div>
              </div>
            </div>

            {/* Menu */}
            <nav className="flex-1">
              {menuItems.map((item) => {
                const active = item === activeMenu;
                return (
                  <button
                    key={item}
                    onClick={() => { setActiveMenu(item); setSidebarOpen(false); }}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors ${
                      active ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {/* simple icon placeholder */}
                    <span className="w-6 h-6 rounded-sm bg-transparent flex items-center justify-center text-sm">
                      {item[0]}
                    </span>
                    <span className="text-sm">{item}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="mt-4 text-xs text-gray-500">
              <div>Version Beta</div>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile when sidebar open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 ml-0 md:ml-72 p-6">
          {/* Welcome banner */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Welcome back, Sri!</h1>
                <p className="text-sm text-gray-500 mt-1">
                  See what's happening in your community and make your voice heard.
                </p>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <button className="px-4 py-2 rounded-md bg-blue-50 text-blue-600 text-sm">Create Petition</button>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">S</div>
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="text-sm text-gray-500">My Petitions</div>
              <div className="text-2xl font-semibold mt-2">0</div>
              <div className="text-xs text-gray-400 mt-1">petitions</div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="text-sm text-gray-500">Successful Petitions</div>
              <div className="text-2xl font-semibold mt-2">0</div>
              <div className="text-xs text-gray-400 mt-1">or under review</div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="text-sm text-gray-500">Polls Created</div>
              <div className="text-2xl font-semibold mt-2">0</div>
              <div className="text-xs text-gray-400 mt-1">polls</div>
            </div>
          </div>

          {/* Active Petitions Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <h2 className="text-lg font-semibold">Active Petitions Near You</h2>

              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-500">Showing for:</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="text-sm px-3 py-2 rounded-md border focus:outline-none"
                >
                  <option>San Diego, CA</option>
                  <option>Los Angeles, CA</option>
                  <option>New York, NY</option>
                </select>
              </div>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((c) => {
                const isActive = c === activeCategory;
                return (
                  <button
                    key={c}
                    onClick={() => setActiveCategory(c)}
                    className={`px-3 py-1 rounded-full text-sm border ${
                      isActive ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 text-gray-700 border-transparent"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {/* Results / Placeholder */}
            <div className="border border-dashed border-gray-200 rounded-lg p-10 text-center">
              <p className="text-gray-500 mb-4">No petitions found with the current filters.</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-md bg-white border text-sm hover:bg-gray-50"
                >
                  Clear Filters
                </button>
                <button className="px-4 py-2 rounded-md bg-blue-50 text-blue-600 text-sm">Browse All Petitions</button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
