
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPoll } from ".././utils/api";

export default function PollCreate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [location, setLocation] = useState("");
  const [autoLocation, setAutoLocation] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const navigate = useNavigate();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setAutoLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        () => setAutoLocation("")
      );
    }
  }, []);

  const handleOptionChange = (i, value) => {
    const updated = [...options];
    updated[i] = value;
    setOptions(updated);
  };
  const addOption = () => setOptions([...options, ""]);
  const removeOption = (i) => options.length > 2 && setOptions(options.filter((_, idx) => idx !== i));

  // SAMPLE QUICK FILL
  const autofill1 = () => {
    setTitle("Where should we hold the annual festival?");
    setDescription("We want your opinion for the best civic event venue this year.");
    setOptions(["Town Hall", "Central Park", "Library Auditorium"]);
    setLocation("San Francisco, CA");
    setCloseDate("");
    setMessage("");
  };

  const autofill2 = () => {
    setTitle("What should be our next community project?");
    setDescription("Choose a focus area for our 2026 budget.");
    setOptions(["Public Library Renovation", "Safe Cycling Tracks", "Replanting the Park"]);
    setLocation("Downtown");
    setCloseDate("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!title.trim()) return setMessage("Title is required");
    if (options.filter(o => o.trim()).length < 2) return setMessage("At least two options required");
    if (!location.trim()) return setMessage("Location is required");

    setLoading(true);

    const res = await createPoll({
      title,
      options: options.filter(o => o.trim()),
      target_location: location,
      description,
      closeDate
    });

    if (res.ok) {
      setMessageType("success");
      setMessage("Poll created successfully!");
      setTimeout(() => navigate("/admin/dashboard"), 1300);
    } else {
      setMessageType("error");
      setMessage(res.error || "Failed to create poll");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pb-14">
     
      <nav className="w-full max-w-full bg-white py-4 px-12 shadow-sm flex justify-between items-center rounded-b-xl">
        <span
          className="text-blue-600 font-extrabold text-[2rem] tracking-wide cursor-pointer select-none"
          onClick={() => navigate("/admin/dashboard")}
        >
          CIVIX
        </span>
        <ul className="flex gap-11 text-lg text-gray-600 font-semibold">
          <li
            onClick={() => navigate("/admin/dashboard")}
            className="hover:text-blue-500 cursor-pointer transition-all"
          >
            Dashboard
          </li>
          <li className="text-blue-600 border-b-2 border-blue-600 cursor-pointer px-2">
            Create Poll
          </li>
          <li className="hover:text-blue-500 cursor-pointer">My Polls</li>
          <li className="hover:text-blue-500 cursor-pointer">Community</li>
        </ul>
        <span className="h-9 w-9 bg-gray-200 rounded-full block"></span>
      </nav>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl drop-shadow-2xl mt-12 w-full max-w-2xl px-12 py-10 space-y-6 border"
      >
        <h2 className="text-2xl font-bold mb-1">Create New Poll</h2>
        <p className="text-gray-500 text-base mb-4">Engage your community by creating a poll to gather feedback on local issues.</p>

          
        <div>
          <label className="block text-base font-semibold mb-1">
            Poll Question<span className="text-red-400">*</span>
          </label>
          <input
            className="w-full border border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-md px-3 py-3 text-lg outline-none transition-all"
            value={title}
            placeholder="What do you want to ask the community?"
            onChange={e => setTitle(e.target.value)}
            required
          />
          <p className="text-xs text-gray-400 mt-1">Keep it clear and specific for better community engagement.</p>
        </div>
        {/* Description */}
        <div>
          <label className="block text-base font-semibold mb-1">Description</label>
          <textarea
            className="w-full border border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-md px-3 py-3 text-lg outline-none transition-all"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Provide more context..."
            rows={3}
          />
        </div>

              
        <div>
          <div className="flex justify-between items-end">
            <span className="block text-base font-semibold mb-1">
              Poll Options<span className="text-red-400">*</span>
            </span>
            <span className="text-xs text-gray-400">2-19 options allowed</span>
          </div>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex space-x-2 items-center">
                <span className="w-6 text-center text-gray-400 mt-2">{i + 1}</span>
                <input
                  className="flex-1 border border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-md px-3 py-3 text-lg outline-none transition-all"
                  value={opt}
                  onChange={e => handleOptionChange(i, e.target.value)}
                  required
                  placeholder={`Enter option ${i + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="ml-1 text-red-400 font-semibold hover:underline text-base p-1"
                  >Remove</button>
                )}
              </div>
            ))}
            <button type="button" className="text-blue-600 font-semibold text-base hover:underline mt-1 transition-all" onClick={addOption}>
              + Add Another Option
            </button>
          </div>
        </div>

              
        <div>
          <label className="block text-base font-semibold mb-1">
            Target Location<span className="text-red-400">*</span>
          </label>
          <input
            className="w-full border border-gray-200 hover:border-blue-300 focus:border-blue-400 rounded-md px-3 py-3 bg-gray-100 text-gray-700 font-medium text-lg outline-none transition-all"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Auto-detected location"
            required
          />
          <p className={`text-xs mt-1 ${autoLocation ? "text-green-600" : "text-yellow-600"}`}>
            {autoLocation ? "Location detected automatically. You can change it." : "Please enter your area or city manually."}
          </p>
        </div>
            
        <div>
          <label className="block text-base font-semibold mb-1">Closes On</label>
          <input
            type="date"
            className="w-full border border-gray-300 hover:border-blue-400 focus:border-blue-500 rounded-md px-3 py-3 text-lg outline-none transition-all"
            value={closeDate}
            onChange={e => setCloseDate(e.target.value)}
            min={new Date().toISOString().substring(0, 10)}
          />
          <p className="text-xs text-gray-400 mt-1">Maximum 30 days from today.</p>
        </div>

            
        <div className="bg-blue-50 border border-blue-300 rounded-md px-4 py-3 text-sm text-blue-900">
          <b className="block mb-1">Community Guidelines</b>
          Polls should be designed to gather genuine community feedback on issues that affect your area.
          Polls that are misleading or designed to push a specific agenda may be removed.
        </div>

            
        <div className="flex space-x-4 pt-4">
          <button type="button" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-semibold border border-gray-200 text-lg hover:bg-gray-200 transition-all" onClick={() => navigate("/admin/dashboard")}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-7 py-3 rounded-md font-semibold shadow hover:bg-blue-700 disabled:opacity-75 text-lg transition-all">
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </div>
        {message && <div className={messageType === "success" ? "text-green-600 text-lg mt-1" : "text-red-500 text-lg mt-1"}>{message}</div>}
      </form>
      
      <div className="mt-10 flex flex-col items-center space-y-2">
        <span className="font-bold text-gray-600 mb-2">Try sample polls:</span>
        <button onClick={autofill1} className="px-6 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 font-semibold shadow transition-all">
          Annual Festival poll
        </button>
        <button onClick={autofill2} className="px-6 py-2 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 font-semibold shadow transition-all">
          Community Project poll
        </button>
      </div>
    </div>
  );
}


