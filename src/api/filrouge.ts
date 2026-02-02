import api from './axios';
import { Project, ProjectKpi } from '../types/project';
import { Sprint, WorkItem, CreateWorkItemRequest } from '../types/sprint';

// The base URL is already handled in axios.ts ('http://localhost:8080/api')
// So we just append the specific endpoints.
// Note: axios.ts baseUrl is .../api, so we don't need /api prefix here if it's already there?
// Let's check axios.ts again. It is http://localhost:8080/api
// So api.get('/filrouge/projects') will be http://localhost:8080/api/filrouge/projects
// Which matches the backend controller RequestMapping("/api/filrouge/projects")? 
// Wait, Controller says @RequestMapping("/api/filrouge/projects")
// So axios base is .../api
// URL should be /filrouge/projects.

// Re-using the imported 'api' instance removes local configuration issues.

// ... existing code ...

// Define a User type or reuse if available common location
interface UserDto {
    id: string;
    email: string;
    fullName?: string;
    role: string;
    avatarFileId?: string;
}

export const userApi = {
    searchUsers: async (query: string, role?: string): Promise<UserDto[]> => {
        const params: any = {};
        if (role) params.role = role;
        // /profile/search is under /api, so just /profile/search
        const response = await api.get('/profile/search', { params });
        const users: UserDto[] = response.data;
        if (!query) return users;
        return users.filter((u) =>
            u.email.toLowerCase().includes(query.toLowerCase()) ||
            (u.fullName && u.fullName.toLowerCase().includes(query.toLowerCase()))
        );
    }
};

export const projectApi = {
    getAllProjects: async (): Promise<Project[]> => {
        // ProjectController is @RequestMapping("/api/filrouge/projects")
        // axios base is /api
        // so we need /filrouge/projects
        const response = await api.get('/filrouge/projects');
        return response.data;
    },

    createProject: async (data: { name: string; description: string; memberIds: string[] }) => {
        const response = await api.post('/filrouge/projects', data);
        return response.data;
    },

    getProjectKpis: async (projectId: string): Promise<ProjectKpi> => {
        const response = await api.get(`/filrouge/kpis/project/${projectId}`);
        return response.data;
    },

    getProjectById: async (projectId: string): Promise<Project> => {
        const response = await api.get(`/filrouge/projects/${projectId}`);
        return response.data;
    },

    addMember: async (projectId: string, userId: string): Promise<Project> => {
        const response = await api.post(`/filrouge/projects/${projectId}/members/${userId}`);
        return response.data;
    },

    removeMember: async (projectId: string, userId: string): Promise<Project> => {
        const response = await api.delete(`/filrouge/projects/${projectId}/members/${userId}`);
        return response.data;
    }
};

export const sprintApi = {
    createSprint: async (projectId: string, data: { name: string; startDate: string; endDate: string }): Promise<Sprint> => {
        const response = await api.post(`/filrouge/sprints/project/${projectId}`, data);
        return response.data;
    },

    getSprintsByProject: async (projectId: string): Promise<Sprint[]> => {
        const response = await api.get(`/filrouge/sprints/project/${projectId}`);
        return response.data;
    },

    startSprint: async (sprintId: string): Promise<Sprint> => {
        const response = await api.post(`/filrouge/sprints/${sprintId}/start`);
        return response.data;
    },

    closeSprint: async (sprintId: string, nextSprintId: string): Promise<Sprint> => {
        const response = await api.post(`/filrouge/sprints/${sprintId}/close`, null, {
            params: { nextSprintId }
        });
        return response.data;
    },

    updateSprint: async (sprintId: string, data: { name: string; startDate: string; endDate: string }): Promise<Sprint> => {
        const response = await api.put(`/filrouge/sprints/${sprintId}`, data);
        return response.data;
    },
};

export const workItemApi = {
    createWorkItem: async (projectId: string, sprintId: string, data: CreateWorkItemRequest): Promise<WorkItem> => {
        const response = await api.post(`/filrouge/work-items/project/${projectId}/sprint/${sprintId}`, data);
        return response.data;
    },

    updateStatus: async (id: string, status: string): Promise<WorkItem> => {
        const response = await api.patch(`/filrouge/work-items/${id}/status`, { status });
        return response.data;
    },

    getKanban: async (sprintId: string): Promise<WorkItem[]> => {
        const response = await api.get(`/filrouge/work-items/sprint/${sprintId}`);
        return response.data;
    }
};
