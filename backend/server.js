const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes       = require("./auth");
const profileRoutes    = require("./profile");
const enrollmentRoutes = require("./enrollments");
const scheduleRoutes   = require("./schedule");
const memberRoutes     = require("./members");
const sessionRoutes    = require("./sessions");
const attendanceRoutes = require("./attendance");
const adminRoutes      = require("./admin");
const leaveRoutes          = require("./leave");
const announcementRoutes   = require("./announcements");
const hallRoutes           = require("./halls");
const levelsRoutes         = require("./levels");
const db = require("./db");

const app = express();

app.use(cors({
  origin: (origin, cb) => cb(null, true), // local network dev — allow all origins
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => res.json({ message: "Volleyball Club Backend running!" }));

app.use("/api", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/schedule",    scheduleRoutes);
app.use("/api/members",    memberRoutes);
app.use("/api/sessions",   sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin",      adminRoutes);
app.use("/api/leave",          leaveRoutes);
app.use("/api/announcements",  announcementRoutes);
app.use("/api/halls",          hallRoutes);
app.use("/api/levels",         levelsRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, (err) => {
  if (err) console.error("Server failed:", err);
  else console.log(`✅ Server running on http://localhost:${PORT}`);
});