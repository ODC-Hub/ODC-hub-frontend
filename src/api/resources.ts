import api from './axios';
import { LivrableResponse, ResourceCreateRequest, ResourceResponse } from '../types/resource';

export const resourceApi = {
  getResourcesByModule: async (moduleId: string, validatedOnly = true): Promise<ResourceResponse[]> => {
    const response = await api.get<ResourceResponse[]>(`/resources/module/${moduleId}`, {
      params: { validatedOnly },
    });
    return response.data;
  },

  getAllResources: async (validatedOnly = true): Promise<ResourceResponse[]> => {
    const response = await api.get<ResourceResponse[]>('/resources', {
      params: { validatedOnly },
    });
    return response.data;
  },

  createResource: async (data: ResourceCreateRequest, file?: File): Promise<ResourceResponse> => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }

    const response = await api.post<ResourceResponse>('/resources', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  validateResource: async (id: string): Promise<void> => {
    await api.patch(`/resources/${id}/validate`);
  },

  deleteResource: async (id: string): Promise<void> => {
    await api.delete(`/resources/${id}`);
  },

  submitLivrable: async (resourceId: string, file: File, comment?: string): Promise<LivrableResponse> => {
    const formData = new FormData();
    const data = { resourceId, studentComment: comment };
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await api.post<LivrableResponse>('/livrables', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadFile: async (fileId: string, filename: string) => {
    const response = await api.get(`/files/${fileId}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  viewFile: async (fileId: string) => {
    const response = await api.get(`/files/${fileId}`, {
      responseType: 'blob',
    });

    const file = new Blob([response.data], { type: response.headers['content-type'] });
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
  },

  reviewLivrable: async (id: string, status: string, comment?: string): Promise<LivrableResponse> => {
    const response = await api.patch<LivrableResponse>(`/livrables/${id}/review`, null, {
      params: { status, comment },
    });
    return response.data;
  },

  getLivrablesByResource: async (resourceId: string): Promise<LivrableResponse[]> => {
    const response = await api.get<LivrableResponse[]>(`/livrables/resource/${resourceId}`);
    return response.data;
  },

  getMyLivrables: async (): Promise<LivrableResponse[]> => {
    const response = await api.get<LivrableResponse[]>('/livrables/me');
    return response.data;
  },
};
