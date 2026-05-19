import { api } from "../api/api";

export const getHalls = () =>
  api.get("/halls");

export const createHall = (data) =>
  api.post("/halls", data);

export const updateHall = (id, data) =>
  api.put(`/halls/${id}`, data);

export const deleteHall = (id) =>
  api.delete(`/halls/${id}`);
