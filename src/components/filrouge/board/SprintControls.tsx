import { Sprint } from '@/types/sprint';
import Button from '@/components/ui/button/Button';
import { CheckSquare, BarChart2 } from 'lucide-react';

interface SprintControlsProps {
    sprint: Sprint;
    progress: number;
    completedEffort: number;
    totalEffort: number;
    onCloseSprint: () => void;
    onExportRetrospective: () => void;
}

export function SprintControls({
    sprint,
    progress,
    completedEffort,
    totalEffort,
    onCloseSprint,
    onExportRetrospective
}: SprintControlsProps) {

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Sprint Info */}
            <div className="flex items-center gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-800">{sprint.name}</h2>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${sprint.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {sprint.status}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500">
                        {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'Not started'}
                        {' - '}
                        {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'No end date'}
                    </p>
                </div>
            </div>

            {/* Middle: Progress */}
            <div className="flex-1 max-w-md w-full mx-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Sprint Progress</span>
                    <span className="font-bold text-gray-900">{progress}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{completedEffort} pts done</span>
                    <span>{totalEffort} pts total</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <Button onClick={onExportRetrospective} variant="outline" size="sm">
                    <BarChart2 className="w-4 h-4 mr-2" />
                    Retrospective
                </Button>

                {sprint.status === 'ACTIVE' && (
                    <Button onClick={onCloseSprint} variant="primary" size="sm" className="bg-gray-900 hover:bg-gray-800 text-white">
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Close Sprint
                    </Button>
                )}
            </div>
        </div>
    );
}
