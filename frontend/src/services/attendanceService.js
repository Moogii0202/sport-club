import { api } from "../api/api";

export const getMyAttendance = () =>
  api.get("/attendance/my");

export const getMemberAttendance = (userId) =>
  api.get(`/members/${userId}/attendance`);

export const createSession = (scheduleId) =>
  api.post("/sessions", { scheduleId });

export const getSessionMembers = (sessionId) =>
  api.get(`/sessions/${sessionId}/members`);

export const markAttendance = (sessionId, attendance) =>
  api.post(`/sessions/${sessionId}/attendance`, { attendance });
