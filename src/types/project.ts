export interface ProjectMember {
    id: string; // User ID
    
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    createdBy: string;
    members: string[]; // List of user IDs
    createdAt: string;
    
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
