import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home          from "../components/Home";
import About         from "../components/About";
import Register      from "../components/Register";
import Login         from "../components/Login";
import ForgotPassword from "../components/ForgotPassword";
import Schedule      from "../components/Schedule";
import Enrollment    from "../components/Enrollment";
import Profile       from "../components/Profile";
import Attendance    from "../components/Attendance";
import LeaveRequest  from "../components/LeaveRequest";
import AdminDashboard from "../components/AdminDashboard";
import CoachDashboard from "../components/CoachDashboard";

export default function AppRoutes({ user, role, setUser, onLogin, onLogout }) {
  return (
    <Routes>
      <Route path="/"        element={<Home user={user} />} />
      <Route path="/about"   element={<About />} />
      <Route path="/schedule" element={<Schedule user={user} />} />
      <Route path="/enrollment" element={<Enrollment user={user} />} />

      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/login"    element={user ? <Navigate to="/" /> : <Login onLogin={onLogin} />} />
      <Route path="/forgot"   element={user ? <Navigate to="/" /> : <ForgotPassword />} />

      <Route path="/profile" element={
        user ? <Profile user={user} onUpdate={setUser} onLogout={onLogout} /> : <Navigate to="/login" />
      } />
      <Route path="/attendance" element={
        user ? <Attendance user={user} /> : <Navigate to="/login" />
      } />
      <Route path="/leave" element={
        user ? <LeaveRequest user={user} /> : <Navigate to="/login" />
      } />
      <Route path="/admin" element={
        user && role === "admin" ? <AdminDashboard user={user} /> : <Navigate to="/login" />
      } />
      <Route path="/coach" element={
        user && role === "coach" ? <CoachDashboard user={user} /> : <Navigate to="/login" />
      } />
    </Routes>
  );
}
