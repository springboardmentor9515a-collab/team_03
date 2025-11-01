

const API_URL = process.env.REACT_APP_API_URL;


function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem("token");
  if (isFormData) {
    
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

// --- AUTH ---

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function logoutUser() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

// --- COMPLAINTS ---

//  FIXED createComplaint
export async function createComplaint({ title, description, category, priority, location, photo }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", category);
  if (priority) formData.append("priority", priority);

  if (location) {
    const [lat, lng] = location.split(',').map(Number);
    formData.append("location[type]", "Point");
    formData.append("location[coordinates][]", lng);
    formData.append("location[coordinates][]", lat);
  }

  if (photo) {
    formData.append("photo", photo);
  }

  const token = localStorage.getItem("token");
  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/complaints`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json();
  return { ok: res.ok, ...data };
}


export async function getMyComplaints() {
  const res = await fetch(`${API_URL}/api/complaints/me`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}


export async function getAllComplaints(query = "") {
  const res = await fetch(`${API_URL}/api/complaints${query}`, {
    headers: getAuthHeaders(),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function assignVolunteer(complaintId, volunteerId) {
  if (!volunteerId || typeof volunteerId !== "string" || volunteerId.length !== 24) {
    return {
      ok: false,
      data: { error: "Invalid volunteer ID: must be a valid MongoDB ObjectId string." }
    };
  }
  try {
    const res = await fetch(`${API_URL}/api/complaints/${complaintId}/assign`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ volunteer_id: volunteerId })
    });
    let data;
    try {
      data = await res.json();
    } catch {
      data = { error: "Response is not valid JSON" };
    }
    return { ok: res.ok, data };
  } catch (e) {
    return { ok: false, data: { error: e.message || "Network error" } };
  }
}


export async function getVolunteers() {
  const res = await fetch(`${API_URL}/api/auth/volunteers`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  return { ok: res.ok, data: json.volunteers || [] };
}

export async function getAssignedComplaints() {
  const res = await fetch(`${API_URL}/api/complaints/volunteers/me/complaints`, {
    headers: getAuthHeaders(),
  });
  return { ok: res.ok, data: await res.json() };
}


export async function updateComplaintStatus(id, status) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/complaints/${id}/status`, {
    method: "PUT", 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  return res.json();
}

//polling APIs
// --- POLLS ---

// Get all polls (public or authorized, depending on backend)
/*export async function getAllPolls() {
  const res = await fetch(`${API_URL}/api/polls`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

// Create a new poll (for admin/official)
export async function createPoll(pollData) {
  const res = await fetch(`${API_URL}/api/polls`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(pollData),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

 // Vote on a poll (for citizen)
export async function submitVote(pollId, selected_option) {
  const res = await fetch(`${API_URL}/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ selected_option }),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

// Get poll results
export async function getPollResults(pollId) {
  const res = await fetch(`${API_URL}/api/polls/${pollId}/results`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}*/



// Get all polls (public)
export async function getAllPolls() {
  const res = await fetch(`${API_URL}/api/polls`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

// Create a new poll (admin/official only)
export async function createPoll(pollData) {
  const res = await fetch(`${API_URL}/api/polls`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(pollData),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

//  Submit a vote (citizen only)
export async function submitVote(pollId, selected_option) {
  const res = await fetch(`${API_URL}/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ selected_option }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

// Get poll results (public)
export async function getPollResults(pollId) {
  const res = await fetch(`${API_URL}/api/polls/${pollId}/results`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
function getToken() {
  return localStorage.getItem("token");
}

// Poll API call --------------------------------------------------------------------

export async function createPoll({ title, options, target_location, description, closeDate }) {
  try {
    const res = await fetch(`${API_URL}/api/polls`, {  
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
      },
      body: JSON.stringify({ title, options, target_location, description, closeDate })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || "Poll creation failed");
    }

    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}


function getToken() {
  return localStorage.getItem("token");
}

// Poll API call --------------------------------------------------------------------

export async function createPoll({ title, options, target_location, description, closeDate }) {
  try {
    const res = await fetch(`${API_URL}/api/polls`, {  
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
      },
      body: JSON.stringify({ title, options, target_location, description, closeDate })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || data.error || "Poll creation failed");
    }

    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
