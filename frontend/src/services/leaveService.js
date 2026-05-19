import { api } from "../api/api";

export const getMyLeaves = () =>
  api.get("/leave");

export const getCoachLeaves = () =>
  api.get("/leave/coach");

export const createLeave = (data) =>
  api.post("/leave", data);

export const updateLeaveStatus = (id, status) =>
  api.patch(`/leave/${id}`, { status });

export const deleteLeave = (id) =>
  api.delete(`/leave/${id}`);
