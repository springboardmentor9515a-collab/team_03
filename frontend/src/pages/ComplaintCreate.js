import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

function LocationSelector({ setForm }) {
  useMapEvents({
    click(e) {
      setForm((prev) => ({
        ...prev,
        location: `${e.latlng.lat.toFixed(5)},${e.latlng.lng.toFixed(5)}`,
      }));
    },
  });
  return null;
}

function ComplaintCreate() {
  const [form, setForm] = useState({
    title: '',
    category: '',
    location: '',
    description: '',
    photo: null,
    priority: 'medium',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const mapDefault = [12.9716, 77.5946];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setForm((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((prev) => ({
          ...prev,
          location: `${latitude.toFixed(5)},${longitude.toFixed(5)}`,
        }));
      },
      (err) => {
        console.error(err);
        alert('Failed to fetch your location.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!form.location) {
      setMessage('Please select a location.');
      setLoading(false);
      return;
    }

    const locParts = form.location.split(',').map(Number);
    if (locParts.length !== 2 || locParts.some(isNaN)) {
      setMessage('Invalid location.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());
    formData.append('category', form.category);
    formData.append('priority', form.priority);
    // ✅ Correct structure for nested location (no backend edit needed)
    formData.append('location[type]', 'Point');
    formData.append('location[coordinates][]', locParts[1]); // longitude
    formData.append('location[coordinates][]', locParts[0]); // latitude
    if (form.photo) formData.append('photo', form.photo);

    const token = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    try {const token = localStorage.getItem('token');

const res = await fetch(`${API_URL}/api/complaints`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

    
    
      
      const data = await res.json();
      console.log('Complaint Response:', data);

      if (res.ok && data.success) {
        setMessage('Complaint submitted successfully!');
        setTimeout(() => navigate('/petitions'), 1500);
        setForm({
          title: '',
          category: '',
          location: '',
          description: '',
          photo: null,
          priority: 'medium',
        });
      } else {
        setMessage(data.error || data.message || 'Submission failed.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Submission failed. Network or server error.');
    } finally {
      setLoading(false);
    }
  };

  let markerPos = mapDefault;
  if (form.location) {
    const parts = form.location.split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) markerPos = parts;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="px-10 py-4 text-2xl font-bold text-blue-600">Civix</header>

      <div className="max-w-3xl mx-auto mt-8 bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-xl font-semibold mb-6">Create a New Complaint</h2>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Title */}
          <div>
            <label className="block mb-2 font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category + Location */}
          <div className="md:flex md:gap-4">
            <div className="flex-1">
              <label className="block mb-2 font-medium">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="sanitation">Sanitation</option>
                <option value="utilities">Utilities</option>
                <option value="safety">Safety</option>
                <option value="environment">Environment</option>
                <option value="water">Water</option>
                <option value="electricity">Electricity</option>
                <option value="roads">Roads</option>
                <option value="waste_management">Waste Management</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex-1 mt-4 md:mt-0">
              <label className="block mb-2 font-medium">Location</label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-sm text-blue-600 underline mb-1"
              >
                Use My Current Location
              </button>
              <input
                type="text"
                name="location"
                placeholder="Click map or enter lat,lng"
                value={form.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2">
                <MapContainer center={markerPos} zoom={13} className="w-full h-48 rounded-md">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationSelector setForm={setForm} />
                  <Marker position={markerPos} />
                </MapContainer>
                <div className="text-sm text-gray-500 mt-1">Selected: {form.location}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-medium">Description</label>
            <textarea
              name="description"
              rows="4"
              value={form.description}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Photo */}
          <div>
            <label className="block mb-2 font-medium">Upload Photo</label>
            <input type="file" name="photo" accept="image/*" onChange={handleChange} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-md text-white ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>

          {message && <div className="text-red-600 font-semibold mt-2">{message}</div>}
        </form>
      </div>
    </div>
  );
}

export default ComplaintCreate;
