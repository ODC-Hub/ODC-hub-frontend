import api from "./axios";

export const getPlanning = () => api.get("/planning");
export const createPlanning = (data: any) => api.post("/planning", data);
export const updatePlanning = (id: string, data: any) =>
  api.patch(`/planning/${id}`, data);
export const deletePlanning = (id: string) =>
  api.delete(`/planning/${id}`);
