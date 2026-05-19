import { api } from "../api/api";

export const getPublicSchedule = () =>
  api.get("/schedule");

export const getEnrolledSchedule = () =>
  api.get("/schedule/enrolled");

export const getMySchedule = () =>
  api.get("/schedule/my");

export const getScheduleByDay = (day) =>
  api.get(`/schedule/by-day?day=${encodeURIComponent(day)}`);

export const createSchedule = (data) =>
  api.post("/schedule", data);

export const deleteSchedule = (id) =>
  api.delete(`/schedule/${id}`);
