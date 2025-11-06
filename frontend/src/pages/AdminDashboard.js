
import React, { useEffect, useState } from "react";
import {
  getAllComplaints,
  getVolunteers,
  assignVolunteer,
  getAdminProfile,
} from "../utils/api";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

// PROFILE CARD
function AdminProfile({ profile }) {
  if (!profile) return <div className="profile-card-centered">Loading...</div>;
  const user = profile.user || {};
  return (
    <div className="profile-card-centered">
      <div className="profile-avatar">
        {user.name ? user.name[0].toUpperCase() : "?"}
      </div>
      <div className="profile-info">
        <div className="profile-name"><h1>{user.name || "No Name"}</h1></div>
        <div className="profile-role">admin</div>
        <div className="profile-location">
          <span role="img" aria-label="location">📍</span>{" "}
          {user.location || "Location not set"}
        </div>
        <div className="profile-email">{user.email || "No email"}</div>
        <div className="profile-id">ID: {user.id || "N/A"}</div>
      </div>
    </div>
  );
}

function uniqueComplaints(arr) {
  const map = new Map();
  arr.forEach(c => !map.has(c._id) && map.set(c._id, c));
  return Array.from(map.values());
}

function volunteerDisplay(v) {
  if (!v) return "";
  if (typeof v === "object") {
    return v.name && v.email
      ? `${v.name} (${v.email})`
      : v.name
      ? v.name
      : v.email
      ? v.email
      : v.id
      ? v.id.toString()
      : JSON.stringify(v);
  }
  return v.toString();
}

function getStatusLabel(c) {
  if (!c.assigned_to) return "Not Assigned";
  if (c.status === "resolved") return "Resolved";
  if (c.status === "in_review") return "Assigned";
  if (c.status === "received") return "Active";
  return c.status ? c.status[0].toUpperCase() + c.status.slice(1) : "-";
}

function LocationName({ location }) {
  if (!location) return <span>N/A</span>;
  if (location.city) {
    return (
      <span>
        {location.address ? `${location.address}, ` : ""}
        {location.city}
        {location.state ? `, ${location.state}` : ""}
      </span>
    );
  }
  if (location.address) return <span>{location.address}</span>;
  if (location.coordinates && location.coordinates.length === 2)
    return <span>{location.coordinates[1]}, {location.coordinates[0]}</span>;
  return <span>{typeof location === "string" ? location : "N/A"}</span>;
}

export default function AdminDashboard() {
  const [profile, setProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [filters, setFilters] = useState({ category: "", status: "", location: "" });
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState(null);
  const [selectState, setSelectState] = useState({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  async function fetchData(currPage = 1, currLimit = 5) {
    setLoading(true);
    const complaintsRes = await getAllComplaints(`?page=${currPage}&limit=${currLimit}`);
    const volunteersRes = await getVolunteers();
    setComplaints(uniqueComplaints(complaintsRes.data?.data || []));
    setVolunteers(volunteersRes.data || []);
    setTotalPages(complaintsRes.data?.pagination?.totalPages || 1);
    setLoading(false);
  }

  useEffect(() => {
    fetchData(page, limit);
  }, [page, limit]);

  useEffect(() => {
    getAdminProfile().then(res => {
      if (res.ok) setProfile(res.data);
      else setProfile(null);
    });
  }, []);

  function complaintMatchesStatus(c) {
    if (!filters.status) return true;
    if (filters.status === "Resolved") return c.status === "resolved";
    if (filters.status === "Active") return c.status === "received";
    if (filters.status === "Assigned") return c.status === "in_review";
    if (filters.status === "Unassigned") return !c.assigned_to;
    return true;
  }

  function complaintMatchesLocation(c) {
    const filter = filters.location.trim().toLowerCase();
    if (!filter) return true;
    if (!c.location) return false;
    if (typeof c.location === "string")
      return c.location.toLowerCase().includes(filter);
    if (typeof c.location === "object") {
      let s = "";
      if (c.location.address) s += c.location.address.toLowerCase() + " ";
      if (c.location.city) s += c.location.city.toLowerCase() + " ";
      if (c.location.state) s += c.location.state.toLowerCase() + " ";
      if (c.location.pincode) s += c.location.pincode.toLowerCase() + " ";
      if (c.location.coordinates)
        s += c.location.coordinates.join(",").toLowerCase() + " ";
      return s.includes(filter);
    }
    return false;
  }

  const filteredComplaints = complaints
    .filter(c => !filters.category || c.category === filters.category)
    .filter(complaintMatchesStatus)
    .filter(complaintMatchesLocation);

  const handleSelect = (complaintId, volunteerId) => {
    setSelectState(s => ({ ...s, [complaintId]: volunteerId }));
  };

  const handleAssign = async (complaintId) => {
    const volunteerId = selectState[complaintId];
    if (!volunteerId) return;
    setAssigningId(complaintId);
    const res = await assignVolunteer(complaintId, volunteerId);
    if (res.ok) {
      await fetchData(page, limit);
      setSelectState(s => ({ ...s, [complaintId]: "" }));
    } else {
      let msg = "Assignment failed";
      if (res.data && res.data.message)
        msg += ": " + res.data.message;
      if (res.data && res.data.error)
        msg += " (" + res.data.error + ")";
      alert(msg);
    }
    setAssigningId(null);
  };

  const statusChoices = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Resolved", label: "Resolved" },
    { value: "Assigned", label: "Assigned" },
    { value: "Unassigned", label: "Unassigned" }
  ];

  const handleLoadAll = async () => {
    setLoading(true);
    const complaintsRes = await getAllComplaints("?page=1&limit=2000");
    setComplaints(uniqueComplaints(complaintsRes.data?.data || []));
    setTotalPages(1);
    setPage(1);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-main-container">
      <aside className="admin-sidebar">
        <AdminProfile profile={profile} />
        <nav className="custom-admin-nav">
          <div className="admin-nav-link active">Dashboard</div>
          <div className="admin-nav-link" onClick={() => navigate("/polls/new")}>Create Poll</div>
          <div className="admin-nav-link">My Polls</div>
          <div className="admin-nav-link">Community</div>
        </nav>
        <div className="admin-logout-btn" onClick={handleLogout}>
          Logout
        </div>
      </aside>
      <div className="admin-content">
        <span className="dashboard-title">CIVIX</span>
        <h2 className="dashboard-title">Complaints Dashboard</h2>
        <div className="dashboard-filters">
          <select
            value={filters.category}
            onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
            className="dashboard-filter-input"
          >
            <option value="">All Categories</option>
            {[...new Set(complaints.map((c) => c.category))]
              .filter(Boolean)
              .map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="dashboard-filter-input"
          >
            {statusChoices.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Location"
            value={filters.location}
            onChange={e => setFilters(f => ({ ...f, location: e.target.value }))}
            className="dashboard-filter-input"
          />
          <button className="dashboard-filter-btn" onClick={handleLoadAll}>Load All</button>
        </div>
        <div className="civix-table-container">
          <table className="civix-complaints-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Category</th>
                <th>Status</th>
                <th>Location</th>
                <th>Assignment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="dashboard-placeholder">
                    Loading complaints...
                  </td>
                </tr>
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dashboard-placeholder">
                    No complaints found.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(c => (
                  <tr key={c._id}>
                    <td>{c.title}</td>
                    <td>{c.description}</td>
                    <td>{c.category}</td>
                    <td>
                      <b>{getStatusLabel(c)}</b>
                    </td>
                    <td>
                      <LocationName location={c.location} />
                    </td>
                    <td>
                      {c.assigned_to ? (
                        <span style={{ color: "#045", fontWeight: 600 }}>
                          Assigned to: {volunteerDisplay(
                            typeof c.assigned_to === "object"
                              ? c.assigned_to
                              : volunteers.find(v => v.id === c.assigned_to)
                          )}
                        </span>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <select
                            className="assign-dropdown"
                            disabled={assigningId === c._id}
                            value={selectState[c._id] || ""}
                            onChange={e => handleSelect(c._id, e.target.value)}
                          >
                            <option value="">Assign Volunteer</option>
                            {volunteers.map(v => (
                              <option
                                key={v.id}
                                value={v.id}
                              >
                                {volunteerDisplay(v)}
                              </option>
                            ))}
                          </select>
                          <button
                            className="assign-btn"
                            disabled={!selectState[c._id] || assigningId === c._id}
                            onClick={() => handleAssign(c._id)}
                            style={{ marginLeft: 8 }}
                          >
                            {assigningId === c._id ? "Assigning..." : "Assign"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Page navigation at the BOTTOM of the page */}
        <div className="dashboard-pages-bottom">
          <button
            className="page-btn"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >First</button>
          <button
            className="page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >Prev</button>
          <span style={{ margin: "0 8px" }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >Next</button>
          <button
            className="page-btn"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >Last</button>
          <span style={{ marginLeft: 16 }}>
            Show{" "}
            <select
              value={limit}
              onChange={e => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 20, 50].map(sz => (
                <option key={sz} value={sz}>{sz}</option>
              ))}
            </select>
            {" "}per page
          </span>
        </div>
      </div>
    </div>
  );
}
