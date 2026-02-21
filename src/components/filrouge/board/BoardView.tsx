/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { WorkItem, WorkItemStatus } from '../../../types/sprint';
import { Project } from '../../../types/project';
import { Sprint } from '../../../types/sprint';
import { SprintBoard } from './SprintBoard';
import { SprintControls } from './SprintControls';
import { Play } from 'lucide-react';
import { WorkItemModal } from './WorkItemModal';
import * as workItemApi from '../../../api/workItems';
import { userApi } from '../../../api/filrouge';
import { toast } from 'react-hot-toast';

interface BoardViewProps {
    project: Project;
    sprint?: Sprint;
}

interface User {
    id: string;
    email: string;
    fullName?: string;
    role: string;
    avatarFileId?: string;
}

export function BoardView({ project, sprint }: BoardViewProps) {
    const [workItems, setWorkItems] = useState<WorkItem[]>([]);
    const [projectMembers, setProjectMembers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedItem, setSelectedItem] = useState<WorkItem | undefined>(undefined);
    const [activeStatus, setActiveStatus] = useState<WorkItemStatus>('TODO');

    const fetchMembers = async () => {
        try {

            const allUsers = await userApi.searchUsers('', 'BOOTCAMPER');
            const members = allUsers.filter(u => project?.members?.includes(u.id));
            setProjectMembers(members);
        } catch (error) {
            console.error("Failed to fetch project members", error);
        }
    };

    const refreshKanban = async () => {
        if (sprint) {
            try {
                const items = await workItemApi.fetchKanban(sprint.id);
                setWorkItems(items);
            } catch (error) {
                toast.error("Failed to fetch work items");
            }
        }
    };

    useEffect(() => {
        refreshKanban();
        fetchMembers();
    }, [sprint, project?.id]);

    const handleWorkItemMove = async (item: WorkItem, newStatus: WorkItemStatus) => {
        try {
            await workItemApi.updateWorkItemStatus(item.id, newStatus);
            setWorkItems(prev => prev.map(wi =>
                wi.id === item.id ? { ...wi, status: newStatus } : wi
            ));
            toast.success(`Moved to ${newStatus}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to move item");
            refreshKanban(); // Revert on error
        }
    };

    const handleWorkItemClick = (item: WorkItem) => {
        setSelectedItem(item);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleAddWorkItem = (status: WorkItemStatus) => {
        setActiveStatus(status);
        setModalMode('create');
        setSelectedItem(undefined);
        setIsModalOpen(true);
    };

    const handleSaveWorkItem = async (data: Partial<WorkItem>) => {
        if (!sprint || !project) return;

        try {
            if (modalMode === 'create') {
                await workItemApi.createWorkItem(project.id, sprint.id, data);
                toast.success("Work item created");
            } else if (selectedItem) {
                toast.success("Work item updated");
            }
            setIsModalOpen(false);
            refreshKanban();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save work item");
        }
    };

    const handleCloseSprint = () => {
        console.log("Close sprint");
        toast.success("Please select the next sprint to carry over unfinished work", { icon: 'ℹ️' });
    };

    const handleExportRetrospective = () => {
        console.log("Export retro");
    };


    // Temporary: If no sprint, show empty state
    if (!sprint) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full">
                    <Play className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">No Active Sprint</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Start a planned sprint to begin tracking work items on the board.
                </p>
            </div>
        );
    }

    const totalEffort = workItems.reduce((sum, wi) => sum + (wi.effort || 0), 0);
    const completedEffort = workItems.filter(wi => wi.status === 'DONE').reduce((sum, wi) => sum + (wi.effort || 0), 0);
    const progress = totalEffort > 0 ? Math.round((completedEffort / totalEffort) * 100) : 0;

    return (
        <div className="space-y-6">
            <SprintControls
                sprint={sprint}
                progress={progress}
                completedEffort={completedEffort}
                totalEffort={totalEffort}
                onCloseSprint={handleCloseSprint}
                onExportRetrospective={handleExportRetrospective}
            />

            <div className="h-[calc(100vh-250px)]">
                <SprintBoard
                    workItems={workItems}
                    onWorkItemMove={handleWorkItemMove}
                    onWorkItemClick={handleWorkItemClick}
                    onAddWorkItem={handleAddWorkItem}
                />
            </div>

            {isModalOpen && (
                <WorkItemModal
                    mode={modalMode}
                    workItem={selectedItem}
                    initialStatus={activeStatus}
                    members={projectMembers}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveWorkItem}
                />
            )}
        </div>
    );
}
