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
