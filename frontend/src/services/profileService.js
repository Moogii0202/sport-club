import { api } from "../api/api";

export const getProfile = () =>
  api.get("/profile");

export const updateProfile = (data) =>
  api.put("/profile", data);

export const updateProfileImage = (image) =>
  api.put("/profile/image", { image });

export const changePassword = (currentPassword, newPassword) =>
  api.put("/profile/password", { currentPassword, newPassword });
