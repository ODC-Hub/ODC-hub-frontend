import { Project, ProjectKpi } from '../../../types/project';
import { Sprint } from '../../../types/sprint';
import { Activity, TrendingUp } from 'lucide-react';

interface ProjectOverviewProps {
    project: Project;
    sprints: Sprint[];
    kpis: ProjectKpi | null;
}

export function ProjectOverview({ project, sprints, kpis }: ProjectOverviewProps) {
    const activeSprints = sprints.filter(s => s.status === 'ACTIVE');
    const completedSprints = sprints.filter(s => s.status === 'CLOSED');

   
    const progress = kpis
        ? Math.round(kpis.globalProgress)
        : (sprints.reduce((sum, s) => sum + (s.plannedEffort || 0), 0) > 0
            ? Math.round((sprints.reduce((sum, s) => sum + (s.completedEffort || 0), 0) / sprints.reduce((sum, s) => sum + (s.plannedEffort || 0), 0)) * 100)
            : 0);

    const recentActivities = [
        ...sprints
            .filter(s => s.status === 'ACTIVE')
            .map(s => ({
                id: `sprint-started-${s.id}`,
                text: `Sprint "${s.name}" started with ${s.plannedEffort || 0} story points`,
                time: '4 days ago',
                type: 'sprint-start' as const
            })),
        ...completedSprints.slice(0, 2).map(s => ({
            id: `sprint-completed-${s.id}`,
            text: `Sprint "${s.name}" completed with ${s.completedEffort || 0}/${s.plannedEffort || 0} points`,
            time: '2 weeks ago',
            type: 'sprint-complete' as const
        }))
    ].slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Progress Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="#f3f4f6"
                                    strokeWidth="12"
                                    fill="transparent"
                                />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="#f97316"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={351.68}
                                    strokeDashoffset={351.68 - (351.68 * progress) / 100}
                                    className="transition-all duration-1000"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-bold text-gray-900">{progress}%</span>
                            </div>
                        </div>
                        <h3 className="text-sm text-gray-600 mt-4 font-medium">Progress</h3>
                    </div>
                </div>

                {/* Active Sprints Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                            {activeSprints.length}
                        </div>
                        <h3 className="text-sm text-gray-600 font-medium mb-1">Active Sprints</h3>
                        <p className="text-xs text-gray-500">
                            {completedSprints.length} completed
                        </p>
                    </div>
                </div>

                {/* Team Members Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                            {project.members?.length || 0}
                        </div>
                        <h3 className="text-sm text-gray-600 font-medium mb-1">Team Members</h3>
                        <div className="flex -space-x-2 mt-2">
                            {project.members.slice(0, 5).map((memberId, idx) => (
                                <div
                                    key={memberId}
                                    className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white flex items-center justify-center text-white text-xs font-medium"
                                    style={{ zIndex: 10 - idx }}
                                >
                                    {idx + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>

                {recentActivities.length > 0 ? (
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                <div className={`p-2 rounded-lg ${activity.type === 'sprint-start'
                                    ? 'bg-green-100'
                                    : 'bg-blue-100'
                                    }`}>
                                    {activity.type === 'sprint-start' ? (
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Activity className="w-4 h-4 text-blue-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">{activity.text}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No recent activity</p>
                        <p className="text-gray-400 text-xs mt-1">Start a sprint to see activity here</p>
                    </div>
                )}
            </div>

            {/* Sprint Summary */}
            {sprints.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Sprint Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{sprints.length}</div>
                            <div className="text-xs text-gray-600 mt-1">Total Sprints</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{completedSprints.length}</div>
                            <div className="text-xs text-gray-600 mt-1">Completed</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{activeSprints.length}</div>
                            <div className="text-xs text-gray-600 mt-1">Active</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {sprints.filter(s => s.status === 'PLANNED').length}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Planned</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
