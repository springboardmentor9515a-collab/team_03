"use client";

import React, { useState } from "react";

export default function Dashboard() {
  const [user] = useState({
    name: "Anamika",
    role: "Unverified Official",
    location: "San Diego, CA",
    email: "2041020002.sridhartamarapalli@gmail.com",
  });
  const [activeCategory, setActiveCategory] = useState("All Categories");
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
    <div className="min-h-screen bg-gray-50 text-slate-900">
      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-sky-100 flex items-center justify-center font-semibold text-sky-700">
              C
            </div>
            <div className="text-lg font-semibold">Civix <span className="text-sm font-normal text-gray-400">Beta</span></div>
          </div>
          <nav className="ml-8 hidden md:flex gap-6 text-sm text-slate-600">
            <a className="hover:text-slate-800">Home</a>
            <a className="hover:text-slate-800">Petitions</a>
            <a className="hover:text-slate-800">Polls</a>
            <a className="hover:text-slate-800">Reports</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button aria-label="notifications" className="p-2 rounded-md hover:bg-gray-100">
            🔔
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-medium">
              {user.name?.[0] ?? "U"}
            </div>
            <div className="hidden sm:block text-sm">{user.name}</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700">
                {user.name?.[0]}
              </div>
              <div>
                <div className="text-base font-semibold">{user.name}</div>
                <div className="text-xs text-slate-500">{user.role}</div>
                <div className="mt-2 text-sm text-slate-600 flex flex-col">
                  <span className="flex items-center gap-2 text-xs text-slate-500">
                    📍 {user.location}
                  </span>
                  <span className="truncate text-xs text-slate-400">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          <nav className="bg-white rounded-xl shadow-sm divide-y">
            <ul className="p-3 space-y-1">
              {[
                "Dashboard",
                "Petitions",
                "Polls",
                "Officials",
                "Reports",
                "Settings",
              ].map((item) => (
                <li
                  key={item}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm ${
                    item === "Dashboard"
                      ? "bg-sky-50 text-sky-700 font-medium"
                      : "text-slate-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="w-6 text-center text-slate-400">▪</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="p-3">
              <button className="w-full text-left text-sm text-slate-600 hover:text-slate-800">❓ Help & Support</button>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="space-y-6">
          {/* Hero */}
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Welcome back, {user.name}!</h1>
              <p className="mt-1 text-sm text-slate-500">See what's happening in your community and make your voice heard.</p>
            </div>
            <div className="ml-auto">
              <button className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg cursor-not-allowed" disabled>
                Create Petition
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="My Petitions" count={0} subtitle="petitions" />
            <StatCard title="Successful Petitions" count={0} subtitle="or under review" />
            <StatCard title="Polls Created" count={0} subtitle="polls" />
          </div>

          {/* Active petitions */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Active Petitions Near You</h2>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 text-sm bg-sky-50 text-sky-700 rounded-full flex items-center gap-2">
                  📍 {user.location}
                </div>
              </div>
            </div>

            {/* Filter chips */}
            <div className="mt-4 flex flex-wrap gap-3">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${
                    activeCategory === c
                      ? "bg-sky-500 text-white border-transparent"
                      : "bg-white text-slate-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Empty state */}
            <div className="mt-8 border border-dashed border-gray-200 rounded-lg py-12 flex flex-col items-center justify-center gap-4">
              <p className="text-slate-500">No petitions found with the current filters.</p>
              <button
                onClick={() => setActiveCategory("All Categories")}
                className="px-4 py-2 bg-white border rounded-md text-sm hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, count, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
      <div>
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-2 text-3xl font-semibold">{count}</div>
        {subtitle && (
          <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
        )}
      </div>
      <div className="text-slate-300 text-2xl">✎</div>
    </div>
  );
}

