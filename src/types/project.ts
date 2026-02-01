export interface ProjectMember {
    id: string; // User ID
    // Name/Avatar might need to be fetched separately or enriched
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    createdBy: string;
    members: string[]; // List of user IDs
    createdAt: string;
    // Computed fields (not in raw backend response, but needed for UI)
    progress?: number;
    riskScore?: number;
    activeSprintId?: string;
}

export interface SprintKpi {
    sprintId: string;
    plannedEffort: number;
    completedEffort: number;
    progressPercentage: number;
    overdueItems: number;
    riskScore: number;
}

export interface ProjectKpi {
    projectId: string;
    globalProgress: number;
    sprintKpis: SprintKpi[];
}
