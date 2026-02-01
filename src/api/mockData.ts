import { Project } from '../types/project';
import { Sprint, WorkItem } from '../types/sprint';

export const mockMembers: { id: string; name: string; role: string; avatar: string }[] = [
    { id: '1', name: 'Alice JOHNSON', role: 'ADMIN', avatar: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', name: 'Bob SMITH', role: 'MEMBER', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', name: 'Charlie BROWN', role: 'MEMBER', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: '4', name: 'Diana PRINCE', role: 'VIEWER', avatar: 'https://i.pravatar.cc/150?u=4' },
];

const now = new Date();
const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

export const mockWorkItems: WorkItem[] = [
    {
        id: 'wi-1',
        title: 'Setup project structure',
        type: 'TASK',
        status: 'DONE',
        effort: 3,
        assigneeIds: ['1', '2'],
        deadline: oneWeekFromNow.toISOString(),
        carryCount: 0,
        sprintId: 'sp-1',
        createdAt: now.toISOString(),
    },
    {
        id: 'wi-2',
        title: 'Implement login page',
        type: 'FEATURE',
        status: 'DOING',
        effort: 5,
        assigneeIds: ['2'],
        deadline: oneWeekFromNow.toISOString(),
        carryCount: 0,
        sprintId: 'sp-1',
        createdAt: now.toISOString(),
    },
    {
        id: 'wi-3',
        title: 'Fix navigation bug',
        type: 'BUG',
        status: 'TODO',
        effort: 2,
        assigneeIds: ['3'],
        deadline: oneWeekFromNow.toISOString(),
        carryCount: 1,
        sprintId: 'sp-1',
        createdAt: now.toISOString(),
    },
];

export const mockSprints: Sprint[] = [
    {
        id: 'sp-1',
        name: 'Sprint 1',
        projectId: 'p-1',
        status: 'ACTIVE',
        startDate: now.toISOString(),
        endDate: oneWeekFromNow.toISOString(),
        workItems: mockWorkItems,
        plannedEffort: 10,
        completedEffort: 3,
    },
    {
        id: 'sp-2',
        name: 'Sprint 2',
        projectId: 'p-1',
        status: 'PLANNED',
        workItems: [],
        plannedEffort: 0,
        completedEffort: 0,
    }
];

export const mockProjects: Project[] = [
    {
        id: 'p-1',
        name: 'ODC Hub Filerouge',
        description: 'Project management tool for bootcamps.',
        createdBy: '1',
        members: ['1', '2', '3', '4'],
        createdAt: now.toISOString(),
        // Optional fields for UI simulation if needed by components utilizing them before API fetch
        progress: 45,
        riskScore: 25,
        activeSprintId: 'sp-1',
    },
];
