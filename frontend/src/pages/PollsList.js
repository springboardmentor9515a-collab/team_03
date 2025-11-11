import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, getAllPolls } from "../utils/api"; // centralized API helpers

function PollsList() {
  const [polls, setPolls] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [userLocation, setUserLocation] = useState("");
  const navigate = useNavigate();

  // 🧠 Fetch user profile (authenticated)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getProfile();
        if (data?.user) setUser(data.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchUser();
  }, []);

  // 📊 Fetch all polls
  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      try {
        const { ok, data } = await getAllPolls();
        if (ok) {
          // Backend returns { success: true, data: polls[] }
          // Extract the actual polls array
          const pollsArray = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          setPolls(pollsArray);
        } else {
          setError(data?.message || data?.error || "Failed to load polls");
        }
      } catch (err) {
        console.error("Error fetching polls:", err);
        setError("Error connecting to the server");
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, []);


  // 📍 Get user's current location
  const handleGetNearbyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation(`${latitude.toFixed(3)},${longitude.toFixed(3)}`);
          setLocationFilter("nearby");
        },
        () => alert("Could not access location. Please allow location access.")
      );
    } else alert("Geolocation not supported in your browser.");
  };


  // 🌍 Helper to calculate distance between two lat,lng points (Haversine formula)
  const getDistanceKm = (loc1, loc2) => {
    try {
      const [lat1, lon1] = loc1.split(",").map(Number);
      const [lat2, lon2] = loc2.split(",").map(Number);

      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // distance in kilometers
    } catch {
      return Infinity;
    }
  };

  // 🧩 Filter polls by category and location (including nearby)
  // Ensure polls is always an array before filtering
  const filteredPolls = Array.isArray(polls) ? polls.filter((poll) => {
    const matchCategory = categoryFilter ? poll.category === categoryFilter : true;
    let matchLocation = true;

    if (locationFilter && locationFilter !== "nearby") {
      matchLocation = poll.target_location === locationFilter;
    }

    // ✅ Nearby filter logic (within 10 km radius)
    if (locationFilter === "nearby" && userLocation && poll.target_location) {
      const distance = getDistanceKm(userLocation, poll.target_location);
      matchLocation = distance <= 10; // You can adjust the radius (e.g. 5 or 20 km)
    }

    return matchCategory && matchLocation;
  }) : [];

  // 🔘 Handle vote navigation (only for citizens)
  const handleVoteClick = (pollId) => {
    if (!user) {
      alert("Please log in to vote.");
      navigate("/login");
      return;
    }

    if (user.role === "citizen") {
      navigate(`/polls/${pollId}`);
    } else {
      alert("Only citizens can participate in voting.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 shadow-sm flex flex-col">
  <h2 className="text-2xl font-bold text-blue-600 mb-6 tracking-wide">CIVIX</h2>

  {user && (
    <>
      {/* User Info */}
      <div className="flex items-center gap-3 mb-8">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-semibold">
          {user.name?.[0]?.toUpperCase()}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="font-semibold text-gray-800 leading-tight">{user.name}</p>
          <p className="text-xs text-gray-500 truncate max-w-[140px]">{user.email}</p>
          <p className="text-xs text-gray-400">{user.location}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <button
          onClick={() => navigate("/complaints/:id/sentiment")}
          className="w-full text-left px-4 py-2 rounded-md hover:bg-blue-50 font-medium text-blue-600 transition"
        >
          Results
        </button>

       
      
      </nav>
    </>
  )}
</aside>


      {/* Main Content */}
      <main className="flex-1 p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Polls</h1>
            <p className="text-gray-500 text-sm">
              Participate in active community polls near you.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-200 focus:outline-none"
          >
            <option value="">All Locations</option>
            {Array.isArray(polls) && [...new Set(polls.map((p) => p.target_location).filter(Boolean))].map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
            <option value="nearby">📍 Nearby My Location</option>
          </select>

          {locationFilter === "nearby" && !userLocation && (
            <button
              onClick={handleGetNearbyLocation}
              className="text-blue-600 underline text-sm"
            >
              Detect My Location
            </button>
          )}
        </div>

        {/* Poll List */}
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading polls...</p>
        ) : error ? (
          <p className="text-center text-red-500 mt-10">{error}</p>
        ) : filteredPolls.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm">
            <p className="text-gray-600 mb-3">No polls found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolls.map((poll) => (
              <div
                key={poll._id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <p
                    className={`text-xs font-medium ${
                      poll.status === "active"
                        ? "text-green-600"
                        : poll.status === "closed"
                        ? "text-gray-400"
                        : "text-yellow-600"
                    }`}
                  >
                    {poll.status}
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
                  {poll.title}
                </h3>

                <p className="text-xs text-gray-500 mb-2">
                  Location: {poll.target_location}
                </p>

                <p className="text-xs text-gray-400 mb-4">
                  Created on: {new Date(poll.createdAt).toLocaleDateString()}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleVoteClick(poll._id)}
                    className="flex-1 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition"
                  >
                    Vote Now
                  </button>
                  <button
                    onClick={() => navigate(`/polls/${poll._id}/sentiment`)}
                    className="flex-1 border border-green-600 text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 hover:text-white transition"
                  >
                    View Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default PollsList;
