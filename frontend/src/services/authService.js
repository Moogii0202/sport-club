import { api } from "../api/api";

export const login = (phone, password, role) =>
  api.post("/login", { phone, password, role });

export const register = (data) =>
  api.post("/register", data);

export const forgotPassword = (phone) =>
  api.post("/forgot", { phone });

export const resetPassword = (token, newPassword) =>
  api.post("/reset-password", { token, newPassword });
