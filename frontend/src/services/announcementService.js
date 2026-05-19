import { api } from "../api/api";

export const getAnnouncements = () =>
  api.get("/announcements");

export const createAnnouncement = (title, body, targetRole) =>
  api.post("/announcements", { title, body, targetRole });

export const deleteAnnouncement = (id) =>
  api.delete(`/announcements/${id}`);
