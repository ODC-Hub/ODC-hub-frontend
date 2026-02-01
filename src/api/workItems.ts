import api from "./axios";

export const createWorkItem = (projectId: string, sprintId: string, payload: any) =>
  api.post(`/filrouge/work-items/project/${projectId}/sprint/${sprintId}`, payload).then(r => r.data);

export const updateWorkItemStatus = (id: string, status: string) =>
  api.patch(`/filrouge/work-items/${id}/status`, { status }).then(r => r.data);

export const fetchKanban = (sprintId: string) =>
  api.get(`/filrouge/work-items/sprint/${sprintId}`).then(r => r.data);
