import { api } from "../api/api";

// Coaches
export const getCoaches = () =>
  api.get("/admin/coaches");

export const createCoach = (data) =>
  api.post("/admin/coaches", data);

export const updateCoach = (id, data) =>
  api.put(`/admin/coaches/${id}`, data);

export const deleteCoach = (id) =>
  api.delete(`/admin/coaches/${id}`);

// Users
export const getUsers = () =>
  api.get("/admin/users");

export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);

export const deleteUser = (id) =>
  api.delete(`/admin/users/${id}`);

// Reports
export const getAttendanceReport = (months = 3) =>
  api.get(`/admin/reports/attendance?months=${months}`);
