const API_URL = process.env.REACT_APP_API_URL;

// Helper for Authorization header
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

// --- AUTH ---

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "GET",
    headers: getAuthHeaders()
  });
  return res.json();
}

export async function logoutUser() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  return res.json();
}

// --- COMPLAINTS ---


export async function createComplaint({ title, description, category, location, photo_url }) {
  const res = await fetch(`${API_URL}/api/complaints`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, description, category, location, photo_url })
  });
  return { ok: res.ok, data: await res.json() };
}



export async function getMyComplaints() {
  const res = await fetch(`${API_URL}/api/complaints?created_by=me`, {
    headers: getAuthHeaders()
  });
  return { ok: res.ok, data: await res.json() };
}


export async function getAllComplaints(query = "") {
  const res = await fetch(`${API_URL}/api/complaints${query}`, {
    headers: getAuthHeaders()
  });
  return { ok: res.ok, data: await res.json() };
}



export async function assignVolunteer(complaintId, volunteerId) {
  const res = await fetch(`${API_URL}/api/complaints/${complaintId}/assign`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ volunteer_id: volunteerId })
  });
  return { ok: res.ok, data: await res.json() };
}



export async function getVolunteers() {
  const res = await fetch(`${API_URL}/api/auth/volunteers`, {
    headers: getAuthHeaders()
  });
  const json = await res.json();
  return { ok: res.ok, data: json.volunteers || [] };
}


export async function getAssignedComplaints() {
  const res = await fetch(`${API_URL}/api/complaints/assigned`, {
    headers: getAuthHeaders()
  });
  return { ok: res.ok, data: await res.json() };
}



export async function updateComplaintStatus(complaintId, status, admin_notes = "") {
  const res = await fetch(`${API_URL}/api/complaints/${complaintId}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, admin_notes })
  });
  return { ok: res.ok, data: await res.json() };
}
