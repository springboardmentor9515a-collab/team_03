



// import React, { useState } from 'react';
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
// import { useNavigate } from 'react-router-dom';
// import './ComplaintCreate.css';

// const CLOUDINARY_URL = process.env.REACT_APP_CLOUDINARY_UPLOAD_URL;
// const CLOUDINARY_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

// function LocationSelector({ setLocation }) {
//   useMapEvents({
//     click(e) {
//       setLocation([e.latlng.lat, e.latlng.lng]);
//     },
//   });
//   return null;
// }

// function ComplaintCreate() {
//   const [form, setForm] = useState({
//     title: '',
//     category: '',
//     locationText: '',
//     description: '',
//     photo: null
//   });
//   const [location, setLocation] = useState([12.9716, 77.5946]); // Default to Bangalore, or your city
//   const [message, setMessage] = useState('');
//   const [photoUrl, setPhotoUrl] = useState('');
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === 'photo') {
//       const file = files[0];
//       setForm({ ...form, photo: file });
//       if (file) uploadToCloudinary(file);
//     } else {
//       setForm({ ...form, [name]: value });
//     }
//   };

//   const uploadToCloudinary = async (file) => {
//     const data = new FormData();
//     data.append('file', file);
//     data.append('upload_preset', CLOUDINARY_PRESET);

//     try {
//       const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: data });
//       const imgData = await res.json();
//       setPhotoUrl(imgData.secure_url);
//     } catch {
//       setMessage('Image upload failed.');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Compose a human-readable location string
//     const locationStr = `${form.locationText}, Lat: ${location[0]}, Lng: ${location[1]}`;
//     const body = {
//       title: form.title,
//       category: form.category,
//       location: locationStr,
//       description: form.description,
//       photo_url: photoUrl
//     };
//     const resp = await fetch('/api/complaints', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(body)
//     });

//     if (resp.ok) {
//       setMessage('Complaint submitted successfully!');
//       setTimeout(() => {
//         navigate('/dashboard'); // Redirect to user dashboard
//       }, 1500);
//       setForm({ title: '', category: '', location: '', description: '', photo: null });
//       setPhotoUrl('');
//     } else {
//       setMessage('Submission failed. Try again.');
//     }
//   };

//   const handleSaveDraft = async () => {
//     const locationStr = `${form.locationText}, Lat: ${location[0]}, Lng: ${location[1]}`;
//     const draft = {
//       title: form.title,
//       category: form.category,
//       location: locationStr,
//       description: form.description,
//       photo_url: photoUrl,
//       status: "draft"
//     };

//     const resp = await fetch("/api/complaints", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(draft)
//     });

//     if (resp.ok) {
//       setMessage("Draft saved successfully!");
//     } else {
//       setMessage("Failed to save draft.");
//     }
//   };

//   return (
//     <div>
//       <header style={{padding: '20px 0 0 40px', fontSize: '1.6rem', fontWeight: 'bold'}}>Civix</header>
      
//       <div className="complaint-create-main">
//         <h2>Create a New Complaint</h2>
//         <div className="form-section">
//           <form className="complaint-form" onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label>Complaint Title</label>
//               <input
//                 type="text"
//                 name="title"
//                 maxLength="100"
//                 placeholder="Enter a clear and descriptive title for your complaint"
//                 value={form.title}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Category</label>
//                 <select name="category" value={form.category} onChange={handleChange} required>
//                   <option value="">Select a category</option>
//                    <option value="Roads">Roads</option>
//                    <option value="Electricity">Electricity</option>
//                    <option value="Water Supply">Water Supply</option>
//                    <option value="Sanitation">Sanitation</option>
//                     <option value="Drainage">Drainage</option>
//                     <option value="Garbage">Garbage</option>
//                     <option value="Street Lights">Street Lights</option>
//                     <option value="Health">Health</option>
//                     <option value="Education">Education</option>
//                     <option value="Corruption">Corruption</option>
//                     <option value="Environment">Environment</option>
//                     <option value="Public Transport">Public Transport</option>
//                     <option value="Housing">Housing</option>
//                     <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Location</label>
//                 <input
//                   type="text"
//                   name="locationText"
//                   placeholder="City/Area/State"
//                   value={form.locationText}
//                   onChange={handleChange}
//                   required
//                 />
//                 <div style={{marginTop: '10px'}}>
//                   <label>Select on map:</label>
//                   <MapContainer center={location} zoom={13} style={{ height: "200px", width: "100%" }}>
//                     <TileLayer
//                       attribution='&copy; OpenStreetMap contributors'
//                       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     />
//                     <LocationSelector setLocation={setLocation} />
//                     <Marker position={location} />
//                   </MapContainer>
//                   <div style={{ fontSize: "0.93rem", color: "#6b7280", marginTop: "6px" }}>
//                     Selected: {location[0].toFixed(5)}, {location[1].toFixed(5)}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="form-group">
//               <label>Description</label>
//               <textarea
//                 name="description"
//                 maxLength="600"
//                 rows="4"
//                 placeholder="Explain your complaint in detail. Include what the issue involves, whom it affects, what change you're seeking, and who is responsible."
//                 value={form.description}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="form-group">
//               <label>File Upload</label>
//               <input type="file" name="photo" accept="image/*" onChange={handleChange} />
//               {photoUrl && (<img src={photoUrl} alt="complaint" className="photo-preview"/>)}
//             </div>
//             <div className="info-box">
//               <strong>Important Information</strong>
//               <ul>
//                 <li>Be specific and concise. Include relevant background information and context.</li>
//                 <li>Do not include private information unless absolutely needed.</li>
//                 <li>Use civil, factual language and focus on solutions.</li>
//               </ul>
//             </div>
//             <div className="actions">
//               <button type="button" className="draft-btn" onClick={handleSaveDraft}> Save as Draft </button>
//               <button type="submit" className="submit-btn">Submit Complaint</button>
//             </div>
//           </form>
//           {message && <div className="status-message">{message}</div>}
//         </div>
//       </div>
//       <footer className="footer">
//         <div className="footer-section">Civix Complaint</div>
//         <div className="footer-section">Platform: Browse, Start, Success Stories</div>
//         <div className="footer-section">Support: Help, Guidelines, Contact</div>
//         <div className="footer-section">Legal: Privacy, Terms, Policy</div>
//       </footer>
//     </div>
//   );
// }

// export default ComplaintCreate;










// import React, { useState } from 'react';
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
// import { useNavigate } from 'react-router-dom';
// import './ComplaintCreate.css';

// const CLOUDINARY_URL = process.env.REACT_APP_CLOUDINARY_UPLOAD_URL;
// const CLOUDINARY_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

// // LocationSelector updates coordinates and puts them into location field directly
// function LocationSelector({ setForm }) {
//   useMapEvents({
//     click(e) {
//       setForm(prev => ({
//         ...prev,
//         location: `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`
//       }));
//     },
//   });
//   return null;
// }

// function ComplaintCreate() {
//   const [form, setForm] = useState({
//     title: '',
//     category: '',
//     location: '', // will be updated both by typing and by map click
//     description: '',
//     photo: null
//   });

//   const [message, setMessage] = useState('');
//   const [photoUrl, setPhotoUrl] = useState('');
//   const navigate = useNavigate();

//   // Default map center (Bangalore), or you can choose any
//   const mapDefault = [12.9716, 77.5946];

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === 'photo') {
//       const file = files[0];
//       setForm({ ...form, photo: file });
//       if (file) uploadToCloudinary(file);
//     } else {
//       setForm({ ...form, [name]: value });
//     }
//   };

//   const uploadToCloudinary = async (file) => {
//     const data = new FormData();
//     data.append('file', file);
//     data.append('upload_preset', CLOUDINARY_PRESET);

//     try {
//       const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: data });
//       const imgData = await res.json();
//       setPhotoUrl(imgData.secure_url);
//     } catch {
//       setMessage('Image upload failed.');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     // Send only the location field as filled by map or user input
//     const body = {
//       title: form.title,
//       category: form.category,
//       location: form.location,
//       description: form.description,
//       photo_url: photoUrl
//     };
//     const resp = await fetch('/api/complaints', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(body)
//     });

//     if (resp.ok) {
//       setMessage('Complaint submitted successfully!');
//       setTimeout(() => {
//         navigate('/dashboard'); // Redirect to user dashboard
//       }, 1500);
//       setForm({ title: '', category: '', location: '', description: '', photo: null });
//       setPhotoUrl('');
//     } else {
//       setMessage('Submission failed. Try again.');
//     }
//   };

//   const handleSaveDraft = async () => {
//     const draft = {
//       title: form.title,
//       category: form.category,
//       location: form.location,
//       description: form.description,
//       photo_url: photoUrl,
//       status: "draft"
//     };

//     const resp = await fetch("/api/complaints", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(draft)
//     });

//     if (resp.ok) {
//       setMessage("Draft saved successfully!");
//     } else {
//       setMessage("Failed to save draft.");
//     }
//   };

//   // Parse lat/lng for marker if location is set from map
//   let markerPos = mapDefault;
//   if (form.location) {
//     const parts = form.location.split(',').map(Number);
//     if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
//       markerPos = parts;
//     }
//   }

//   return (
//     <div>
//       <header style={{padding: '20px 0 0 40px', fontSize: '1.6rem', fontWeight: 'bold'}}>Civix</header>
//       <div className="complaint-create-main">
//         <h2>Create a New Complaint</h2>
//         <div className="form-section">
//           <form className="complaint-form" onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label>Complaint Title</label>
//               <input
//                 type="text"
//                 name="title"
//                 maxLength="100"
//                 placeholder="Enter a clear and descriptive title for your complaint"
//                 value={form.title}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Category</label>
//                 <select name="category" value={form.category} onChange={handleChange} required>
//                   <option value="">Select a category</option>
//                   <option value="Roads">Roads</option>
//                   <option value="Electricity">Electricity</option>
//                   <option value="Water Supply">Water Supply</option>
//                   <option value="Sanitation">Sanitation</option>
//                   <option value="Drainage">Drainage</option>
//                   <option value="Garbage">Garbage</option>
//                   <option value="Street Lights">Street Lights</option>
//                   <option value="Health">Health</option>
//                   <option value="Education">Education</option>
//                   <option value="Corruption">Corruption</option>
//                   <option value="Environment">Environment</option>
//                   <option value="Public Transport">Public Transport</option>
//                   <option value="Housing">Housing</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Location</label>
//                 <input
//                   type="text"
//                   name="location"
//                   placeholder="City/Area/State or click map"
//                   value={form.location}
//                   onChange={handleChange}
//                   required
//                 />
//                 <div style={{marginTop: '10px'}}>
//                   <label>Select on map:</label>
//                   <MapContainer center={markerPos} zoom={13} style={{ height: "200px", width: "100%" }}>
//                     <TileLayer
//                       attribution='&copy; OpenStreetMap contributors'
//                       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     />
//                     <LocationSelector setForm={setForm} />
//                     <Marker position={markerPos} />
//                   </MapContainer>
//                   <div style={{ fontSize: "0.93rem", color: "#6b7280", marginTop: "6px" }}>
//                     Selected: {form.location}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="form-group">
//               <label>Description</label>
//               <textarea
//                 name="description"
//                 maxLength="600"
//                 rows="4"
//                 placeholder="Explain your complaint in detail. Include what the issue involves, whom it affects, what change you're seeking, and who is responsible."
//                 value={form.description}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="form-group">
//               <label>File Upload</label>
//               <input type="file" name="photo" accept="image/*" onChange={handleChange} />
//               {photoUrl && (<img src={photoUrl} alt="complaint" className="photo-preview"/>)}
//             </div>
//             <div className="info-box">
//               <strong>Important Information</strong>
//               <ul>
//                 <li>Be specific and concise. Include relevant background information and context.</li>
//                 <li>Do not include private information unless absolutely needed.</li>
//                 <li>Use civil, factual language and focus on solutions.</li>
//               </ul>
//             </div>
//             <div className="actions">
//               <button type="button" className="draft-btn" onClick={handleSaveDraft}> Save as Draft </button>
//               <button type="submit" className="submit-btn">Submit Complaint</button>
//             </div>
//           </form>
//           {message && <div className="status-message">{message}</div>}
//         </div>
//       </div>
//       <footer className="footer">
//         <div className="footer-section">Civix Complaint</div>
//         <div className="footer-section">Platform: Browse, Start, Success Stories</div>
//         <div className="footer-section">Support: Help, Guidelines, Contact</div>
//         <div className="footer-section">Legal: Privacy, Terms, Policy</div>
//       </footer>
//     </div>
//   );
// }

// export default ComplaintCreate;





// import React, { useState } from 'react';
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
// import { useNavigate } from 'react-router-dom';
// import './ComplaintCreate.css';

// function LocationSelector({ setForm }) {
//   useMapEvents({
//     click(e) {
//       setForm(prev => ({
//         ...prev,
//         location: `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`
//       }));
//     },
//   });
//   return null;
// }

// function ComplaintCreate() {
//   const [form, setForm] = useState({
//     title: '',
//     category: '',
//     location: '',
//     description: '',
//     photo: null
//   });

//   const [message, setMessage] = useState('');
//   const [photoUrl, setPhotoUrl] = useState('');
//   const navigate = useNavigate();
//   const mapDefault = [12.9716, 77.5946];

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === 'photo') {
//       const file = files[0];
//       setForm({ ...form, photo: file });
//       if (file) uploadToCloudinary(file);
//     } else {
//       setForm({ ...form, [name]: value });
//     }
//   };

//   // Modified Cloudinary upload function using the direct endpoint and preset
//   const uploadToCloudinary = async (file) => {
//     const data = new FormData();
//     data.append('file', file);
//     data.append('upload_preset', 'civix_preset'); // Use your real preset here

//     try {
//       const res = await fetch('https://api.cloudinary.com/v1_1/drqxpud0x/image/upload', {
//         method: 'POST',
//         body: data,
//       });
//       const imgData = await res.json();
//       console.log(imgData); // Log response for debugging
//       if (imgData.secure_url) {
//         setPhotoUrl(imgData.secure_url);
//         setMessage('Image upload successful!');
//       } else {
//         setMessage('Image upload failed: ' + imgData.error?.message);
//       }
//     } catch (error) {
//       setMessage('Image upload failed.');
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const body = {
//       title: form.title,
//       category: form.category,
//       location: form.location,
//       description: form.description,
//       photo_url: photoUrl
//     };
//     const resp = await fetch('/api/complaints', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(body)
//     });

//     if (resp.ok) {
//       setMessage('Complaint submitted successfully!');
//       setTimeout(() => {
//         navigate('/dashboard');
//       }, 1500);
//       setForm({ title: '', category: '', location: '', description: '', photo: null });
//       setPhotoUrl('');
//     } else {
//       setMessage('Submission failed. Try again.');
//     }
//   };

//   const handleSaveDraft = async () => {
//     const draft = {
//       title: form.title,
//       category: form.category,
//       location: form.location,
//       description: form.description,
//       photo_url: photoUrl,
//       status: "draft"
//     };

//     const resp = await fetch("/api/complaints", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(draft)
//     });

//     if (resp.ok) {
//       setMessage("Draft saved successfully!");
//     } else {
//       setMessage("Failed to save draft.");
//     }
//   };

//   let markerPos = mapDefault;
//   if (form.location) {
//     const parts = form.location.split(',').map(Number);
//     if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
//       markerPos = parts;
//     }
//   }

//   return (
//     <div>
//       <header style={{padding: '20px 0 0 40px', fontSize: '1.6rem', fontWeight: 'bold'}}>Civix</header>
//       <div className="complaint-create-main">
//         <h2>Create a New Complaint</h2>
//         <div className="form-section">
//           <form className="complaint-form" onSubmit={handleSubmit}>
//             <div className="form-group">
//               <label>Complaint Title</label>
//               <input
//                 type="text"
//                 name="title"
//                 maxLength="100"
//                 placeholder="Enter a clear and descriptive title for your complaint"
//                 value={form.title}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="form-row">
//               <div className="form-group">
//                 <label>Category</label>
//                 <select name="category" value={form.category} onChange={handleChange} required>
//                   <option value="">Select a category</option>
//                   <option value="Roads">Roads</option>
//                   <option value="Electricity">Electricity</option>
//                   <option value="Water Supply">Water Supply</option>
//                   <option value="Sanitation">Sanitation</option>
//                   <option value="Drainage">Drainage</option>
//                   <option value="Garbage">Garbage</option>
//                   <option value="Street Lights">Street Lights</option>
//                   <option value="Health">Health</option>
//                   <option value="Education">Education</option>
//                   <option value="Corruption">Corruption</option>
//                   <option value="Environment">Environment</option>
//                   <option value="Public Transport">Public Transport</option>
//                   <option value="Housing">Housing</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Location</label>
//                 <input
//                   type="text"
//                   name="location"
//                   placeholder="City/Area/State or click map"
//                   value={form.location}
//                   onChange={handleChange}
//                   required
//                 />
//                 <div style={{marginTop: '10px'}}>
//                   <label>Select on map:</label>
//                   <MapContainer center={markerPos} zoom={13} style={{ height: "200px", width: "100%" }}>
//                     <TileLayer
//                       attribution='&copy; OpenStreetMap contributors'
//                       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     />
//                     <LocationSelector setForm={setForm} />
//                     <Marker position={markerPos} />
//                   </MapContainer>
//                   <div style={{ fontSize: "0.93rem", color: "#6b7280", marginTop: "6px" }}>
//                     Selected: {form.location}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <div className="form-group">
//               <label>Description</label>
//               <textarea
//                 name="description"
//                 maxLength="600"
//                 rows="4"
//                 placeholder="Explain your complaint in detail. Include what the issue involves, whom it affects, what change you're seeking, and who is responsible."
//                 value={form.description}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="form-group">
//               <label>File Upload</label>
//               <input type="file" name="photo" accept="image/*" onChange={handleChange} />
//               {photoUrl && (<img src={photoUrl} alt="complaint" className="photo-preview"/>)}
//             </div>
//             <div className="info-box">
//               <strong>Important Information</strong>
//               <ul>
//                 <li>Be specific and concise. Include relevant background information and context.</li>
//                 <li>Do not include private information unless absolutely needed.</li>
//                 <li>Use civil, factual language and focus on solutions.</li>
//               </ul>
//             </div>
//             <div className="actions">
//               <button type="button" className="draft-btn" onClick={handleSaveDraft}> Save as Draft </button>
//               <button type="submit" className="submit-btn">Submit Complaint</button>
//             </div>
//           </form>
//           {message && <div className="status-message">{message}</div>}
//         </div>
//       </div>
//       <footer className="footer">
//         <div className="footer-section">Civix Complaint</div>
//         <div className="footer-section">Platform: Browse, Start, Success Stories</div>
//         <div className="footer-section">Support: Help, Guidelines, Contact</div>
//         <div className="footer-section">Legal: Privacy, Terms, Policy</div>
//       </footer>
//     </div>
//   );
// }

// export default ComplaintCreate;










import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import './ComplaintCreate.css';
import { createComplaint } from '../utils/api'; // Import your API helper

function LocationSelector({ setForm }) {
  useMapEvents({
    click(e) {
      setForm(prev => ({
        ...prev,
        location: `${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`
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
    photo: null
  });

  const [message, setMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const navigate = useNavigate();
  const mapDefault = [12.9716, 77.5946];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      const file = files[0];
      setForm({ ...form, photo: file });
      if (file) uploadToCloudinary(file);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'civix_preset'); // Your actual preset here

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/drqxpud0x/image/upload', {
        method: 'POST',
        body: data,
      });
      const imgData = await res.json();
      console.log(imgData);
      if (imgData.secure_url) {
        setPhotoUrl(imgData.secure_url);
        setMessage('Image upload successful!');
      } else {
        setMessage('Image upload failed: ' + imgData.error?.message);
      }
    } catch (error) {
      setMessage('Image upload failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = {
      title: form.title,
      category: form.category,
      location: form.location,
      description: form.description,
      photo_url: photoUrl
    };
    const resp = await createComplaint(body);

    if (resp.success) {
      setMessage('Complaint submitted successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      setForm({ title: '', category: '', location: '', description: '', photo: null });
      setPhotoUrl('');
    } else {// Try several possible keys or fallback to stringified response
  setMessage(
    resp.error ||
    (resp.errors && JSON.stringify(resp.errors)) ||
    resp.message ||
    resp.status ||
    JSON.stringify(resp)
  );
  console.log('Complaint API error response:', resp);
    }
  };

  const handleSaveDraft = async () => {
    const draft = {
      title: form.title,
      category: form.category,
      location: form.location,
      description: form.description,
      photo_url: photoUrl,
      status: "draft"
    };

    const resp = await fetch("/api/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    });

    if (resp.ok) {
      setMessage("Draft saved successfully!");
    } else {
      setMessage("Failed to save draft.");
    }
  };

  let markerPos = mapDefault;
  if (form.location) {
    const parts = form.location.split(',').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      markerPos = parts;
    }
  }

  return (
    <div>
      <header style={{ padding: '20px 0 0 40px', fontSize: '1.6rem', fontWeight: 'bold' }}>Civix</header>
      <div className="complaint-create-main">
        <h2>Create a New Complaint</h2>
        <div className="form-section">
          <form className="complaint-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Complaint Title</label>
              <input
                type="text"
                name="title"
                maxLength="100"
                placeholder="Enter a clear and descriptive title for your complaint"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
               <select name="category" value={form.category} onChange={handleChange} required>
  <option value="">Select a category</option>
  <option value="roads">Roads</option>
  <option value="electricity">Electricity</option>
  <option value="water">Water</option>
  <option value="sanitation">Sanitation</option>
  <option value="environment">Environment</option>
  <option value="infrastructure">Infrastructure</option>
  <option value="utilities">Utilities</option>
  <option value="safety">Safety</option>
  <option value="waste_management">Waste Management</option>
  <option value="other">Other</option>
</select>

              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="City/Area/State or click map"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
                <div style={{ marginTop: '10px' }}>
                  <label>Select on map:</label>
                  <MapContainer center={markerPos} zoom={13} style={{ height: "200px", width: "100%" }}>
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationSelector setForm={setForm} />
                    <Marker position={markerPos} />
                  </MapContainer>
                  <div style={{ fontSize: "0.93rem", color: "#6b7280", marginTop: "6px" }}>
                    Selected: {form.location}
                  </div>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                maxLength="600"
                rows="4"
                placeholder="Explain your complaint in detail. Include what the issue involves, whom it affects, what change you're seeking, and who is responsible."
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>File Upload</label>
              <input type="file" name="photo" accept="image/*" onChange={handleChange} />
              {photoUrl && (<img src={photoUrl} alt="complaint" className="photo-preview" />)}
            </div>
            <div className="info-box">
              <strong>Important Information</strong>
              <ul>
                <li>Be specific and concise. Include relevant background information and context.</li>
                <li>Do not include private information unless absolutely needed.</li>
                <li>Use civil, factual language and focus on solutions.</li>
              </ul>
            </div>
            <div className="actions">
              <button type="button" className="draft-btn" onClick={handleSaveDraft}> Save as Draft </button>
              <button type="submit" className="submit-btn">Submit Complaint</button>
            </div>
          </form>
          {message && <div className="status-message">{message}</div>}
        </div>
      </div>
      <footer className="footer">
        <div className="footer-section">Civix Complaint</div>
        <div className="footer-section">Platform: Browse, Start, Success Stories</div>
        <div className="footer-section">Support: Help, Guidelines, Contact</div>
        <div className="footer-section">Legal: Privacy, Terms, Policy</div>
      </footer>
    </div>
  );
}

export default ComplaintCreate;
