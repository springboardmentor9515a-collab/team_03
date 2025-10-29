import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

export default function PetitionDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [petition, setPetition] = useState(location.state?.petition || null);
  const [loading, setLoading] = useState(!petition);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!petition) {
      const fetchPetition = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem("token");
          const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
          const res = await fetch(`${API_URL}/api/complaints/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (data.success) {
            setPetition(data.data);
          } else {
            setError(data.message || "Failed to load petition details.");
          }
        } catch (err) {
          console.error("Error fetching petition details:", err);
          setError("Network or server error while fetching details.");
        } finally {
          setLoading(false);
        }
      };
      fetchPetition();
    }
  }, [id, petition]);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!petition) return <p className="text-center mt-10 text-gray-500">No details found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </button>

      <div className="bg-white shadow-md rounded-2xl p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-3">{petition.title}</h2>
        <p className="text-gray-700 mb-4">{petition.description}</p>

        {/* Image Display */}
        {petition.photo_url ? (
          <img
            src={petition.photo_url}
            alt="Petition"
            className="rounded-xl shadow mb-4 max-h-96 w-full object-cover"
          />
        ) : (
          <p className="text-gray-400 italic mb-4">
            No image uploaded for this petition.
          </p>
        )}

        <div className="flex flex-wrap justify-between text-sm text-gray-500 mt-2">
          <span>
            <strong>Category:</strong> {petition.category || "N/A"}
          </span>
          <span>
            <strong>Status:</strong> {petition.status || "Pending"}
          </span>
          <span>
            <strong>Date:</strong>{" "}
            {petition.createdAt
              ? new Date(petition.createdAt).toLocaleDateString()
              : "Unknown"}
          </span>
        </div>

        {petition.location?.coordinates && (
          <div className="mt-3 text-gray-600 text-sm">
            📍 <strong>Location:</strong>{" "}
            {petition.location.coordinates[1].toFixed(4)},{" "}
            {petition.location.coordinates[0].toFixed(4)}
          </div>
        )}

        {petition.admin_notes && (
          <div className="mt-3 bg-gray-50 p-3 rounded-lg border text-sm text-gray-700">
            <strong>Admin Notes:</strong> {petition.admin_notes}
          </div>
        )}
      </div>
    </div>
  );
}
