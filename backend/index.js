

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const users = []; // simple in-memory store
const SECRET = "secretkey";

// Register endpoint
app.post("/auth/register", (req, res) => {
  const { name, email, password, role, location } = req.body;
  if (users.find((u) => u.email === email))
    return res.json({ success: false, message: "User exists" });

  const hashed = bcrypt.hashSync(password, 8);
  users.push({ name, email, password: hashed, role, location });
  res.json({ success: true, message: "Registered successfully" });
});

// Login endpoint
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user) return res.json({ success: false, message: "User not found" });
  if (!bcrypt.compareSync(password, user.password))
    return res.json({ success: false, message: "Wrong password" });

  const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: "1h" });
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    })
    .json({ success: true, message: "Login successful" });
});

// Profile fetch endpoint, verifies token from cookie
app.get("/auth/profile", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ success: false, message: "Not logged in" });
  try {
    const decoded = jwt.verify(token, SECRET);
    const user = users.find((u) => u.email === decoded.email);
    res.json({ success: true, user });
  } catch {
    res.json({ success: false, message: "Invalid token" });
  }
});

// Logout endpoint, clears cookie
app.post("/auth/logout", (req, res) => {
  res.clearCookie("token").json({ success: true, message: "Logged out" });
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
