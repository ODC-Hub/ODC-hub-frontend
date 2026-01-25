import api from "./axios";

export interface UserResponse {
    id: string;
    fullName: string;
    email: string;
    role: string;
}

export const getAllUsers = async () => {
    // Determine endpoints based on backend, assuming /admin/users based on AdminUserController
    const res = await api.get<UserResponse[]>("/admin/users");
    return res.data;
};
