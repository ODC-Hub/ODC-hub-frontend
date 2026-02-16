import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectApi, sprintApi } from '../../../api/filrouge';
import { Project, ProjectKpi } from '../../../types/project';
import { Sprint } from '../../../types/sprint';
import { ProjectOverview } from './ProjectOverview';
import { BoardView } from '../board/BoardView';
import { SprintManagement } from '../sprints/SprintManagement';
import { KpiDashboard } from '../kpis/KpiDashboard';
import { RetrospectivePanel } from '../retrospective/RetrospectivePanel';
import { MembersPanel } from './MembersPanel';
import {
    LayoutDashboard,
    KanbanSquare,
    Timer,
    BarChart3,
    MessageSquare,
    ChevronLeft,
    Settings,
    UserPlus,
    Users
} from 'lucide-react';

type TabType = 'overview' | 'board' | 'sprints' | 'kpis' | 'retrospective' | 'members' | 'members';

interface TabConfig {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabConfig[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'sprints', label: 'Sprints', icon: Timer },
    { id: 'board', label: 'Board', icon: KanbanSquare },
    { id: 'kpis', label: 'KPIs', icon: BarChart3 },
    { id: 'retrospective', label: 'Retrospective', icon: MessageSquare },
    { id: 'members', label: 'Members', icon: Users },
];

export function ProjectDetailPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [project, setProject] = useState<Project | null>(null);
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [kpis, setKpis] = useState<ProjectKpi | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (projectId) {
            fetchProjectData();
        }
    }, [projectId]);

    const fetchProjectData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [projectData, sprintsData, kpiData] = await Promise.all([
                projectApi.getProjectById(projectId!),
                sprintApi.getSprintsByProject(projectId!),
                projectApi.getProjectKpis(projectId!)
            ]);
            setProject(projectData);
            setSprints(sprintsData);
            setKpis(kpiData);
        } catch (err) {
            console.error('Failed to load project data:', err);
            setError('Failed to load project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const activeSprint = sprints.find(s => s.status === 'ACTIVE');

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading project...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error || 'Project not found'}</p>
                    <button
                        onClick={() => navigate('/projects')}
                        className="text-orange-600 hover:text-orange-700 underline"
                    >
                        Back to Projects
                    </button>
                </div>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <ProjectOverview project={project} sprints={sprints} kpis={kpis} />;
            case 'board':
                return <BoardView project={project} sprint={activeSprint} />;
            case 'sprints':
                return <SprintManagement project={project} sprints={sprints} onSprintUpdate={fetchProjectData} />;
            case 'kpis':
                return <KpiDashboard project={project} sprints={sprints} kpis={kpis} />;
            case 'retrospective':
                return <RetrospectivePanel project={project} sprints={sprints} />;
            case 'members':
                return (
                    <MembersPanel
                        project={project}
                        sprints={sprints}
                        onMemberUpdate={fetchProjectData}
                    />
                );
            default:
                return <ProjectOverview project={project} sprints={sprints} kpis={kpis} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                {/* Back to Projects */}
                <div className="p-4 border-b border-gray-200">
                    <Link
                        to="/projects"
                        className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Projects</span>
                    </Link>
                </div>

                {/* Project Info */}
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-bold text-lg text-gray-900 mb-1 truncate">{project.name}</h2>
                    <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>

                    {/* Team Members Preview */}
                    <div className="flex items-center gap-2 mt-3">
                        <div className="flex -space-x-2">
                            {project.members.slice(0, 4).map((memberId, idx) => (
                                <div
                                    key={memberId}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                                    style={{ zIndex: 10 - idx }}
                                >
                                    {idx + 1}
                                </div>
                            ))}
                        </div>
                        {project.members.length > 4 && (
                            <span className="text-xs text-gray-500">+{project.members.length - 4}</span>
                        )}
                        <button className="ml-auto p-1 hover:bg-gray-100 rounded">
                            <UserPlus className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="flex-1 p-3">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${isActive
                                    ? 'bg-orange-50 text-orange-600 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                                <span className="text-sm">{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}
