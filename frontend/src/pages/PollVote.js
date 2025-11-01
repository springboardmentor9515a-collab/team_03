import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function PollVote() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [voted, setVoted] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPoll = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(`${API_URL}/api/polls/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const data = await res.json();
        if (res.ok) {
          setPoll(data.data);
        } else if (res.status === 401) {
          alert("Please log in to view this poll.");
          navigate("/login");
        } else {
          console.error("Fetch poll failed:", data.message);
        }
      } catch (err) {
        console.error("Error fetching poll:", err);
      }
    };

    fetchPoll();
  }, [id, navigate]);


//vote submission handler
const handleVote = async () => {
  if (!selectedOption) return alert("Please select an option first!");

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to vote.");
    navigate("/login");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/polls/${id}/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ selected_option: selectedOption }),
    });

    const data = await res.json();

    if (res.ok) {
      setVoted(true);
      setMessage("✅ Your vote has been recorded successfully!");

      // 👇 Redirect to Poll List after a short delay
      setTimeout(() => {
        navigate("/polls");
      }, 2000); // wait 2 seconds before navigating
    } else {
      setMessage(data.message || "⚠️ You may have already voted.");
    }
  } catch (err) {
    console.error("Vote error:", err);
    setMessage("❌ Error submitting vote.");
  }
};


  if (!poll)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading poll...
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-lg w-full transition-transform transform hover:scale-[1.01]">
        <h2 className="text-2xl font-semibold text-center text-blue-700 mb-6">
          {poll.title}
        </h2>

        <div className="space-y-3">
          {poll.options.map((opt, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                selectedOption === opt
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="pollOption"
                value={opt}
                checked={selectedOption === opt}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-gray-800 font-medium">{opt}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleVote}
          disabled={voted}
          className={`w-full mt-6 py-3 text-white font-semibold rounded-xl transition-all ${
            voted
              ? "bg-green-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {voted ? "Voted ✅" : "Submit Vote"}
        </button>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes("✅")
                ? "text-green-600"
                : message.includes("⚠️")
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default PollVote;
