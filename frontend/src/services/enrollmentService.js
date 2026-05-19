import { api } from "../api/api";

export const getMyEnrollments = () =>
  api.get("/enrollments/my");

export const createEnrollment = (classId, notes) =>
  api.post("/enrollments", { classId, notes });

export const getPendingEnrollments = () =>
  api.get("/enrollments/pending");

export const approveEnrollment = (id) =>
  api.put(`/enrollments/${id}/approve`);

export const rejectEnrollment = (id) =>
  api.put(`/enrollments/${id}/reject`);
