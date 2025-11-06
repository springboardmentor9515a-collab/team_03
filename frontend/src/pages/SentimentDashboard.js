import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  Cell, ResponsiveContainer
} from 'recharts';
import axios from 'axios';

const COLORS = ['#4CAF50', '#f44336', '#FFC107']; // Green for Yes, Red for No, Yellow for Maybe
const REFRESH_INTERVAL = 5000; // Refresh every 5 seconds

const SentimentDashboard = () => {
  const { id } = useParams(); // Get petition/poll ID from URL
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    try {
      // API is mounted under /api/complaints in backend
      const response = await axios.get(`${process.env.REACT_APP_API_URL || ''}/api/complaints/${id}/sentiment`);
      setResults(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // Set up auto-refresh
    const interval = setInterval(fetchResults, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-4">Error: {error}</div>;
  if (!results) return null;

  // Format data for charts
  const chartData = Object.entries(results.results).map(([name, value]) => ({
    name,
    value,
    percentage: results.percentages[name]
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Sentiment Results</h2>
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Votes</h3>
          <p className="text-3xl">{results.total}</p>
        </div>
        {Object.entries(results.percentages).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">{key}</h3>
            <p className="text-3xl">{value}%</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Distribution (Pie Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Distribution (Bar Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Votes">
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-4">
        Auto-refreshing every {REFRESH_INTERVAL / 1000} seconds
      </div>
    </div>
  );
};

export default SentimentDashboard;