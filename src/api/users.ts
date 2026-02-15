import api from './axios';

export interface UserResponseDto {
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatarFileId?: string;
}

export interface UserSearchFilters {
    role?: string;
}

export const userApi = {
    searchUsers: async (filters: UserSearchFilters): Promise<UserResponseDto[]> => {
        const params = new URLSearchParams();
        if (filters.role) params.append('role', filters.role);

        const response = await api.get(`/profile/search?${params.toString()}`);
        return response.data;
    },
};
