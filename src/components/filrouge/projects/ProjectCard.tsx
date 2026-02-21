import { Project } from '../../../types/project';
import { Link } from 'react-router-dom';
import { Activity, Users } from 'lucide-react';
import { mockSprints } from '../../../api/mockData';

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    // Mock finding active sprint name
    const activeSprint = mockSprints.find(s => s.projectId === project.id && s.status === 'ACTIVE');

    return (
        <Link to={`/projects/${project.id}`} className="block h-full">
            <div className="h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-700 transition-all group">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">
                            {project.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                            {project.description}
                        </p>
                    </div>
                    <div className="relative w-12 h-12 flex items-center justify-center">
                        {/* Simple Ring Chart Placeholder */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="24" cy="24" r="20" stroke="#f3f4f6" strokeWidth="4" fill="transparent" />
                            <circle
                                cx="24" cy="24" r="20"
                                stroke="#f97316"
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={125.6}
                                strokeDashoffset={125.6 - (125.6 * (project.progress || 0)) / 100}
                                className="transition-all duration-1000"
                            />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-gray-700 dark:text-gray-300">{project.progress || 0}%</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {/* Active Sprint */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                        <Activity className="w-4 h-4 text-orange-500" />
                        <span className="font-medium">Sprint:</span>
                        <span className="truncate">{activeSprint ? activeSprint.name : 'No active sprint'}</span>
                    </div>

                    {/* KPI Summary */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            <span>{project.members?.length || 0} Members</span>

                        </div>

                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${(project.riskScore || 0) < 30 ? 'bg-green-500' :
                                (project.riskScore || 0) < 60 ? 'bg-orange-500' : 'bg-red-500'
                                }`} />
                            <span>Risk Score: {project.riskScore || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
