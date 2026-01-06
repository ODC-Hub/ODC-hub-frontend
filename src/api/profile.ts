import api from "./axios";

export interface Profile {
  email: string;
  fullName: string;
  role: string;
  phone?: string;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  avatarFileId?: string;
  updatedAt?: string;
}

export const getMyProfile = async () => {
  const res = await api.get<Profile>("/profile");
  return res.data;
};

export const updateProfile = async (payload: Partial<Profile>) => {
  const res = await api.patch<Profile>("/profile", payload);
  return res.data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/users/avatar/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
