import api from "./axios";

export const createSprint = (projectId:string, payload:{name:string,startDate?:string,endDate?:string}) =>
  api.post(`/sprints/project/${projectId}`, payload).then(r => r.data);

export const startSprint = (sprintId:string) =>
  api.post(`/sprints/${sprintId}/start`).then(r => r.data);

export const closeSprint = (sprintId:string, nextSprintId:string) =>
  api.post(`/sprints/${sprintId}/close`, null, { params: { nextSprintId }});
