import { useState, useEffect } from 'react';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import Button from '../../ui/button/Button';
import { Plus, Search } from 'lucide-react';
import { projectApi } from '@/api/filrouge';
import { Project } from '@/types/project';

export function ProjectsListPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectApi.getAllProjects();
                console.log("Fetched projects (Retry):", data);
                setProjects(data);
            } catch (err: any) {
                console.error("Failed to fetch projects (Retry)", JSON.stringify(err.response?.data || err, null, 2));
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
                        <p className="text-gray-500 dark:text-gray-400">Manage your team projects and sprints</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button className=' h-10' variant="primary" onClick={() => setCreateModalOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Project
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>

                {filteredProjects.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No projects found.</p>
                    </div>
                )}
            </div>

            <CreateProjectModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                onProjectCreated={() => {

                    window.location.reload();
                }}
            />
        </div>
    );
}
