
const API_URL = "http://localhost:5000";

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include"
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include"
  });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: "GET",
    credentials: "include"
  });
  return res.json();
}

export async function logoutUser() {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });
  return res.json();
}
