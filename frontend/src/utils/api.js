const API_URL = process.env.REACT_APP_API_URL;

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include"
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include"
  });
  return res.json();
}

export async function getProfile() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: "GET",
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });
  return res.json();
}


export async function logoutUser() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include"
  });
  return res.json();
}
