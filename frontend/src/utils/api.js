

const API_URL = process.env.REACT_APP_API_URL;

// ✅ Helper for Authorization header
function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem("token");
  if (isFormData) {
    // ⚠️ Do NOT manually set "Content-Type" when sending FormData
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
  return res.json();
}

export async function logoutUser() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

// --- COMPLAINTS ---

export async function createComplaint({ title, description, category, priority, location, photo }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", category);
  if (priority) formData.append("priority", priority);

  if (location) {
    const [lat, lng] = location.split(",").map(Number);
    formData.append("location[type]", "Point");
    formData.append("location[coordinates][]", lng);
    formData.append("location[coordinates][]", lat);
  }

  if (photo) {
    formData.append("photo", photo);
  }

  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/complaints`, {
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
      data: { error: "Invalid volunteer ID: must be a valid MongoDB ObjectId string." },
    };
  }

  try {
    const res = await fetch(`${API_URL}/api/complaints/${complaintId}/assign`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ volunteer_id: volunteerId }),
    });
    const data = await res.json().catch(() => ({ error: "Response not valid JSON" }));
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

// --- POLLS ---

export async function getAllPolls() {
  const res = await fetch(`${API_URL}/api/polls`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export async function createPoll(pollData) {
  const res = await fetch(`${API_URL}/api/polls`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(pollData),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export async function submitVote(pollId, selected_option) {
  const res = await fetch(`${API_URL}/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ selected_option }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

export async function getPollResults(pollId) {
  const res = await fetch(`${API_URL}/api/polls/${pollId}/results`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

// Helper for poll creation
function getToken() {
  return localStorage.getItem("token");
}

export async function createPollWithAuth({ title, options, target_location, description, closeDate }) {
  try {
    const res = await fetch(`${API_URL}/api/polls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
      },
      body: JSON.stringify({ title, options, target_location, description, closeDate }),
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



export async function getAdminProfile() {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return { ok: res.ok, data: await res.json() };
}

// -----------------------------------------------------------------------------
// 🧾 ENGAGEMENT REPORTS (JSON, CSV, PDF)
// -----------------------------------------------------------------------------
export async function getEngagementReport() {
  const res = await fetch(`${API_URL}/api/reports/engagement`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

export function downloadEngagementCSV() {
  const token = localStorage.getItem("token");
  fetch(`${API_URL}/api/reports/export/csv`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "civic_engagement_report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch((err) => console.error("CSV download failed:", err));
}

export function downloadEngagementPDF() {
  const token = localStorage.getItem("token");
  fetch(`${API_URL}/api/reports/export/pdf`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "civic_engagement_report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch((err) => console.error("PDF download failed:", err));
}

// -----------------------------------------------------------------------------
// 💬 COMPLAINT SENTIMENT (Yes/No/Maybe)
// -----------------------------------------------------------------------------
export async function submitComplaintSentiment(id, sentiment) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/api/complaints/${id}/sentiment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sentiment }),
  });

  const data = await res.json();
  return { ok: res.ok, data };
}

export async function getComplaintSentimentResults(id) {
  const res = await fetch(`${API_URL}/api/complaints/${id}/sentiment`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  return { ok: res.ok, data };
}
