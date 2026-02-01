
export type Id = string;

export interface ProjectResponse {
  id: Id;
  name: string;
  description?: string;
  createdBy: Id;
  members: string[]; // user ids
  createdAt: string; // Instant -> ISO string
}

export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'CLOSED';
export interface SprintResponse {
  id: Id;
  projectId: Id;
  name: string;
  startDate?: string; // ISO
  endDate?: string;   // ISO
  status: SprintStatus;
  plannedEffort?: number | null;
}

// Work item enums: confirm exact enum names with backend, but the controller implies types exist.
// Use these as likely values; adjust if backend differs.
export type WorkItemType = 'TASK' | 'BUG' | 'FEATURE';
export type WorkItemStatus = 'TODO' | 'DOING' | 'DONE';

export interface WorkItemResponse {
  id: Id;
  projectId: Id;
  sprintId: Id;
  title: string;
  description?: string;
  type: WorkItemType;
  status: WorkItemStatus;
  effort?: number | null;
  deadline?: string | null; // ISO
  assignedUserIds: string[];
  carryCount?: number;
}

/* KPI / Retrospective */
export interface SprintKpiResponse {
  sprintId: Id;
  plannedEffort: number;
  completedEffort: number;
  progressPercentage: number;
  overdueItems: number;
  riskScore: number;
}
export interface ProjectKpiResponse {
  projectId: Id;
  globalProgress: number;
  sprintKpis: SprintKpiResponse[];
}
export interface SprintRetrospectiveResponse {
  sprintId: Id;
  plannedEffort: number;
  completedEffort: number;
  carryoverTasks: number;
  overdueTasks: number;
  reliabilityScore: number;
}
export interface SprintVelocityResponse {
  sprintId: Id;
  completedEffort: number;
}
export interface UserKpiResponse {
  userId: Id;
  assignedEffort: number;
  completedEffort: number;
  overdueTasks: number;
  deliveryScore: number;
}
