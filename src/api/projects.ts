// projectsApi.ts
import api from './axios';
import { ProjectResponse, ProjectKpiResponse } from './types';

export const createProject = (payload: {name:string,description?:string, memberIds:string[]}) =>
  api.post<ProjectResponse>('/projects', payload).then(r => r.data);

export const fetchProjectKpis = (projectId:string) =>
  api.get<ProjectKpiResponse>(`/kpis/project/${projectId}`).then(r => r.data);
