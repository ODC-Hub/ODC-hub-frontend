export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'CLOSED';
export type WorkItemType = 'TASK' | 'RESEARCH' | 'DELIVERABLE' | 'REVIEW';
export type WorkItemStatus = 'TODO' | 'DOING' | 'DONE';

export interface WorkItem {
    id: string;
    title: string;
    description?: string;
    type: WorkItemType;
    status: WorkItemStatus;
    effort: number;
    assignedUserIds: string[];
    deadline: string; // ISO date string
    carryCount: number;
    sprintId: string;
    createdAt: string;
}

export interface Sprint {
    id: string;
    name: string;
    projectId: string;
    status: SprintStatus;
    startDate?: string;
    endDate?: string;
    goal?: string;
    workItems: WorkItem[];
    plannedEffort: number;
    completedEffort: number; // Computed on close or periodically
}

export interface CreateWorkItemRequest {
    title: string;
    type: WorkItemType;
    effort: number;
    deadline: string;
    assignedUserIds: string[];
}
