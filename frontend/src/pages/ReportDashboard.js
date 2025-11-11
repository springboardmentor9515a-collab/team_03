import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const COLORS = ["#2563eb", "#22c55e", "#ef4444", "#facc15", "#a855f7"];

function ReportsDashboard() {
  const [stats, setStats] = useState({
    pollStatus: {},
    complaintStatus: {},
    totalPolls: 0,
    totalComplaints: 0,
    activeEngagement: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngagementReport();
  }, []);

  // ✅ Fetch Combined Engagement Data (backend format)
  const fetchEngagementReport = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/reports/engagement`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { polls, complaints } = res.data; // ✅ renamed from petitions → polls

      const pollStatus = convertToStatusObject(polls);
      const complaintStatus = convertToStatusObject(complaints);

      const totalPolls = polls.reduce((acc, s) => acc + s.total, 0);
      const totalComplaints = complaints.reduce((acc, s) => acc + s.total, 0);

      setStats({
        pollStatus,
        complaintStatus,
        totalPolls,
        totalComplaints,
        activeEngagement: totalPolls + totalComplaints,
      });

      setLoading(false);
    } catch (error) {
      console.error("❌ Error fetching engagement report:", error);
      setLoading(false);
    }
  };

  // ✅ Convert backend array to object { status: count }
  const convertToStatusObject = (arr = []) => {
    const result = {};
    arr.forEach((item) => {
      result[item._id] = item.total;
    });
    return result;
  };

  // ✅ Format chart data for Recharts
  const formatChartData = (obj) =>
    Object.entries(obj).map(([status, count]) => ({
      name: status,
      value: count,
    }));

  // ✅ Export functions
  const exportCSV = () => window.open(`${API_URL}/api/reports/export/csv`, "_blank");
  const exportPDF = () => window.open(`${API_URL}/api/reports/export/pdf`, "_blank");

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Reports & Analytics
          </h2>
          <p className="text-gray-500 text-sm">
            Track civic engagement and measure poll and complaint activity.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ⬇️ Export CSV
          </button>
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <h3 className="text-sm text-gray-500">Total Polls</h3>
              <p className="text-3xl font-bold text-blue-700">
                {stats.totalPolls}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <h3 className="text-sm text-gray-500">Total Complaints</h3>
              <p className="text-3xl font-bold text-green-700">
                {stats.totalComplaints}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border">
              <h3 className="text-sm text-gray-500">Active Engagement</h3>
              <p className="text-3xl font-bold text-indigo-700">
                {stats.activeEngagement}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Poll Status Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Poll Status Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={formatChartData(stats.pollStatus)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formatChartData(stats.pollStatus).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Complaint Status Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Complaint Status Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={formatChartData(stats.complaintStatus)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formatChartData(stats.complaintStatus).map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ReportsDashboard;
