import api from "./axios";

export const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  await api.patch("/auth/change-password", payload);
};
